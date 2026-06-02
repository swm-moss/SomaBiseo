"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Bell, CalendarDays, Flame, Star } from "lucide-react";

import { getNotices } from "@/entities/notice/api";
import { getDashboardEvents } from "@/entities/soma-event/api";
import {
  getRecommendedEvents,
  useInterestPreferenceStore,
} from "@/features/user-interests/model";
import {
  useGoogleCalendarEventsInRange,
  useGoogleCalendarConnectionSync,
  useGoogleCalendarStore,
} from "@/features/connect-google-calendar/model";
import { useAuthStore } from "@/features/auth/model";
import { GoogleCalendarEventList } from "@/widgets/google-calendar-event-list/ui";
import { routes } from "@/shared/config/routes";
import { formatOptionalDateTime, getWeekRange } from "@/shared/lib/date";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { StatusBadge } from "@/shared/ui/status-badge";

const eventTypeLabel = {
  LECTURE: "멘토특강",
  MENTORING: "자유멘토링",
} as const;

export function DashboardSummary() {
  const sessionId = useAuthStore((state) => state.sessionId);
  const selectedTopicIds = useInterestPreferenceStore((state) => state.selectedTopicIds);
  useGoogleCalendarConnectionSync();
  const calendarConnected = useGoogleCalendarStore((state) => state.connected);
  const { start: weekStart, end: weekEnd } = getWeekRange();
  const calendarEventsQuery = useGoogleCalendarEventsInRange(weekStart, weekEnd);
  const eventsQuery = useQuery({
    queryKey: ["dashboard-events", sessionId],
    queryFn: () => getDashboardEvents(),
    enabled: Boolean(sessionId),
  });
  const noticesQuery = useQuery({
    queryKey: ["dashboard-notices", sessionId],
    queryFn: () => getNotices(),
    enabled: Boolean(sessionId),
  });

  if (!sessionId) {
    return <LoadingState />;
  }

  const dashboard = eventsQuery.data;
  const notices = noticesQuery.data ?? [];
  const newNotices = notices.slice(0, 2);
  const recommendationCandidates = dashboard?.recommendationCandidates ?? [];
  const recommendedEvents = getRecommendedEvents(recommendationCandidates, selectedTopicIds, 3);
  const almostFull = dashboard?.almostFullEvents ?? [];
  const calendarEventCount = calendarEventsQuery.data?.length ?? 0;
  const noticeSummaryValue = noticesQuery.isLoading ? "확인 중" : `${newNotices.length}개`;
  const calendarSummaryValue =
    calendarConnected && sessionId
      ? calendarEventsQuery.isLoading
        ? "확인 중"
        : `${calendarEventCount}개`
      : "연결 필요";

  return (
    <div className="space-y-8">
      <section className="sb-section">
        <div className="grid grid-cols-2 overflow-hidden rounded-xl bg-white">
          <Link
            className="min-h-24 border-r border-border/80 px-5 py-4 transition-colors hover:bg-muted/40"
            href="#my-calendar-events"
          >
            <CalendarDays aria-hidden="true" className="size-5 text-primary" />
            <p className="mt-3 text-[14px] font-semibold leading-[21px] text-muted-foreground">
              이번주 일정
            </p>
            <p className="mt-1 text-[24px] font-bold leading-[32px]">{calendarSummaryValue}</p>
          </Link>
          <Link
            className="min-h-24 px-5 py-4 transition-colors hover:bg-muted/40"
            href={routes.notices}
          >
            <Bell aria-hidden="true" className="size-5 text-primary" />
            <p className="mt-3 text-[14px] font-semibold leading-[21px] text-muted-foreground">
              최근 공지
            </p>
            <p className="mt-1 text-[24px] font-bold leading-[32px]">{noticeSummaryValue}</p>
          </Link>
        </div>
      </section>

      <section id="my-calendar-events" className="sb-section scroll-mt-24">
        <GoogleCalendarEventList />
      </section>

      <section className="sb-section">
        <div className="flex items-center gap-2">
          <Star aria-hidden="true" className="size-5 text-primary" />
          <h2 className="sb-section-title">추천 특강</h2>
        </div>
        {eventsQuery.isLoading ? (
          <LoadingState className="mt-3" />
        ) : eventsQuery.isError ? (
          <ErrorState
            description="추천 특강을 잠시 불러오지 못했어요."
            onRetry={() => void eventsQuery.refetch()}
          />
        ) : selectedTopicIds.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="관심사를 설정해 주세요"
            description="관심사를 고르면 관련 특강과 멘토링을 먼저 보여줘요."
            action={
              <Link
                className="inline-flex h-11 items-center rounded-lg bg-primary px-4 text-[15px] font-bold text-primary-foreground"
                href={routes.settings}
              >
                설정하기
              </Link>
            }
          />
        ) : recommendedEvents.length === 0 ? (
          <EmptyState className="mt-3" title="맞는 추천 없음" />
        ) : (
          <div className="sb-list-surface">
            {recommendedEvents.map(({ event, recommendation }) => (
              <Link
                key={event.id}
                className="block border-b border-border/80 px-5 py-5 transition-colors last:border-b-0 hover:bg-muted/40"
                href={routes.eventDetail(event.id)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[17px] font-semibold leading-[25.5px]">{event.topic}</p>
                  <span className="rounded-md bg-blue-50 px-2 text-[13px] font-bold leading-[24px] text-blue-700">
                    {recommendation.matchedTopics.map((topic) => topic.label).join(", ")}
                  </span>
                </div>
                <p className="mt-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
                  {event.mentorName ?? "멘토 미정"} · {formatOptionalDateTime(event.startAt)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="sb-section">
        <div className="flex items-center gap-2">
          <Flame aria-hidden="true" className="size-5 text-primary" />
          <h2 className="sb-section-title">마감 임박</h2>
        </div>
        {eventsQuery.isLoading ? (
          <LoadingState className="mt-3" />
        ) : eventsQuery.isError ? (
          <ErrorState
            description="마감 임박 일정을 잠시 불러오지 못했어요."
            onRetry={() => void eventsQuery.refetch()}
          />
        ) : almostFull.length === 0 ? (
          <EmptyState className="mt-3" title="마감 임박 일정이 없어요" />
        ) : (
          <div className="sb-list-surface">
            {almostFull.map((event) => {
              const remainingSeats =
                event.capacity != null && event.applicantCount != null
                  ? event.capacity - event.applicantCount
                  : null;

              return (
                <Link
                  key={event.id}
                  className="block border-b border-border/80 px-5 py-5 transition-colors last:border-b-0 hover:bg-muted/40"
                  href={routes.eventDetail(event.id)}
                >
                  <StatusBadge tone={event.type === "LECTURE" ? "blue" : "cyan"}>
                    {eventTypeLabel[event.type]}
                  </StatusBadge>
                  <p className="mt-2 text-[17px] font-semibold leading-[25.5px]">{event.topic}</p>
                  <p className="mt-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
                    {event.mentorName ?? "멘토 미정"} · {formatOptionalDateTime(event.startAt)}
                  </p>
                  {remainingSeats != null ? (
                    <p className="mt-1 text-[14px] font-semibold leading-[21px] text-red-600">
                      남은 자리 {remainingSeats}석
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="sb-section">
        <div className="flex items-center gap-2">
          <Bell aria-hidden="true" className="size-5 text-primary" />
          <h2 className="sb-section-title">최근 공지</h2>
        </div>
        {noticesQuery.isLoading ? (
          <LoadingState className="mt-3" />
        ) : noticesQuery.isError ? (
          <ErrorState
            description="최근 공지를 잠시 불러오지 못했어요."
            onRetry={() => void noticesQuery.refetch()}
          />
        ) : newNotices.length === 0 ? (
          <EmptyState className="mt-3" title="최근 공지가 없어요" />
        ) : (
          <div className="sb-list-surface">
            {newNotices.map((notice) => (
              <Link
                key={notice.id}
                className="block border-b border-border/80 px-5 py-5 transition-colors last:border-b-0 hover:bg-muted/40"
                href={routes.noticeDetail(notice.id)}
              >
                <p className="text-[17px] font-semibold leading-[25.5px]">{notice.title}</p>
                <p className="mt-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
                  {formatOptionalDateTime(notice.publishedAt)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
