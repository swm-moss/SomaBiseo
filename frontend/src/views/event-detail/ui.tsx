import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, MapPin, Users } from "lucide-react";

import { getSomaEventById } from "@/entities/soma-event/api";
import { AddEventToCalendarButton } from "@/features/add-event-to-calendar/ui";
import { CalendarConflictResult } from "@/features/check-calendar-conflict/ui";
import { FavoriteEventButton } from "@/features/favorite-event/ui";
import { AppShell } from "@/widgets/app-shell/ui";
import { routes } from "@/shared/config/routes";
import { formatDateTime, formatTimeRange } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/status-badge";

const typeLabel = {
  LECTURE: "멘토특강",
  MENTORING: "자유멘토링",
} as const;

export async function EventDetailPage({ eventId }: { eventId: string }) {
  const event = await getSomaEventById(eventId);

  if (!event) {
    notFound();
  }

  return (
    <AppShell>
      <main className="sb-page">
        <Button asChild className="mb-5" variant="ghost">
          <Link href={routes.events}>
            <ArrowLeft aria-hidden="true" />
            일정 목록
          </Link>
        </Button>

        <article className="rounded-lg bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={event.type === "LECTURE" ? "blue" : "cyan"}>
                  {typeLabel[event.type]}
                </StatusBadge>
                <StatusBadge tone={event.status === "OPEN" ? "green" : "neutral"}>
                  {event.status}
                </StatusBadge>
              </div>
              <h1 className="mt-4 text-2xl font-black leading-9">{event.title}</h1>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">
                {event.mentorName}
              </p>
            </div>
            <FavoriteEventButton eventId={event.id} />
          </div>

          <div className="mt-8 grid gap-4">
            <div className="flex gap-3">
              <CalendarClock aria-hidden="true" className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="font-semibold">시간</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateTime(event.startAt)} · {formatTimeRange(event.startAt, event.endAt)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin aria-hidden="true" className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="font-semibold">장소</p>
                <p className="mt-1 text-sm text-muted-foreground">{event.location}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Users aria-hidden="true" className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="font-semibold">신청</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.capacity}명 · 마감 {formatDateTime(event.applicationEndAt)}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-base leading-8">{event.description}</p>

          <div className="mt-8 space-y-3">
            <CalendarConflictResult event={event} />
            <AddEventToCalendarButton event={event} />
          </div>
        </article>
      </main>
    </AppShell>
  );
}
