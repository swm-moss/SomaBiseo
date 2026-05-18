import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-lg border border-dashed bg-white p-5",
        className,
      )}
    >
      <Inbox aria-hidden="true" className="size-5 text-muted-foreground" />
      <div>
        <p className="font-semibold">{title}</p>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
