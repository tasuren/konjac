import { cn } from "@sglara/cn";
import { ChevronDown } from "lucide-react";
import type { ComponentPropsWithRef } from "react";

export type SelectProps = ComponentPropsWithRef<"select"> & {
  containerClassName?: string;
};

export function Select({
  className,
  containerClassName,
  children,
  ...props
}: SelectProps) {
  return (
    <div className={cn("relative w-fit", containerClassName)}>
      <select
        className={cn(
          "appearance-none border border-border bg-surface-elevated rounded-lg px-2 py-1 pr-8",
          className,
        )}
        {...props}
      >
        {children}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
        <ChevronDown className="h-4 w-4 opacity-60" />
      </div>
    </div>
  );
}
