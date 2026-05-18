import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/lib/utils";

export function AppCard({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 text-card-foreground shadow-[0_1px_2px_rgb(16_24_40_/_0.05)]",
        className,
      )}
      {...props}
    />
  );
}
