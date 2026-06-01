import { cn } from "@sglara/cn";
import type { ComponentPropsWithRef } from "react";

export type IconButtonProps = ComponentPropsWithRef<"button">;

export function IconButton({
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md",
        "text-muted hover:bg-surface hover:text-text active:opacity-70",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}
