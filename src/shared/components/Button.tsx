import { cn } from "@sglara/cn";
import type { ComponentPropsWithRef } from "react";

export type ButtonProps = ComponentPropsWithRef<"button">;

export function Button({ className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex w-fit items-center justify-center rounded-lg border border-border bg-surface-elevated px-2 py-1",
        "cursor-pointer active:opacity-70 disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}
