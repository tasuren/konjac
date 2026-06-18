use std::{
    ptr,
    thread::{self, JoinHandle},
    time::{Duration, Instant},
};

use tauri_plugin_log::log;
use tokio::sync::mpsc;
use windows::Win32::{
    Foundation::{GetLastError, HGLOBAL, HINSTANCE, HWND, LPARAM, LRESULT, WPARAM},
    System::{
        DataExchange::{
            AddClipboardFormatListener, CloseClipboard, GetClipboardData, OpenClipboard,
            RegisterClipboardFormatW, RemoveClipboardFormatListener,
        },
        LibraryLoader::GetModuleHandleW,
        Memory::{GlobalLock, GlobalSize, GlobalUnlock},
        Ole::CF_UNICODETEXT,
        Threading::GetCurrentThreadId,
    },
    UI::{
        Input::KeyboardAndMouse::{
            GetAsyncKeyState, VK_C, VK_CONTROL, VK_LCONTROL, VK_LMENU, VK_LSHIFT, VK_LWIN, VK_MENU,
            VK_RCONTROL, VK_RMENU, VK_RSHIFT, VK_RWIN, VK_SHIFT,
        },
        WindowsAndMessaging::{
            CallNextHookEx, CreateWindowExW, DefWindowProcW, DestroyWindow, DispatchMessageW,
            GetMessageW, HHOOK, HWND_MESSAGE, KBDLLHOOKSTRUCT, MSG, PostThreadMessageW,
            RegisterClassW, SetWindowsHookExW, TranslateMessage, UnhookWindowsHookEx,
            WH_KEYBOARD_LL, WINDOW_EX_STYLE, WINDOW_STYLE, WM_APP, WM_CLIPBOARDUPDATE, WM_KEYDOWN,
            WM_KEYUP, WM_SYSKEYDOWN, WM_SYSKEYUP, WNDCLASSW,
        },
    },
};

use crate::quick_copy_translate::DoublePressDetector;

const WINDOW_CLASS_NAME: windows::core::PCWSTR =
    windows::core::w!("KonjacQuickCopyClipboardWindow");
const WM_KONJAC_COPY_KEY_DOWN: u32 = WM_APP + 1;
const WM_KONJAC_COPY_KEY_UP: u32 = WM_APP + 2;
const WM_KONJAC_STOP: u32 = WM_APP + 3;

/// Clipboard content captured after a repeated copy shortcut on Windows.
pub struct CapturedClipboard {
    pub raw_text: String,
    pub html: Option<String>,
    pub format: CapturedClipboardFormat,
}

/// Source clipboard format before app-side normalization.
pub enum CapturedClipboardFormat {
    PlainText,
    Html,
}

/// Handle for stopping a running Windows quick-copy monitor.
pub struct QuickCopyMonitorHandle {
    thread_id: u32,
    thread: Option<JoinHandle<()>>,
}

impl QuickCopyMonitorHandle {
    /// Requests the monitor thread to stop and waits for it to finish.
    pub fn stop(&mut self) {
        if self.thread.is_none() {
            return;
        }

        unsafe {
            _ = PostThreadMessageW(self.thread_id, WM_KONJAC_STOP, WPARAM(0), LPARAM(0));
        }

        if let Some(thread) = self.thread.take()
            && let Err(e) = thread.join()
        {
            log::warn!("Failed to join Windows quick-copy monitor thread: {e:?}");
        }
    }
}

impl Drop for QuickCopyMonitorHandle {
    fn drop(&mut self) {
        self.stop();
    }
}

/// Starts a Windows monitor for repeated Ctrl+C clipboard capture.
pub fn start_quick_copy_monitor(
    sender: mpsc::UnboundedSender<CapturedClipboard>,
    double_press_interval_ms: u64,
    clipboard_wait_ms: u64,
) -> anyhow::Result<QuickCopyMonitorHandle> {
    let (ready_sender, ready_receiver) = std::sync::mpsc::sync_channel(1);
    let thread = thread::Builder::new()
        .name("konjac-windows-quick-copy".to_owned())
        .spawn(move || {
            let result = run_monitor(
                sender,
                double_press_interval_ms,
                clipboard_wait_ms,
                ready_sender,
            );

            if let Err(e) = &result {
                log::warn!("Failed to run Windows quick-copy monitor: {e:?}");
            }
        })?;

    let thread_id = match ready_receiver.recv() {
        Ok(Ok(thread_id)) => thread_id,
        Ok(Err(e)) => {
            _ = thread.join();
            return Err(e);
        }
        Err(e) => {
            _ = thread.join();
            anyhow::bail!("Windows quick-copy monitor ended before startup completed: {e}");
        }
    };

    Ok(QuickCopyMonitorHandle {
        thread_id,
        thread: Some(thread),
    })
}

