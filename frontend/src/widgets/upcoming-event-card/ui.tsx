import Link from "next/link";
import { AlertTriangle, MapPin } from "lucide-react";

import type { SomaEvent } from "@/entities/soma-event/model";
import { FavoriteEventButton } from "@/features/favorite-event/ui";
import { routes } from "@/shared/config/routes";
import { formatDateTime } from "@/shared/lib/date";
import { StatusBadge } from "@/shared/ui/status-badge";

const typeLabel = {
  LECTURE: "멘토특강",
  MENTORING: "자유멘토링",
} as const;

export function UpcomingEventCard({ event }: { event: SomaEvent }) {
  return (
    <article className="flex gap-3 border-b py-4 last:border-b-0">
      <Link className="min-w-0 flex-1" href={routes.eventDetail(event.id)}>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={event.type === "LECTURE" ? "blue" : "cyan"}>
            {typeLabel[event.type]}
          </StatusBadge>
          {event.conflict.hasConflict ? (
            <StatusBadge tone="amber">
              <AlertTriangle aria-hidden="true" className="mr-1 size-3" />
              일정 충돌
            </StatusBadge>
          ) : (
            <StatusBadge tone="green">충돌 없음</StatusBadge>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 text-base font-bold leading-6">{event.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {event.mentorName} · {formatDateTime(event.startAt)}
        </p>
        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="size-4" />
          {event.location}
        </p>
      </Link>
      <FavoriteEventButton eventId={event.id} />
    </article>
  );
}
