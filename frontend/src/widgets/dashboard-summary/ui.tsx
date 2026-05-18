"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Bell, CalendarDays, Star } from "lucide-react";

import { getDashboardEvents } from "@/entities/soma-event/api";
import { getNotices } from "@/entities/notice/api";
import { isPortalSessionExpired, usePortalAuthStore } from "@/features/auth/model";
import { routes } from "@/shared/config/routes";
import { formatOptionalDateTime } from "@/shared/lib/date";
import { AppCard } from "@/shared/ui/app-card";
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
            className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
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
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href={routes.events}>
            <AppCard className="h-full">
              <CalendarDays aria-hidden="true" className="size-5 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">이번 주 일정</p>
              <p className="mt-1 text-2xl font-black">{upcoming.length}개</p>
            </AppCard>
          </Link>
          <Link href={routes.notices}>
            <AppCard className="h-full">
              <Bell aria-hidden="true" className="size-5 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">새 공지</p>
              <p className="mt-1 text-2xl font-black">{newNotices.length}개</p>
            </AppCard>
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
          <div className="mt-3 rounded-lg bg-white px-4">
            {conflicted.map((event) => (
              <Link
                key={event.id}
                className="block border-b py-4 last:border-b-0"
                href={routes.eventDetail(event.id)}
              >
                <p className="font-bold">{event.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
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
        <div className="mt-3 rounded-lg bg-white px-4">
          {upcoming.slice(0, 2).map((event) => (
            <Link
              key={event.id}
              className="block border-b py-4 last:border-b-0"
              href={routes.eventDetail(event.id)}
            >
              <p className="font-bold">{event.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {event.mentorName ?? "멘토 미정"} · {formatOptionalDateTime(event.startAt)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="sb-section">
        <h2 className="sb-section-title">마감 임박</h2>
        <div className="mt-3 rounded-lg bg-white px-4">
          {deadlineSoon.map((event) => (
            <Link
              key={event.id}
              className="block border-b py-4 last:border-b-0"
              href={routes.eventDetail(event.id)}
            >
              <p className="font-bold">{event.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {event.status === "OPEN" ? "신청 가능" : event.status}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
