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
      role="status"
      aria-label={label}
      className={cn(
        "flex min-h-28 flex-col items-center justify-center gap-2.5 text-sm text-muted-foreground",
        className,
      )}
    >
      <div aria-hidden="true" className="sb-loader">
        <span className="sb-loader-dot" />
        <span className="sb-loader-dot" />
        <span className="sb-loader-dot" />
        <span className="sb-loader-dot" />
        <span className="sb-loader-dot" />
      </div>
      {label ? <span>{label}</span> : null}
    </div>
  );
}
