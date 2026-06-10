// Reference: https://learn.microsoft.com/en-us/windows/apps/design/basics/titlebar-design#caption-controls-minimize-maximize-restore-close

import { cn } from "@sglara/cn";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useWindowMaximized } from "../hooks/useWindowMaximized";

/**
 * The controls of window for Windows.
 */
export function WindowsCaptionControls() {
  const { t } = useTranslation();
  const window = useMemo(() => getCurrentWindow(), []);
  const buttonClass = "w-[46px] text-[10px] flex justify-center items-center";

  const { maximized, refreshMaximized } = useWindowMaximized();

  const onMaximizeOrRestore = useCallback(async () => {
    if (maximized) {
      await window.unmaximize();
    } else {
      await window.maximize();
    }

    await refreshMaximized();
  }, [window, maximized, refreshMaximized]);

  return (
    <div
      className="h-full flex"
      // https://learn.microsoft.com/en-us/windows/apps/design/iconography/segoe-fluent-icons-font
      style={{ fontFamily: "'Segoe Fluent Icons', 'Segoe MDL2 Assets'" }}
    >
      <button
        type="button"
        className={cn(buttonClass, "hover:bg-black/5 dark:hover:bg-white/10")}
        aria-label={t("windowCaptionControls.minimize")}
        onClick={() => window.minimize()}
      >
        <span>&#xE921;</span>
      </button>
      <button
        type="button"
        className={cn(buttonClass, "hover:bg-black/5 dark:hover:bg-white/10")}
        aria-label={
          maximized
            ? t("windowCaptionControls.restore")
            : t("windowCaptionControls.maximize")
        }
        onClick={onMaximizeOrRestore}
      >
        {maximized ? <span>&#xE923;</span> : <span>&#xE922;</span>}
      </button>
      <button
        type="button"
        className={cn(buttonClass, "hover:bg-[#e81123] hover:text-white")}
        aria-label={t("windowCaptionControls.close")}
        onClick={() => window.close()}
      >
        <span>&#xE8BB;</span>
      </button>
    </div>
  );
}
