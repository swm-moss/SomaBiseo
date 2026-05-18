import { AlertCircle } from "lucide-react";

import { Button } from "@/shared/ui/button";

export function ErrorState({
  title = "화면을 불러오지 못했어요",
  description = "잠시 뒤 다시 시도해 주세요.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <AlertCircle aria-hidden="true" className="size-5 text-destructive" />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          다시 시도
        </Button>
      ) : null}
    </div>
  );
}
