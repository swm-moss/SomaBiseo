import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/lib/utils";

type StatusBadgeTone = "neutral" | "blue" | "green" | "red" | "amber" | "cyan";

const toneClassName: Record<StatusBadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-700",
  cyan: "bg-cyan-50 text-cyan-700",
};

type StatusBadgeProps = ComponentPropsWithoutRef<"span"> & {
  tone?: StatusBadgeTone;
};

export function StatusBadge({ className, tone = "neutral", ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-md px-2 text-[13px] font-bold leading-[19.5px]",
        toneClassName[tone],
        className,
      )}
      {...props}
    />
  );
}