struct MonitorResources {
    hwnd: HWND,
    hook: HHOOK,
}

impl MonitorResources {
    fn cleanup(&self) {
        unsafe {
            if let Err(e) = RemoveClipboardFormatListener(self.hwnd) {
                log::warn!("Failed to remove clipboard listener: {e:?}");
            }

            if let Err(e) = UnhookWindowsHookEx(self.hook) {
                log::warn!("Failed to unhook Windows keyboard hook: {e:?}");
            }

            if let Err(e) = DestroyWindow(self.hwnd) {
                log::warn!("Failed to destroy clipboard listener window: {e:?}");
            }
        }
    }
}

fn create_monitor_resources() -> anyhow::Result<MonitorResources> {
    unsafe {
        let module = GetModuleHandleW(None)?;
        let instance = HINSTANCE(module.0);
        let window_class = WNDCLASSW {
            lpfnWndProc: Some(window_proc),
            hInstance: instance,
            lpszClassName: WINDOW_CLASS_NAME,
            ..Default::default()
        };

        RegisterClassW(&window_class);

        let hwnd = CreateWindowExW(
            WINDOW_EX_STYLE::default(),
            WINDOW_CLASS_NAME,
            WINDOW_CLASS_NAME,
            WINDOW_STYLE::default(),
            0,
            0,
            0,
            0,
            Some(HWND_MESSAGE),
            None,
            Some(instance),
            None,
        )?;

        AddClipboardFormatListener(hwnd)?;

        let hook = SetWindowsHookExW(
            WH_KEYBOARD_LL,
            Some(keyboard_hook_callback),
            Some(instance),
            0,
        )?;

        Ok(MonitorResources { hwnd, hook })
    }
}

unsafe extern "system" fn window_proc(
    hwnd: HWND,
    msg: u32,
    wparam: WPARAM,
    lparam: LPARAM,
) -> LRESULT {
    unsafe { DefWindowProcW(hwnd, msg, wparam, lparam) }
}

unsafe extern "system" fn keyboard_hook_callback(
    code: i32,
    wparam: WPARAM,
    lparam: LPARAM,
) -> LRESULT {
    if code >= 0 {
        let message = wparam.0 as u32;

        if message == WM_KEYDOWN
            || message == WM_SYSKEYDOWN
            || message == WM_KEYUP
            || message == WM_SYSKEYUP
        {
            let keyboard = unsafe { &*(lparam.0 as *const KBDLLHOOKSTRUCT) };

            if keyboard.vkCode == VK_C.0 as u32 {
                match message {
                    WM_KEYDOWN | WM_SYSKEYDOWN if is_plain_ctrl_pressed() => {
                        _ = unsafe {
                            PostThreadMessageW(
                                GetCurrentThreadId(),
                                WM_KONJAC_COPY_KEY_DOWN,
                                WPARAM(0),
                                LPARAM(0),
                            )
                        };
                    }
                    WM_KEYUP | WM_SYSKEYUP => {
                        _ = unsafe {
                            PostThreadMessageW(
                                GetCurrentThreadId(),
                                WM_KONJAC_COPY_KEY_UP,
                                WPARAM(0),
                                LPARAM(0),
                            )
                        };
                    }
                    _ => {}
                }
            }
        }
    }

    unsafe { CallNextHookEx(None, code, wparam, lparam) }
}

fn is_plain_ctrl_pressed() -> bool {
    let ctrl = is_key_pressed(VK_CONTROL.0)
        || is_key_pressed(VK_LCONTROL.0)
        || is_key_pressed(VK_RCONTROL.0);
    let shift =
        is_key_pressed(VK_SHIFT.0) || is_key_pressed(VK_LSHIFT.0) || is_key_pressed(VK_RSHIFT.0);
    let alt = is_key_pressed(VK_MENU.0) || is_key_pressed(VK_LMENU.0) || is_key_pressed(VK_RMENU.0);
    let win = is_key_pressed(VK_LWIN.0) || is_key_pressed(VK_RWIN.0);

    ctrl && !shift && !alt && !win
}

fn is_key_pressed(key: u16) -> bool {
    unsafe { (GetAsyncKeyState(key as i32) as u16 & 0x8000) != 0 }
}

