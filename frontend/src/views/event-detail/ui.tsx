"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, ExternalLink, MapPin, Users } from "lucide-react";

import { getSomaEventById } from "@/entities/soma-event/api";
import { AddEventToCalendarButton } from "@/features/add-event-to-calendar/ui";
import { isPortalSessionExpired, usePortalAuthStore } from "@/features/auth/model";
import { CalendarConflictResult } from "@/features/check-calendar-conflict/ui";
import { FavoriteEventButton } from "@/features/favorite-event/ui";
import { AppShell } from "@/widgets/app-shell/ui";
import { routes } from "@/shared/config/routes";
import { formatOptionalDateTime, formatOptionalTimeRange } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { StatusBadge } from "@/shared/ui/status-badge";

const typeLabel = {
  LECTURE: "멘토특강",
  MENTORING: "자유멘토링",
} as const;

export function EventDetailPage({ eventId }: { eventId: string }) {
  const session = usePortalAuthStore((state) => state.session);
  const validSession = session && !isPortalSessionExpired(session) ? session : null;
  const { data: event, isLoading, isError, refetch } = useQuery({
    queryKey: ["event", validSession?.sessionId, eventId],
    queryFn: () => getSomaEventById(validSession!.sessionId, eventId),
    enabled: Boolean(validSession),
  });

  return (
    <AppShell>
      <main className="sb-page">
        <Button asChild className="mb-5" variant="ghost">
          <Link href={routes.events}>
            <ArrowLeft aria-hidden="true" />
            일정 목록
          </Link>
        </Button>

        {!validSession ? (
          <EmptyState
            title="SOMA 포털 로그인이 필요해요"
            action={
              <Button asChild>
                <Link href={routes.login}>로그인</Link>
              </Button>
            }
          />
        ) : null}

        {validSession && isLoading ? <LoadingState /> : null}
        {validSession && isError ? <ErrorState onRetry={() => void refetch()} /> : null}
        {validSession && !isLoading && !isError && !event ? (
          <EmptyState title="일정 없음" description="목록에서 다시 선택해 주세요." />
        ) : null}

        {event ? (
          <article className="rounded-lg bg-white p-6">
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
                <h1 className="mt-4 text-[24px] font-black leading-[33px]">{event.title}</h1>
                <p className="mt-2 text-[14px] font-bold leading-[21px] text-muted-foreground">
                  {event.mentorName ?? "멘토 미정"}
                </p>
              </div>
              <FavoriteEventButton eventId={event.id} />
            </div>

            <div className="mt-8 grid gap-4">
              <div className="flex gap-3">
                <CalendarClock aria-hidden="true" className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-semibold">시간</p>
                <p className="mt-1 text-[15px] font-medium leading-[22px] text-muted-foreground">
                    {event.endAt
                      ? `${formatOptionalDateTime(event.startAt)} · ${formatOptionalTimeRange(
                          event.startAt,
                          event.endAt,
                        )}`
                      : formatOptionalDateTime(event.startAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-semibold">장소</p>
                <p className="mt-1 text-[15px] font-medium leading-[22px] text-muted-foreground">
                    {event.location ?? "장소 미정"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Users aria-hidden="true" className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-semibold">신청</p>
                <p className="mt-1 text-[15px] font-medium leading-[22px] text-muted-foreground">
                    {event.capacity ? `${event.capacity}명` : event.status}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-8 text-[17px] leading-[27px]">{event.description}</p>

            <div className="mt-8 space-y-3">
              <CalendarConflictResult event={event} />
              <AddEventToCalendarButton event={event} />
              <Button asChild className="w-full" variant="outline">
                <a href={event.sourceUrl} rel="noreferrer" target="_blank">
                  원본 보기
                  <ExternalLink aria-hidden="true" />
                </a>
              </Button>
            </div>
          </article>
        ) : null}
      </main>
    </AppShell>
  );
}
