import Link from "next/link";
import { AlertTriangle, CalendarCheck, MapPin } from "lucide-react";

import type { CalendarConflictStatus } from "@/entities/calendar/model";
import type { SomaEvent } from "@/entities/soma-event/model";
import { isEventClosed } from "@/entities/soma-event/model";
import type { EventRecommendation } from "@/features/user-interests/model";
import { FavoriteEventButton } from "@/features/favorite-event/ui";
import { routes } from "@/shared/config/routes";
import { formatOptionalDateTime } from "@/shared/lib/date";
import { cn } from "@/shared/lib/utils";
import { StatusBadge } from "@/shared/ui/status-badge";

const typeLabel = {
  LECTURE: "멘토특강",
  MENTORING: "자유멘토링",
} as const;

export function UpcomingEventCard({
  event,
  calendarCheckState = "idle",
  calendarStatus,
  recommendation,
}: {
  event: SomaEvent;
  calendarCheckState?: "idle" | "loading" | "ready" | "error";
  calendarStatus?: CalendarConflictStatus;
  recommendation?: EventRecommendation;
}) {
  const closed = isEventClosed(event);

  return (
    <article className={cn("sb-list-row", recommendation?.isRecommended && "sb-recommended-row")}>
      <Link className="min-w-0 flex-1" href={routes.eventDetail(event.id)}>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={event.type === "LECTURE" ? "blue" : "cyan"}>
            {typeLabel[event.type]}
          </StatusBadge>
          {recommendation?.isRecommended ? (
            <StatusBadge tone="blue">
              추천 {recommendation.matchedTopics.map((topic) => topic.label).join(", ")}
            </StatusBadge>
          ) : null}
          {closed ? <StatusBadge tone="red">마감</StatusBadge> : null}
          {calendarStatus?.alreadyAdded ? (
            <StatusBadge tone="green">
              <CalendarCheck aria-hidden="true" className="mr-1 size-3" />
              캘린더 추가됨
            </StatusBadge>
          ) : calendarStatus?.hasConflict ? (
            <StatusBadge tone="amber">
              <AlertTriangle aria-hidden="true" className="mr-1 size-3" />
              일정 충돌
            </StatusBadge>
          ) : calendarStatus ? (
            <StatusBadge tone="green">충돌 없음</StatusBadge>
          ) : calendarCheckState === "loading" ? (
            <StatusBadge tone="neutral">확인 중</StatusBadge>
          ) : calendarCheckState === "error" ? (
            <StatusBadge tone="red">확인 실패</StatusBadge>
          ) : null}
        </div>
        <h3 className="mt-2 line-clamp-2 text-[17px] font-extrabold leading-[25.5px]">
          {event.topic}
        </h3>
        <p className="mt-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
          {event.mentorName ?? "멘토 미정"} · {formatOptionalDateTime(event.startAt)}
        </p>
        <p className="mt-2 flex items-center gap-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
          <MapPin aria-hidden="true" className="size-4" />
          {event.location ?? "장소 미정"}
        </p>
      </Link>
      <FavoriteEventButton eventId={event.id} />
    </article>
  );
}
