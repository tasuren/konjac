import { cn } from "@sglara/cn";
import { platform } from "@tauri-apps/plugin-os";
import { type ReactNode, useRef } from "react";
import { useWindowDragging } from "../hooks/useWindowDragging";
import { useTranslation } from "react-i18next";
import { IconButton } from "./IconButton";
import { ChevronLeft, Settings, Settings2, X } from "lucide-react";
import { WindowsCaptionControls } from "./WindowCaptionControls";

export type TitleBarProps = {
  children?: ReactNode;
  settingsOpened: boolean;
  setSettings: (value: boolean) => void;
};

export function TitleBar({
  children,
  settingsOpened,
  setSettings,
}: TitleBarProps) {
  const { t } = useTranslation();

  const titleBarRef = useRef(null);
  const titleBarClassName = useWindowDragging(titleBarRef, {
    includesChildren: true,
    maximizable: true,
  });

  return (
    <header
      className={cn(
        "w-full bg-titlebar border border-border shrink-0 flex items-center gap-2",
        titleBarClassName,
        platform() === "macos" && "pl-20.5 h-11",
        platform() !== "macos" && "pl-2 h-10"
      )}
      ref={titleBarRef}
    >
      <div>
        {platform() === "windows" && <SettingsButton settingsOpened={settingsOpened} setSettings={setSettings} />}
      </div>

      <div>{settingsOpened ? t("settings.title") : t("app.title")}</div>

      <div>
        {children}
      </div>

      {platform() === "macos" && (
        <SettingsButton settingsOpened={settingsOpened} setSettings={setSettings} />
      )}

      {platform() === "windows" && (
        <div className="h-full ml-auto">
          <WindowsCaptionControls />
        </div>
      )}
    </header>
  );
}

function SettingsButton({ settingsOpened, setSettings,  }: { settingsOpened: boolean; setSettings: (settings: boolean) => void,  }) {
  const { t } = useTranslation();

  return (
    <div className="ml-auto flex items-center">
      <IconButton
        className="text-text hover:bg-transparent"
        onClick={() => setSettings(!settingsOpened)}
        aria-label={
          settingsOpened
            ? t("settings.closeAriaLabel")
            : t("settings.title")
        }
      >
        {settingsOpened ? (
          platform() === "macos"
            ? <X size={25} />
            : <ChevronLeft size={25} strokeWidth={1} />
        ) : (
          platform() === "macos"
            ? <Settings size={23} className="text-text" />
            : <Settings2 size={21} strokeWidth={1} />
        )}
      </IconButton>
    </div>
  )
}
