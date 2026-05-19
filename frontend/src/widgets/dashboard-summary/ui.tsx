"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Bell, CalendarDays, Star } from "lucide-react";

import { getDashboardEvents } from "@/entities/soma-event/api";
import { getNotices } from "@/entities/notice/api";
import { isPortalSessionExpired, usePortalAuthStore } from "@/features/auth/model";
import { routes } from "@/shared/config/routes";
import { formatOptionalDateTime } from "@/shared/lib/date";
import { EmptyState } from "@/shared/ui/empty-state";
import { LoadingState } from "@/shared/ui/loading-state";

export function DashboardSummary() {
  const session = usePortalAuthStore((state) => state.session);
  const validSession = session && !isPortalSessionExpired(session) ? session : null;
  const eventsQuery = useQuery({
    queryKey: ["dashboard-events", validSession?.sessionId],
    queryFn: () => getDashboardEvents(validSession!.sessionId),
    enabled: Boolean(validSession),
  });
  const noticesQuery = useQuery({
    queryKey: ["dashboard-notices", validSession?.sessionId],
    queryFn: () => getNotices(validSession!.sessionId),
    enabled: Boolean(validSession),
  });

  if (!validSession) {
    return (
      <EmptyState
        title="SOMA 포털 로그인이 필요해요"
        description="로그인하면 실제 공지와 멘토링 일정이 이 화면에 표시됩니다."
        action={
          <Link
            className="inline-flex h-12 items-center rounded-lg bg-primary px-5 text-[16px] font-semibold text-primary-foreground"
            href={routes.login}
          >
            로그인
          </Link>
        }
      />
    );
  }

  if (eventsQuery.isLoading || noticesQuery.isLoading) {
    return <LoadingState />;
  }

  const dashboard = eventsQuery.data;
  const notices = noticesQuery.data ?? [];
  const newNotices = notices.slice(0, 2);
  const upcoming = dashboard?.upcomingEvents ?? [];
  const deadlineSoon = dashboard?.deadlineSoonEvents ?? [];
  const conflicted = dashboard?.conflictedEvents ?? [];

  return (
    <div className="space-y-5">
      <section className="sb-section">
        <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-white">
          <Link className="min-h-28 border-r border-border/80 p-5" href={routes.events}>
            <CalendarDays aria-hidden="true" className="size-5 text-primary" />
            <p className="mt-3 text-[14px] font-semibold leading-[21px] text-muted-foreground">
              이번 주 일정
            </p>
            <p className="mt-1 text-[26px] font-bold leading-[35px]">{upcoming.length}개</p>
          </Link>
          <Link className="min-h-28 p-5" href={routes.notices}>
            <Bell aria-hidden="true" className="size-5 text-primary" />
            <p className="mt-3 text-[14px] font-semibold leading-[21px] text-muted-foreground">
              새 공지
            </p>
            <p className="mt-1 text-[26px] font-bold leading-[35px]">{newNotices.length}개</p>
          </Link>
        </div>
      </section>

      <section className="sb-section">
        <div className="flex items-center gap-2">
          <AlertTriangle aria-hidden="true" className="size-5 text-amber-600" />
          <h2 className="sb-section-title">충돌 확인</h2>
        </div>
        {conflicted.length === 0 ? (
          <EmptyState className="mt-3" title="겹치는 일정 없음" />
        ) : (
          <div className="sb-list-surface">
            {conflicted.map((event) => (
              <Link
                key={event.id}
                className="block border-b border-border/80 px-5 py-5 last:border-b-0"
                href={routes.eventDetail(event.id)}
              >
                <p className="text-[17px] font-semibold leading-[25.5px]">{event.title}</p>
                <p className="mt-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
                  {formatOptionalDateTime(event.startAt)}
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
        <div className="sb-list-surface">
          {upcoming.slice(0, 2).map((event) => (
            <Link
              key={event.id}
              className="block border-b border-border/80 px-5 py-5 last:border-b-0"
              href={routes.eventDetail(event.id)}
            >
              <p className="text-[17px] font-semibold leading-[25.5px]">{event.title}</p>
              <p className="mt-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
                {event.mentorName ?? "멘토 미정"} · {formatOptionalDateTime(event.startAt)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="sb-section">
        <h2 className="sb-section-title">마감 임박</h2>
        <div className="sb-list-surface">
          {deadlineSoon.map((event) => (
            <Link
              key={event.id}
              className="block border-b border-border/80 px-5 py-5 last:border-b-0"
              href={routes.eventDetail(event.id)}
            >
              <p className="text-[17px] font-semibold leading-[25.5px]">{event.title}</p>
              <p className="mt-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
                {event.status === "OPEN" ? "신청 가능" : event.status}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
