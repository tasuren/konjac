use std::{thread::sleep, time::Duration};

use objc2::rc::autoreleasepool;
use objc2_app_kit::{NSPasteboard, NSPasteboardTypeHTML, NSPasteboardTypeString};

/// Clipboard content captured from the macOS general pasteboard.
pub struct CapturedClipboard {
    pub text: String,
    pub format: CapturedClipboardFormat,
}

/// Source pasteboard format before app-side normalization.
pub enum CapturedClipboardFormat {
    PlainText,
    Html,
}

/// Captures HTML or plain text after the pasteboard has had time to update.
pub fn capture_after_change(wait_ms: u64) -> Option<CapturedClipboard> {
    autoreleasepool(|_| {
        let pasteboard = NSPasteboard::generalPasteboard();
        let initial_change_count = pasteboard.changeCount();
        let deadline = Duration::from_millis(wait_ms);
        let poll_interval = Duration::from_millis(10);
        let started_at = std::time::Instant::now();

        while started_at.elapsed() < deadline && pasteboard.changeCount() == initial_change_count {
            sleep(poll_interval);
        }

        if let Some(html) = pasteboard.stringForType(unsafe { NSPasteboardTypeHTML }) {
            return Some(CapturedClipboard {
                text: html.to_string(),
                format: CapturedClipboardFormat::Html,
            });
        }

        pasteboard
            .stringForType(unsafe { NSPasteboardTypeString })
            .map(|text| CapturedClipboard {
                text: text.to_string(),
                format: CapturedClipboardFormat::PlainText,
            })
    })
}
