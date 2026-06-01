import { cn } from "@sglara/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type SettingsFieldProps = ComponentPropsWithoutRef<"div"> & {
  htmlFor: string;
  label: ReactNode;
  labelClassName?: string;
};

export function SettingsField({
  className,
  children,
  htmlFor,
  label,
  labelClassName,
  ...props
}: SettingsFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <label className={labelClassName} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
