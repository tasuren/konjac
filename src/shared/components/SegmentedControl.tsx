import { cn } from "@sglara/cn";

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
  title: string;
};

export type SegmentedControlProps<T extends string> = {
  legend: string;
  value: T;
  options: Array<SegmentedControlOption<T>>;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  legend,
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <fieldset
      className={cn(
        "flex rounded-md border border-border bg-surface-elevated p-0.5 text-xs",
        className,
      )}
    >
      <legend className="sr-only">{legend}</legend>

      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            title={option.title}
            aria-label={option.title}
            aria-pressed={selected}
            className={cn(
              "rounded px-2 py-1 transition-colors",
              "hover:text-text active:opacity-70",
              selected ? "bg-surface text-text shadow-sm" : "text-muted",
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
