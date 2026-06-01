import { cn } from "@sglara/cn";
import type { ComponentPropsWithRef } from "react";

export type InputProps = ComponentPropsWithRef<"input">;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "rounded-lg border border-border bg-surface-elevated px-2 py-1",
        className,
      )}
      {...props}
    />
  );
}
