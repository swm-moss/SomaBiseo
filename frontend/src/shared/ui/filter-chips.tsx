"use client";

import { cn } from "@/shared/lib/utils";

type FilterChipOption<T extends string> = {
  label: string;
  value: T;
};

type FilterChipsProps<T extends string> = {
  ariaLabel: string;
  options: FilterChipOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
};

export function FilterChips<T extends string>({
  ariaLabel,
  options,
  value,
  onValueChange,
  className,
}: FilterChipsProps<T>) {
  return (
    <div
      aria-label={ariaLabel}
      className={cn("-mx-5 flex gap-1.5 overflow-x-auto px-5 py-0.5", className)}
      role="radiogroup"
    >
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            aria-checked={isSelected}
            className={cn(
              "sb-tap h-8 shrink-0 rounded-full border px-3 text-[13px] font-semibold transition-colors",
              isSelected
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-white text-muted-foreground hover:bg-muted",
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
  );
}
