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
        "flex flex-col items-start gap-3 rounded-lg bg-white p-5",
        className,
      )}
    >
      <Inbox aria-hidden="true" className="size-5 text-muted-foreground" />
      <div>
        <p className="text-[17px] font-semibold leading-[25.5px]">{title}</p>
        {description ? (
          <p className="mt-1 text-[15px] leading-[22px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
