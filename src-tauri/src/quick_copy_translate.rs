use std::time::{Duration, Instant};

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, async_runtime, async_runtime::JoinHandle};
use tauri_plugin_log::log;
use tokio::sync::Mutex;
use tokio::sync::mpsc;

use crate::{
    ipc_dto::{ClipboardInputFormatDto, QuickCopyTranslationInputDto},
    settings::QuickCopyTranslateSettings,
};

#[cfg(target_os = "macos")]
use crate::platform::macos::{copy_tap, pasteboard};

#[cfg(target_os = "windows")]
use crate::platform::windows::quick_copy;

const QUICK_COPY_TRANSLATION_INPUT_EVENT: &str = "quick-copy-translation-input";

/// Runtime service that manages quick-copy translation event listeners.
pub struct QuickCopyTranslateService {
    runtime: Mutex<Option<QuickCopyTranslateRuntime>>,
}

impl QuickCopyTranslateService {
    /// Creates an idle quick-copy translation service.
    pub fn new() -> Self {
        Self {
            runtime: Mutex::new(None),
        }
    }

    /// Applies quick-copy settings by starting, stopping, or restarting listeners.
    pub async fn apply_settings(
        &self,
        app: AppHandle,
        settings: &QuickCopyTranslateSettings,
    ) -> anyhow::Result<()> {
        let mut runtime = self.runtime.lock().await;
        let action =
            plan_runtime_update(runtime.as_ref().map(|runtime| &runtime.settings), settings);

        match action {
            QuickCopyRuntimeUpdate::Keep => {}
            QuickCopyRuntimeUpdate::Stop => {
                if let Some(mut runtime) = runtime.take() {
                    runtime.stop();
                }
            }
            QuickCopyRuntimeUpdate::Start | QuickCopyRuntimeUpdate::Restart => {
                let next_runtime = start_platform_service(app, settings.clone())?;

                if let Some(mut runtime) = runtime.take() {
                    runtime.stop();
                }

                *runtime = Some(next_runtime);
            }
        }

        Ok(())
    }
}

struct QuickCopyTranslateRuntime {
    settings: QuickCopyTranslateSettings,
    platform_handle: PlatformQuickCopyHandle,
    task_handle: JoinHandle<()>,
}

impl QuickCopyTranslateRuntime {
    fn stop(&mut self) {
        self.platform_handle.stop();
        self.task_handle.abort();
    }
}

impl Drop for QuickCopyTranslateRuntime {
    fn drop(&mut self) {
        self.stop();
    }
}

#[cfg(target_os = "macos")]
type PlatformQuickCopyHandle = copy_tap::CmdCTapHandle;

#[cfg(target_os = "windows")]
type PlatformQuickCopyHandle = quick_copy::QuickCopyMonitorHandle;

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
struct PlatformQuickCopyHandle;

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
impl PlatformQuickCopyHandle {
    fn stop(&mut self) {}
}

