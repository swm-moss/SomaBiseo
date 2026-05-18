import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/lib/utils";

export function AppCard({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg bg-card p-5 text-card-foreground",
        className,
      )}
      {...props}
    />
  );
}