fn run_monitor(
    sender: mpsc::UnboundedSender<CapturedClipboard>,
    double_press_interval_ms: u64,
    clipboard_wait_ms: u64,
    ready_sender: std::sync::mpsc::SyncSender<anyhow::Result<u32>>,
) -> anyhow::Result<()> {
    let thread_id = unsafe { GetCurrentThreadId() };
    let resources = match create_monitor_resources() {
        Ok(resources) => resources,
        Err(e) => {
            _ = ready_sender.send(Err(anyhow::anyhow!("{e:?}")));
            return Err(e);
        }
    };

    if ready_sender.send(Ok(thread_id)).is_err() {
        resources.cleanup();
        return Ok(());
    }

    let mut detector = DoublePressDetector::new(Duration::from_millis(double_press_interval_ms));
    let clipboard_wait = Duration::from_millis(clipboard_wait_ms);
    let mut pending_until = None;
    let mut c_is_down = false;
    let mut msg = MSG::default();

    loop {
        let result = unsafe { GetMessageW(&mut msg, None, 0, 0) };

        if result.0 == -1 {
            let error = unsafe { GetLastError() };
            resources.cleanup();
            anyhow::bail!("GetMessageW failed: {error:?}");
        }

        if result.0 == 0 {
            break;
        }

        match msg.message {
            WM_KONJAC_STOP => break,
            WM_KONJAC_COPY_KEY_DOWN => {
                if c_is_down {
                    continue;
                }

                c_is_down = true;
                if detector.push(Instant::now()) {
                    pending_until = Some(Instant::now() + clipboard_wait);
                }
            }
            WM_KONJAC_COPY_KEY_UP => {
                c_is_down = false;
            }
            WM_CLIPBOARDUPDATE => {
                let Some(deadline) = pending_until else {
                    continue;
                };

                pending_until = None;
                c_is_down = false;

                if Instant::now() > deadline {
                    continue;
                }

                match read_clipboard() {
                    Ok(Some(captured)) => {
                        _ = sender.send(captured);
                    }
                    Ok(None) => {}
                    Err(e) => {
                        log::warn!("Failed to read quick-copy clipboard content: {e:?}");
                    }
                }
            }
            _ => unsafe {
                _ = TranslateMessage(&msg);
                DispatchMessageW(&msg);
            },
        }
    }

    resources.cleanup();

    Ok(())
}

fn read_clipboard() -> anyhow::Result<Option<CapturedClipboard>> {
    let _guard = ClipboardGuard::open()?;
    let raw_text = read_plain_text_clipboard()?.filter(|text| !text.trim().is_empty());

    if let Some(html) = read_html_clipboard()?
        && !html.trim().is_empty()
    {
        return Ok(Some(CapturedClipboard {
            raw_text: raw_text.unwrap_or_else(|| html.clone()),
            html: Some(html),
            format: CapturedClipboardFormat::Html,
        }));
    }

    if let Some(text) = raw_text {
        return Ok(Some(CapturedClipboard {
            raw_text: text,
            html: None,
            format: CapturedClipboardFormat::PlainText,
        }));
    }

    Ok(None)
}

struct ClipboardGuard;

impl ClipboardGuard {
    fn open() -> anyhow::Result<Self> {
        unsafe {
            OpenClipboard(None)?;
        }

        Ok(Self)
    }
}

impl Drop for ClipboardGuard {
    fn drop(&mut self) {
        if let Err(e) = unsafe { CloseClipboard() } {
            log::warn!("Failed to close clipboard: {e:?}");
        }
    }
}

fn read_plain_text_clipboard() -> anyhow::Result<Option<String>> {
    let Some(code_units) = read_clipboard_data::<u16>(CF_UNICODETEXT.0 as _)? else {
        return Ok(None);
    };

    if code_units.is_empty() {
        return Ok(None);
    }

    let nul_pos = code_units
        .iter()
        .position(|code_unit| *code_unit == 0)
        .unwrap_or(code_units.len());

    if nul_pos == 0 {
        return Ok(None);
    }

    Ok(Some(String::from_utf16(&code_units[..nul_pos])?))
}

fn read_html_clipboard() -> anyhow::Result<Option<String>> {
    // reference: https://learn.microsoft.com/ja-jp/windows/win32/dataxchg/html-clipboard-format
    let format = unsafe { RegisterClipboardFormatW(windows::core::w!("HTML Format")) };
    if format == 0 {
        anyhow::bail!("RegisterClipboardFormatW returned zero");
    }

    // NOTE: The HTML clipboard format uses UTF-8.
    let Some(bytes) = read_clipboard_data::<u8>(format)? else {
        return Ok(None);
    };

    let bytes = trim_trailing_nuls(&bytes);
    if bytes.is_empty() {
        return Ok(None);
    }

    let html = std::str::from_utf8(bytes)
        .map_err(|e| anyhow::anyhow!("HTML clipboard content is not valid UTF-8: {e}"))?;

    Ok(Some(extract_html_clipboard_fragment(html).to_owned()))
}

fn trim_trailing_nuls(bytes: &[u8]) -> &[u8] {
    let end = bytes
        .iter()
        .rposition(|byte| *byte != 0)
        .map(|index| index + 1)
        .unwrap_or(0);

    &bytes[..end]
}

fn extract_html_clipboard_fragment(html: &str) -> &str {
    if let Some(fragment) = extract_html_clipboard_range(html, "StartFragment", "EndFragment") {
        return fragment;
    }

    if let Some(document) = extract_html_clipboard_range(html, "StartHTML", "EndHTML") {
        return document;
    }

    html
}

