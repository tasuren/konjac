import { cn } from "@sglara/cn";
import type { ComponentPropsWithoutRef } from "react";

export function SettingsDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("mb-1 text-sm text-muted", className)} {...props} />
  );
}