#[cfg(target_os = "macos")]
fn start_platform_service(
    app: AppHandle,
    settings: QuickCopyTranslateSettings,
) -> anyhow::Result<QuickCopyTranslateRuntime> {
    let (sender, mut receiver) = mpsc::unbounded_channel();
    let platform_handle = copy_tap::start_cmd_c_tap(sender)?;

    let task_handle = async_runtime::spawn({
        let settings = settings.clone();

        async move {
            let mut detector =
                DoublePressDetector::new(Duration::from_millis(settings.double_press_interval_ms));

            while receiver.recv().await.is_some() {
                if detector.push(Instant::now()) == false {
                    continue;
                }

                let captured = match async_runtime::spawn_blocking(move || {
                    pasteboard::capture_after_change(settings.pasteboard_wait_ms)
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

                handle_captured_quick_copy(&app, captured.into());
            }
        }
    });

    Ok(QuickCopyTranslateRuntime {
        settings,
        platform_handle,
        task_handle,
    })
}

#[cfg(target_os = "windows")]
fn start_platform_service(
    app: AppHandle,
    settings: QuickCopyTranslateSettings,
) -> anyhow::Result<QuickCopyTranslateRuntime> {
    let (sender, mut receiver) = mpsc::unbounded_channel();
    let platform_handle = quick_copy::start_quick_copy_monitor(
        sender,
        settings.double_press_interval_ms,
        settings.pasteboard_wait_ms,
    )?;

    let task_handle = async_runtime::spawn(async move {
        while let Some(captured) = receiver.recv().await {
            handle_captured_quick_copy(&app, captured.into());
        }
    });

    Ok(QuickCopyTranslateRuntime {
        settings,
        platform_handle,
        task_handle,
    })
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
fn start_platform_service(
    app: AppHandle,
    settings: QuickCopyTranslateSettings,
) -> anyhow::Result<QuickCopyTranslateRuntime> {
    let task_handle = async_runtime::spawn(async move {
        let _ = app;
    });

    Ok(QuickCopyTranslateRuntime {
        settings,
        platform_handle: PlatformQuickCopyHandle,
        task_handle,
    })
}

#[derive(Debug, PartialEq, Eq)]
enum QuickCopyRuntimeUpdate {
    Keep,
    Stop,
    Start,
    Restart,
}

fn plan_runtime_update(
    current: Option<&QuickCopyTranslateSettings>,
    next: &QuickCopyTranslateSettings,
) -> QuickCopyRuntimeUpdate {
    match (current, next.enabled) {
        (Some(current), _) if current == next => QuickCopyRuntimeUpdate::Keep,
        (Some(_), false) => QuickCopyRuntimeUpdate::Stop,
        (Some(_), true) => QuickCopyRuntimeUpdate::Restart,
        (None, true) => QuickCopyRuntimeUpdate::Start,
        (None, false) => QuickCopyRuntimeUpdate::Keep,
    }
}

fn handle_captured_quick_copy(app: &AppHandle, captured: CapturedQuickCopyInput) {
    let payload = captured.into_translation_input();
    if payload.text.trim().is_empty() {
        return;
    }

    open_main_window(app);
    emit_quick_copy_input(app, &payload);
}

struct CapturedQuickCopyInput {
    text: String,
    format: CapturedQuickCopyFormat,
}

enum CapturedQuickCopyFormat {
    PlainText,
    Html,
}

impl CapturedQuickCopyInput {
    fn into_translation_input(self) -> QuickCopyTranslationInputDto {
        match self.format {
            CapturedQuickCopyFormat::Html => {
                let text = match crate::markdown::html_to_markdown(&self.text) {
                    Ok(text) => text,
                    Err(e) => {
                        log::warn!("Failed to convert quick-copy HTML to Markdown: {e:?}");
                        self.text
                    }
                };

                QuickCopyTranslationInputDto {
                    text,
                    format: ClipboardInputFormatDto::Html,
                }
            }
            CapturedQuickCopyFormat::PlainText => QuickCopyTranslationInputDto {
                text: self.text,
                format: ClipboardInputFormatDto::PlainText,
            },
        }
    }
}

#[cfg(target_os = "macos")]
impl From<pasteboard::CapturedClipboard> for CapturedQuickCopyInput {
    fn from(value: pasteboard::CapturedClipboard) -> Self {
        Self {
            text: value.text,
            format: match value.format {
                pasteboard::CapturedClipboardFormat::PlainText => {
                    CapturedQuickCopyFormat::PlainText
                }
                pasteboard::CapturedClipboardFormat::Html => CapturedQuickCopyFormat::Html,
            },
        }
    }
}

#[cfg(target_os = "windows")]
impl From<quick_copy::CapturedClipboard> for CapturedQuickCopyInput {
    fn from(value: quick_copy::CapturedClipboard) -> Self {
        Self {
            text: value.text,
            format: match value.format {
                quick_copy::CapturedClipboardFormat::PlainText => {
                    CapturedQuickCopyFormat::PlainText
                }
                quick_copy::CapturedClipboardFormat::Html => CapturedQuickCopyFormat::Html,
            },
        }
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
pub(crate) struct DoublePressDetector {
    interval: Duration,
    last_press: Option<Instant>,
}

impl DoublePressDetector {
    pub(crate) fn new(interval: Duration) -> Self {
        Self {
            interval,
            last_press: None,
        }
    }

    pub(crate) fn push(&mut self, now: Instant) -> bool {
        let matched = self
            .last_press
            .map(|last_press| now.duration_since(last_press) <= self.interval)
            .unwrap_or(false);

        self.last_press = if matched { None } else { Some(now) };
        matched
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn settings(
        enabled: bool,
        double_press_interval_ms: u64,
        pasteboard_wait_ms: u64,
    ) -> QuickCopyTranslateSettings {
        QuickCopyTranslateSettings {
            enabled,
            double_press_interval_ms,
            pasteboard_wait_ms,
        }
    }

    #[test]
    fn plan_runtime_update_keeps_matching_runtime() {
        let current = settings(true, 500, 150);

        assert_eq!(
            plan_runtime_update(Some(&current), &current),
            QuickCopyRuntimeUpdate::Keep
        );
    }

    #[test]
    fn plan_runtime_update_starts_and_stops_runtime() {
        let enabled = settings(true, 500, 150);
        let disabled = settings(false, 500, 150);

        assert_eq!(
            plan_runtime_update(None, &enabled),
            QuickCopyRuntimeUpdate::Start
        );
        assert_eq!(
            plan_runtime_update(Some(&enabled), &disabled),
            QuickCopyRuntimeUpdate::Stop
        );
        assert_eq!(
            plan_runtime_update(None, &disabled),
            QuickCopyRuntimeUpdate::Keep
        );
    }

    #[test]
    fn plan_runtime_update_restarts_when_runtime_settings_change() {
        let current = settings(true, 500, 150);
        let changed_interval = settings(true, 300, 150);
        let changed_wait = settings(true, 500, 250);

        assert_eq!(
            plan_runtime_update(Some(&current), &changed_interval),
            QuickCopyRuntimeUpdate::Restart
        );
        assert_eq!(
            plan_runtime_update(Some(&current), &changed_wait),
            QuickCopyRuntimeUpdate::Restart
        );
    }
}
