"use client";

import { cn } from "@/shared/lib/utils";

type FilterChipOption<T extends string> = {
  label: string;
  value: T;
};

type FilterChipsProps<T extends string> = {
  ariaLabel: string;
  label?: string;
  options: FilterChipOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
};

export function FilterChips<T extends string>({
  ariaLabel,
  label,
  options,
  value,
  onValueChange,
  className,
}: FilterChipsProps<T>) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {label ? (
        <span className="w-12 shrink-0 text-[13px] font-semibold text-muted-foreground">
          {label}
        </span>
      ) : null}
      <div
        aria-label={ariaLabel}
        className="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 py-0.5"
        role="radiogroup"
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              aria-checked={isSelected}
              className={cn(
                "sb-tap h-9 shrink-0 rounded-full border px-4 text-[14px] font-semibold transition-colors",
                isSelected
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-white text-foreground hover:bg-muted",
              )}
              role="radio"
              type="button"
              onClick={() => onValueChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
