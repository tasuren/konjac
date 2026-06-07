import { openUrl } from "@tauri-apps/plugin-opener";
import type { ComponentPropsWithoutRef } from "react";

export function OpenInBrowser({
  href,
  ...props
}: ComponentPropsWithoutRef<"a"> & { href: string }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        openUrl(href);
      }}
      className="text-accent underline"
      {...props}
    />
  );
}
