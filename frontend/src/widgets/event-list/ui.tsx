"use client";

import Link from "next/link";
import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getSomaEventsPage } from "@/entities/soma-event/api";
import type { SomaEventType } from "@/entities/soma-event/model";
import { isPortalSessionExpired, usePortalAuthStore } from "@/features/auth/model";
import { UpcomingEventCard } from "@/widgets/upcoming-event-card/ui";
import { routes } from "@/shared/config/routes";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { PaginationControl } from "@/shared/ui/pagination-control";
import { SegmentControl } from "@/shared/ui/segment-control";

type EventTab = "ALL" | SomaEventType;

const options = [
  { label: "전체", value: "ALL" },
  { label: "멘토특강", value: "LECTURE" },
  { label: "자유멘토링", value: "MENTORING" },
] satisfies { label: string; value: EventTab }[];

export function EventList() {
  const [tab, setTab] = useState<EventTab>("ALL");
  const [page, setPage] = useState(1);
  const session = usePortalAuthStore((state) => state.session);
  const validSession = session && !isPortalSessionExpired(session) ? session : null;
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["events", validSession?.sessionId, page],
    queryFn: () => getSomaEventsPage(validSession!.sessionId, page),
    enabled: Boolean(validSession),
    placeholderData: keepPreviousData,
  });

  const events = (data?.items ?? []).filter((event) => {
    if (tab === "ALL") {
      return true;
    }

    return event.type === tab;
  });
  const totalPages = data?.totalPages ?? page;

  const handleTabChange = (nextTab: EventTab) => {
    setTab(nextTab);
    setPage(1);
  };

  return (
    <section className="sb-section">
      {!validSession ? (
        <EmptyState
          title="SOMA 포털 로그인이 필요해요"
          description="로그인하면 실제 멘토특강과 자유멘토링 목록을 불러옵니다."
          action={
            <Link
              className="inline-flex h-12 items-center rounded-lg bg-primary px-5 text-[16px] font-bold text-primary-foreground"
              href={routes.login}
            >
              로그인
            </Link>
          }
        />
      ) : null}
      {validSession ? (
        <>
          <SegmentControl options={options} value={tab} onValueChange={handleTabChange} />
          {isLoading ? <LoadingState /> : null}
          {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
          {data && events.length === 0 ? (
            <EmptyState title="일정이 없어요" description="이 페이지에는 조건에 맞는 일정이 없습니다." />
          ) : null}
          {events.length > 0 ? (
            <div className="sb-list-surface">
              {events.map((event) => (
                <UpcomingEventCard key={event.id} event={event} />
              ))}
            </div>
          ) : null}
          <PaginationControl
            isDisabled={isFetching}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </section>
  );
}
