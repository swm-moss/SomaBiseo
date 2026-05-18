import { LoaderCircle } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export function LoadingState({
  label = "불러오는 중",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