fn extract_html_clipboard_range<'a>(
    html: &'a str,
    start_key: &str,
    end_key: &str,
) -> Option<&'a str> {
    let start = read_html_clipboard_offset(html, start_key)?;
    let end = read_html_clipboard_offset(html, end_key)?;

    if start >= end
        || end > html.len()
        || !html.is_char_boundary(start)
        || !html.is_char_boundary(end)
    {
        return None;
    }

    Some(&html[start..end])
}

fn read_html_clipboard_offset(html: &str, key: &str) -> Option<usize> {
    let prefix = format!("{key}:");
    let start = html.find(&prefix)? + prefix.len();
    let value = html[start..].lines().next().unwrap_or_default().trim();

    if value == "-1" {
        return None;
    }

    value.parse::<usize>().ok()
}

trait ClipboardDataElement: Copy {
    const NAME: &'static str;
}

impl ClipboardDataElement for u8 {
    const NAME: &'static str = "u8";
}

impl ClipboardDataElement for u16 {
    const NAME: &'static str = "u16";
}

fn read_clipboard_data<T: ClipboardDataElement>(format: u32) -> anyhow::Result<Option<Vec<T>>> {
    let handle = match unsafe { GetClipboardData(format) } {
        Ok(handle) => handle,
        Err(_) => return Ok(None),
    };

    if handle.is_invalid() {
        return Ok(None);
    }

    let global = HGLOBAL(handle.0);
    let size = unsafe { GlobalSize(global) };
    if size == 0 {
        return Ok(None);
    }

    let element_size = std::mem::size_of::<T>();
    if size % element_size != 0 {
        anyhow::bail!(
            "Clipboard data size {size} is not aligned to {} element size {element_size}",
            T::NAME
        );
    }

    let locked = unsafe { GlobalLock(global) };
    if locked.is_null() {
        anyhow::bail!("GlobalLock returned null");
    }

    let element_len = size / element_size;
    let mut data = Vec::<T>::with_capacity(element_len);
    unsafe {
        // SAFETY: `data` has capacity for `size` bytes, the source is a valid
        // locked clipboard allocation, and copying as bytes avoids assuming the
        // source pointer is aligned for `T`. The destination `Vec<T>` is aligned.
        ptr::copy_nonoverlapping(locked.cast::<u8>(), data.as_mut_ptr().cast::<u8>(), size);
        data.set_len(element_len);
    }

    unsafe {
        _ = GlobalUnlock(global);
    }

    Ok(Some(data))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn html_clipboard_parser_prefers_fragment() {
        let html = html_clipboard_with_fragment("<p>Hello</p>");

        assert_eq!(extract_html_clipboard_fragment(&html), "<p>Hello</p>");
    }

    #[test]
    fn html_clipboard_parser_falls_back_to_document() {
        let html = html_clipboard_without_fragment("<html><body>Hello</body></html>");

        assert_eq!(
            extract_html_clipboard_fragment(&html),
            "<html><body>Hello</body></html>"
        );
    }

    #[test]
    fn html_clipboard_parser_falls_back_to_all_for_invalid_offsets() {
        let html = concat!(
            "Version:0.9\r\n",
            "StartFragment:00099999\r\n",
            "EndFragment:00000001\r\n",
            "<p>Hello</p>",
        );

        assert_eq!(extract_html_clipboard_fragment(html), html);
    }

    #[test]
    fn html_clipboard_parser_keeps_empty_html_empty() {
        assert_eq!(extract_html_clipboard_fragment(""), "");
    }

    fn html_clipboard_with_fragment(fragment: &str) -> String {
        let before = "<html><body><!--StartFragment-->";
        let after = "<!--EndFragment--></body></html>";
        let document = format!("{before}{fragment}{after}");
        let header = "Version:0.9\r\nStartHTML:0000000000\r\nEndHTML:0000000000\r\nStartFragment:0000000000\r\nEndFragment:0000000000\r\n";
        let start_html = header.len();
        let start_fragment = start_html + before.len();
        let end_fragment = start_fragment + fragment.len();
        let end_html = start_html + document.len();

        format!(
            "Version:0.9\r\nStartHTML:{start_html:010}\r\nEndHTML:{end_html:010}\r\nStartFragment:{start_fragment:010}\r\nEndFragment:{end_fragment:010}\r\n{document}"
        )
    }

    fn html_clipboard_without_fragment(document: &str) -> String {
        let header = "Version:0.9\r\nStartHTML:0000000000\r\nEndHTML:0000000000\r\n";
        let start_html = header.len();
        let end_html = start_html + document.len();

        format!("Version:0.9\r\nStartHTML:{start_html:010}\r\nEndHTML:{end_html:010}\r\n{document}")
    }
}
