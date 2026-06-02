use std::{
    ffi::c_void,
    ptr::NonNull,
    sync::mpsc as std_mpsc,
    thread::{self, JoinHandle},
};

use objc2_core_foundation::{CFMachPort, CFRunLoop, kCFRunLoopCommonModes};
use objc2_core_graphics::{
    CGEvent, CGEventField, CGEventFlags, CGEventTapLocation, CGEventTapOptions,
    CGEventTapPlacement, CGEventTapProxy, CGEventType,
};
use tokio::sync::mpsc;

const C_KEY_CODE: i64 = 8;

/// Handle for stopping a running Cmd+C event tap.
pub struct CmdCTapHandle {
    stop_sender: Option<std_mpsc::Sender<()>>,
    thread: Option<JoinHandle<()>>,
}

impl CmdCTapHandle {
    /// Requests the event tap thread to stop and waits for it to finish.
    pub fn stop(&mut self) {
        if let Some(stop_sender) = self.stop_sender.take() {
            _ = stop_sender.send(());
        }

        if let Some(thread) = self.thread.take() {
            if let Err(e) = thread.join() {
                tauri_plugin_log::log::warn!("Failed to join Cmd+C event tap thread: {e:?}");
            }
        }
    }
}

impl Drop for CmdCTapHandle {
    fn drop(&mut self) {
        self.stop();
    }
}

/// Starts a macOS listen-only event tap for Cmd+C key-down events.
pub fn start_cmd_c_tap(sender: mpsc::UnboundedSender<()>) -> anyhow::Result<CmdCTapHandle> {
    let (stop_sender, stop_receiver) = std_mpsc::channel();
    let thread = thread::Builder::new()
        .name("konjac-copy-key-tap".to_owned())
        .spawn(move || {
            if let Err(e) = run_event_tap(sender, stop_receiver) {
                tauri_plugin_log::log::warn!("Failed to run Cmd+C event tap: {e:?}");
            }
        })?;

    Ok(CmdCTapHandle {
        stop_sender: Some(stop_sender),
        thread: Some(thread),
    })
}

fn run_event_tap(
    sender: mpsc::UnboundedSender<()>,
    stop_receiver: std_mpsc::Receiver<()>,
) -> anyhow::Result<()> {
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

    loop {
        match stop_receiver.try_recv() {
            Ok(()) | Err(std_mpsc::TryRecvError::Disconnected) => break,
            Err(std_mpsc::TryRecvError::Empty) => {}
        }

        CFRunLoop::run_in_mode(unsafe { kCFRunLoopCommonModes }, 0.1, false);
    }

    drop_sender(sender);

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
