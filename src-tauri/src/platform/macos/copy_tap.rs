use std::{ffi::c_void, ptr::NonNull};

use objc2_core_foundation::{CFMachPort, CFRunLoop, kCFRunLoopCommonModes};
use objc2_core_graphics::{
    CGEvent, CGEventField, CGEventFlags, CGEventTapLocation, CGEventTapOptions,
    CGEventTapPlacement, CGEventTapProxy, CGEventType,
};
use tokio::sync::mpsc;

const C_KEY_CODE: i64 = 8;

/// Starts a macOS listen-only event tap for Cmd+C key-down events.
pub fn start_cmd_c_tap(sender: mpsc::UnboundedSender<()>) -> anyhow::Result<()> {
    std::thread::Builder::new()
        .name("konjac-copy-key-tap".to_owned())
        .spawn(move || {
            if let Err(e) = run_event_tap(sender) {
                tauri_plugin_log::log::warn!("Failed to run Cmd+C event tap: {e:?}");
            }
        })?;

    Ok(())
}

fn run_event_tap(sender: mpsc::UnboundedSender<()>) -> anyhow::Result<()> {
    let sender = Box::into_raw(Box::new(sender));
    let event_mask = 1u64 << CGEventType::KeyDown.0;

    // SAFETY: The callback keeps `sender` as an opaque pointer for the process lifetime.
    let Some(tap) = (unsafe {
        CGEvent::tap_create(
            CGEventTapLocation::SessionEventTap,
            CGEventTapPlacement::HeadInsertEventTap,
            CGEventTapOptions::ListenOnly,
            event_mask,
            Some(event_tap_callback),
            sender.cast(),
        )
    }) else {
        drop_sender(sender);
        anyhow::bail!("CGEventTapCreate returned null");
    };

    let Some(source) = CFMachPort::new_run_loop_source(None, Some(&tap), 0) else {
        drop_sender(sender);
        anyhow::bail!("CFMachPortCreateRunLoopSource returned null");
    };

    let Some(run_loop) = CFRunLoop::current() else {
        drop_sender(sender);
        anyhow::bail!("CFRunLoopGetCurrent returned null");
    };

    run_loop.add_source(Some(&source), unsafe { kCFRunLoopCommonModes });
    CFRunLoop::run();

    Ok(())
}

fn drop_sender(sender: *mut mpsc::UnboundedSender<()>) {
    // SAFETY: This only runs before the event tap enters its run loop, so the callback cannot
    // access the boxed sender after it is reclaimed.
    unsafe {
        drop(Box::from_raw(sender));
    }
}

unsafe extern "C-unwind" fn event_tap_callback(
    _proxy: CGEventTapProxy,
    event_type: CGEventType,
    event: NonNull<CGEvent>,
    user_info: *mut c_void,
) -> *mut CGEvent {
    if event_type == CGEventType::KeyDown && !user_info.is_null() {
        // SAFETY: CoreGraphics provides a valid event during the callback.
        let event_ref = unsafe { event.as_ref() };

        if is_copy_key_down(event_ref) {
            // SAFETY: `user_info` is the boxed sender created by `run_event_tap`.
            let sender = unsafe { &*(user_info.cast::<mpsc::UnboundedSender<()>>()) };
            _ = sender.send(());
        }
    }

    event.as_ptr()
}

fn is_copy_key_down(event: &CGEvent) -> bool {
    let key_code = CGEvent::integer_value_field(Some(event), CGEventField::KeyboardEventKeycode);
    let autorepeat =
        CGEvent::integer_value_field(Some(event), CGEventField::KeyboardEventAutorepeat);
    let flags = CGEvent::flags(Some(event));

    key_code == C_KEY_CODE && autorepeat == 0 && is_plain_command(flags)
}

fn is_plain_command(flags: CGEventFlags) -> bool {
    flags.contains(CGEventFlags::MaskCommand)
        && !flags.intersects(
            CGEventFlags::MaskShift | CGEventFlags::MaskControl | CGEventFlags::MaskAlternate,
        )
}
