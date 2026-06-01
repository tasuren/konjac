import { cn } from "@sglara/cn";
import type { ComponentPropsWithRef } from "react";

export type TextAreaProps = ComponentPropsWithRef<"textarea">;

export function TextArea({ className, ...props }: TextAreaProps) {
  return (
    <textarea
      className={cn(
        "min-h-48 rounded-xl border border-border bg-surface-elevated p-3",
        className,
      )}
      {...props}
    />
  );
}
