import { cn } from "@sglara/cn";
import type { ComponentPropsWithoutRef } from "react";

export type SettingsSectionProps = ComponentPropsWithoutRef<"section"> & {
  title: string;
};

export function SettingsSection({
  className,
  children,
  title,
  ...props
}: SettingsSectionProps) {
  return (
    <section className={cn("space-y-4", className)} {...props}>
      <h1 className="text-2xl">{title}</h1>

      <div className="space-y-6">{children}</div>
    </section>
  );
}
