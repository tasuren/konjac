import { cn } from "@sglara/cn";
import { ArrowRightLeft, ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "appearance-none border border-border bg-surface-elevated rounded-lg px-2 py-1 pr-8",
          "",
          className,
        )}
        {...props}
      >
        {children}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <ChevronDown className="h-4 w-4 opacity-60" />
      </div>
    </div>
  );
}

export default function TranslationControls() {
  return (
    <div className="flex items-center gap-6 relative">
      <div className="w-1/2 flex justify-end px-2">
        <Select className="w-40">
          <option>あ</option>
        </Select>
      </div>

      <div className="w-1/2 flex justify-between px-2">
        <Select className="w-40">
          <option>あ</option>
        </Select>

        <Select>
          <option>あ</option>
        </Select>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
        <button type="button" className="active:opacity-60">
          <ArrowRightLeft size={26} className="opacity-60" />
        </button>
      </div>
    </div>
  );
}
