"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Bell, CalendarDays, Clock3, Star } from "lucide-react";

import { getNotices } from "@/entities/notice/api";
import { getDashboardEvents } from "@/entities/soma-event/api";
import {
  getRecommendedEvents,
  useInterestPreferenceStore,
} from "@/features/user-interests/model";
import { routes } from "@/shared/config/routes";
import { formatOptionalDateTime } from "@/shared/lib/date";
import { EmptyState } from "@/shared/ui/empty-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { StatusBadge } from "@/shared/ui/status-badge";

const TYPE_LABEL = {
  LECTURE: "멘토특강",
  MENTORING: "자유멘토링",
} as const;

export function DashboardSummary() {
  const selectedTopicIds = useInterestPreferenceStore((state) => state.selectedTopicIds);
  const eventsQuery = useQuery({
    queryKey: ["dashboard-events"],
    queryFn: () => getDashboardEvents(),
  });
  const noticesQuery = useQuery({
    queryKey: ["dashboard-notices"],
    queryFn: () => getNotices(),
  });

  if (eventsQuery.isLoading || noticesQuery.isLoading) {
    return <LoadingState />;
  }

  const dashboard = eventsQuery.data;
  const notices = noticesQuery.data ?? [];
  const newNotices = notices.slice(0, 2);
  const upcoming = dashboard?.upcomingEvents ?? [];
  const recommendationCandidates = dashboard?.recommendationCandidates ?? [];
  const recommendedEvents = getRecommendedEvents(recommendationCandidates, selectedTopicIds, 3);
  const deadlineSoon = dashboard?.deadlineSoonEvents ?? [];

  return (
    <div className="space-y-8">
      <section className="sb-section">
        <div className="grid grid-cols-2 overflow-hidden rounded-xl bg-white">
          <Link
            className="min-h-24 border-r border-border/80 px-5 py-4 transition-colors hover:bg-muted/40"
            href={routes.events}
          >
            <CalendarDays aria-hidden="true" className="size-5 text-primary" />
            <p className="mt-3 text-[14px] font-semibold leading-[21px] text-muted-foreground">
              다가오는 일정
            </p>
            <p className="mt-1 text-[24px] font-bold leading-[32px]">{upcoming.length}개</p>
          </Link>
          <Link
            className="min-h-24 px-5 py-4 transition-colors hover:bg-muted/40"
            href={routes.notices}
          >
            <Bell aria-hidden="true" className="size-5 text-primary" />
            <p className="mt-3 text-[14px] font-semibold leading-[21px] text-muted-foreground">
              최근 공지
            </p>
            <p className="mt-1 text-[24px] font-bold leading-[32px]">{newNotices.length}개</p>
          </Link>
        </div>
      </section>

      <section className="sb-section">
        <div className="flex items-center gap-2">
          <CalendarDays aria-hidden="true" className="size-5 text-primary" />
          <h2 className="sb-section-title">다가오는 일정</h2>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState className="mt-3" title="다가오는 일정이 없어요" />
        ) : (
          <div className="sb-list-surface">
            {upcoming.map((event) => (
              <Link
                key={event.id}
                className="block border-b border-border/80 px-5 py-5 transition-colors last:border-b-0 hover:bg-muted/40"
                href={routes.eventDetail(event.id)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={event.type === "LECTURE" ? "blue" : "cyan"}>
                    {TYPE_LABEL[event.type]}
                  </StatusBadge>
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-muted-foreground">
                    <Clock3 aria-hidden="true" className="size-4" />
                    {formatOptionalDateTime(event.startAt)}
                  </span>
                </div>
                <p className="mt-3 text-[17px] font-semibold leading-[25.5px]">{event.title}</p>
                <p className="mt-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
                  {event.mentorName ?? "멘토 미정"} · {event.location ?? "장소 미정"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="sb-section">
        <div className="flex items-center gap-2">
          <Star aria-hidden="true" className="size-5 text-primary" />
          <h2 className="sb-section-title">추천 특강</h2>
        </div>
        {selectedTopicIds.length === 0 ? (
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
                  <p className="text-[17px] font-semibold leading-[25.5px]">{event.title}</p>
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
        <h2 className="sb-section-title">마감 임박</h2>
        {deadlineSoon.length === 0 ? (
          <EmptyState className="mt-3" title="마감 임박 일정이 없어요" />
        ) : (
          <div className="sb-list-surface">
            {deadlineSoon.map((event) => (
              <Link
                key={event.id}
                className="block border-b border-border/80 px-5 py-5 transition-colors last:border-b-0 hover:bg-muted/40"
                href={routes.eventDetail(event.id)}
              >
                <p className="text-[17px] font-semibold leading-[25.5px]">{event.title}</p>
                <p className="mt-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
                  {event.status === "OPEN" ? "신청 가능" : event.status}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="sb-section">
        <div className="flex items-center gap-2">
          <Bell aria-hidden="true" className="size-5 text-primary" />
          <h2 className="sb-section-title">최근 공지</h2>
        </div>
        {newNotices.length === 0 ? (
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
