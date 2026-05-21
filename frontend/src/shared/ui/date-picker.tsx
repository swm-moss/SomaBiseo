"use client";

import { useMemo, useState } from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "@/shared/lib/utils";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function formatIsoDate(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseIsoDate(value: string): { year: number; month: number; day: number } | null {
  if (!ISO_DATE_PATTERN.test(value)) {
    return null;
  }

  const [yearString, monthString, dayString] = value.split("-");
  const year = Number(yearString);
  const month = Number(monthString) - 1;
  const day = Number(dayString);

  const candidate = new Date(year, month, day);

  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month ||
    candidate.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function getTodayParts() {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
  };
}

type DatePickerProps = {
  ariaLabel?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function DatePicker({
  ariaLabel = "날짜 선택",
  value,
  onChange,
  placeholder = "날짜 선택",
  className,
}: DatePickerProps) {
  const parsedValue = parseIsoDate(value);
  const today = getTodayParts();

  const initialAnchor = parsedValue ?? today;
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialAnchor.year);
  const [viewMonth, setViewMonth] = useState(initialAnchor.month);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      const anchor = parseIsoDate(value) ?? today;

      setViewYear(anchor.year);
      setViewMonth(anchor.month);
    }
  };

  const calendarCells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: ({ day: number; iso: string } | null)[] = [];

    for (let index = 0; index < startWeekday; index += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ day, iso: formatIsoDate(viewYear, viewMonth, day) });
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [viewYear, viewMonth]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelect = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onChange("");
  };

  const triggerLabel = parsedValue
    ? `${parsedValue.year}.${pad(parsedValue.month + 1)}.${pad(parsedValue.day)}`
    : placeholder;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          aria-label={ariaLabel}
          className={cn(
            "inline-flex h-12 items-center gap-2 rounded-lg border border-border bg-white pl-3 pr-2 text-[14px] font-semibold text-foreground outline-none transition-colors hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/15",
            !parsedValue && "text-muted-foreground",
            className,
          )}
          type="button"
        >
          <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-left">{triggerLabel}</span>
          {parsedValue ? (
            <span
              aria-label="날짜 해제"
              role="button"
              tabIndex={-1}
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={handleClear}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <X aria-hidden="true" className="size-3.5" />
            </span>
          ) : null}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={6}
          className={cn(
            "z-50 w-[280px] rounded-xl border border-border bg-white p-3 shadow-lg outline-none",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        >
          <div className="flex items-center justify-between px-1">
            <button
              aria-label="이전 달"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              type="button"
              onClick={goToPrevMonth}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>
            <span className="text-[14px] font-bold text-foreground">
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button
              aria-label="다음 달"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              type="button"
              onClick={goToNextMonth}
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </div>
          <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
            {WEEKDAY_LABELS.map((label, index) => (
              <span
                key={label}
                className={cn(
                  "text-[12px] font-bold leading-8",
                  index === 0 && "text-red-500",
                  index === 6 && "text-blue-500",
                  index !== 0 && index !== 6 && "text-muted-foreground",
                )}
              >
                {label}
              </span>
            ))}
            {calendarCells.map((cell, index) => {
              if (!cell) {
                return <span key={`empty-${index}`} className="h-8" />;
              }

              const isSelected = parsedValue
                ? parsedValue.year === viewYear &&
                  parsedValue.month === viewMonth &&
                  parsedValue.day === cell.day
                : false;
              const isToday =
                today.year === viewYear &&
                today.month === viewMonth &&
                today.day === cell.day;
              const weekday = index % 7;

              return (
                <button
                  key={cell.iso}
                  type="button"
                  aria-pressed={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  className={cn(
                    "mx-auto inline-flex size-8 items-center justify-center rounded-full text-[13px] font-semibold transition-colors",
                    !isSelected && weekday === 0 && "text-red-500",
                    !isSelected && weekday === 6 && "text-blue-500",
                    !isSelected && weekday !== 0 && weekday !== 6 && "text-foreground",
                    !isSelected && "hover:bg-muted",
                    isToday && !isSelected && "ring-1 ring-primary/30",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                  )}
                  onClick={() => handleSelect(cell.iso)}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2">
            <button
              type="button"
              className="text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => {
                const todayIso = formatIsoDate(today.year, today.month, today.day);

                setViewYear(today.year);
                setViewMonth(today.month);
                handleSelect(todayIso);
              }}
            >
              오늘
            </button>
            <button
              type="button"
              className="text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              disabled={!parsedValue}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              초기화
            </button>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
