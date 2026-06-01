use std::time::{Duration, Instant};

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, async_runtime};
use tauri_plugin_log::log;
use tokio::sync::mpsc;

use crate::{
    ipc_dto::{ClipboardInputFormatDto, QuickCopyTranslationInputDto},
    settings::QuickCopyTranslateSettings,
};

#[cfg(target_os = "macos")]
use crate::platform::macos::{
    copy_tap,
    pasteboard::{self, CapturedClipboardFormat},
};

const QUICK_COPY_TRANSLATION_INPUT_EVENT: &str = "quick-copy-translation-input";

/// Starts the platform quick-copy translation service when enabled.
pub fn start(app: &AppHandle, settings: &QuickCopyTranslateSettings) -> anyhow::Result<()> {
    if settings.enabled == false {
        return Ok(());
    }

    start_platform_service(app.clone(), settings.clone())
}

#[cfg(target_os = "macos")]
fn start_platform_service(
    app: AppHandle,
    settings: QuickCopyTranslateSettings,
) -> anyhow::Result<()> {
    let (sender, mut receiver) = mpsc::unbounded_channel();
    copy_tap::start_cmd_c_tap(sender)?;

    async_runtime::spawn(async move {
        let mut detector =
            DoublePressDetector::new(Duration::from_millis(settings.double_press_interval_ms));

        while receiver.recv().await.is_some() {
            if detector.push(Instant::now()) == false {
                continue;
            }

            handle_quick_copy(&app, settings.pasteboard_wait_ms).await;
        }
    });

    Ok(())
}

#[cfg(not(target_os = "macos"))]
fn start_platform_service(
    _app: AppHandle,
    _settings: QuickCopyTranslateSettings,
) -> anyhow::Result<()> {
    Ok(())
}

async fn handle_quick_copy(app: &AppHandle, pasteboard_wait_ms: u64) {
    #[cfg(target_os = "macos")]
    {
        let captured = match async_runtime::spawn_blocking(move || {
            pasteboard::capture_after_change(pasteboard_wait_ms)
        })
        .await
        {
            Ok(Some(captured)) => captured,
            Ok(None) => return,
            Err(e) => {
                log::warn!("Failed to join pasteboard capture task: {e:?}");
                return;
            }
        };

        let payload = match captured.format {
            CapturedClipboardFormat::Html => {
                let text = match crate::markdown::html_to_markdown(&captured.text) {
                    Ok(text) => text,
                    Err(e) => {
                        log::warn!("Failed to convert quick-copy HTML to Markdown: {e:?}");
                        captured.text
                    }
                };

                QuickCopyTranslationInputDto {
                    text,
                    format: ClipboardInputFormatDto::Html,
                }
            }
            CapturedClipboardFormat::PlainText => QuickCopyTranslationInputDto {
                text: captured.text,
                format: ClipboardInputFormatDto::PlainText,
            },
        };

        if payload.text.trim().is_empty() {
            return;
        }

        open_main_window(app);
        emit_quick_copy_input(app, &payload);
    }
}

fn open_main_window(app: &AppHandle) {
    let Some(window) = app.get_webview_window("main") else {
        log::warn!("Failed to find main window for quick-copy translation");
        return;
    };

    if let Err(e) = window.unminimize() {
        log::warn!("Failed to unminimize main window: {e:?}");
    }

    if let Err(e) = window.show() {
        log::warn!("Failed to show main window: {e:?}");
    }

    if let Err(e) = window.set_focus() {
        log::warn!("Failed to focus main window: {e:?}");
    }
}

fn emit_quick_copy_input(app: &AppHandle, payload: &impl Serialize) {
    if let Err(e) = app.emit(QUICK_COPY_TRANSLATION_INPUT_EVENT, payload) {
        log::warn!("Failed to emit quick-copy translation input: {e:?}");
    }
}

/// Detects two shortcut presses within the configured interval.
struct DoublePressDetector {
    interval: Duration,
    last_press: Option<Instant>,
}

impl DoublePressDetector {
    fn new(interval: Duration) -> Self {
        Self {
            interval,
            last_press: None,
        }
    }

    fn push(&mut self, now: Instant) -> bool {
        let matched = self
            .last_press
            .map(|last_press| now.duration_since(last_press) <= self.interval)
            .unwrap_or(false);

        self.last_press = if matched { None } else { Some(now) };
        matched
    }
}
