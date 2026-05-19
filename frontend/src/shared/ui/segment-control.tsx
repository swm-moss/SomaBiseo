"use client";

import { cn } from "@/shared/lib/utils";

type SegmentControlOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentControlProps<T extends string> = {
  options: SegmentControlOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
};

export function SegmentControl<T extends string>({
  options,
  value,
  onValueChange,
  className,
}: SegmentControlProps<T>) {
  return (
    <div className={cn("-mx-5 flex gap-2 overflow-x-auto px-5 py-1", className)}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            className={cn(
              "sb-tap shrink-0 rounded-lg px-4 text-[15px] font-semibold transition-colors",
              isSelected
                ? "bg-foreground text-white"
                : "bg-white text-muted-foreground hover:bg-muted",
            )}
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
