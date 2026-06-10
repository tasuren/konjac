// Reference: https://learn.microsoft.com/en-us/windows/apps/design/basics/titlebar-design#caption-controls-minimize-maximize-restore-close

import { cn } from "@sglara/cn";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback, useMemo, useState } from "react";

/**
 * The controls of window for Windows.
 */
export function WindowsCaptionControls() {
  const window = useMemo(() => getCurrentWindow(), []);
  const buttonClass = "w-[46px] text-[10px] flex justify-center items-center";

  const [maximized, setMaximized] = useState(false);

  const onMaximizeOrRestore = useCallback(() => {
    if (maximized) {
      window.unmaximize();
      setMaximized(false);
    } else {
      window.maximize();
      setMaximized(true);
    }
  }, [window, maximized]);

  return (
    <div
      className="h-full flex"
      // https://learn.microsoft.com/en-us/windows/apps/design/iconography/segoe-fluent-icons-font
      style={{ fontFamily: "'Segoe Fluent Icons', 'Segoe MDL2 Assets'" }}
    >
      <button
        type="button"
        className={cn(buttonClass, "hover:bg-black/5 dark:hover:bg-white/10")}
        aria-label="Minimize window"
        onClick={() => window.minimize()}
      >
        <span>&#xE921;</span>
      </button>
      <button
        type="button"
        className={cn(buttonClass, "hover:bg-black/5 dark:hover:bg-white/10")}
        aria-label={maximized ? "Maximize window" : "Restore window"}
        onClick={onMaximizeOrRestore}
      >
        {maximized ? <span>&#xE923;</span> : <span>&#xE922;</span>}
      </button>
      <button
        type="button"
        className={cn(buttonClass, "hover:bg-[#e81123] hover:text-white")}
        aria-label="Close window"
        onClick={() => window.close()}
      >
        <span>&#xE8BB;</span>
      </button>
    </div>
  );
}
