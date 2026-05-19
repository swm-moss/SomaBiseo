"use client";

import Link from "next/link";
import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getSomaEventsPage, PORTAL_EVENT_PAGE_SIZE } from "@/entities/soma-event/api";
import type { SomaEventType } from "@/entities/soma-event/model";
import { isPortalSessionExpired, usePortalAuthStore } from "@/features/auth/model";
import { UpcomingEventCard } from "@/widgets/upcoming-event-card/ui";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { SegmentControl } from "@/shared/ui/segment-control";

type EventTab = "ALL" | SomaEventType;

const options = [
  { label: "전체", value: "ALL" },
  { label: "멘토특강", value: "LECTURE" },
  { label: "자유멘토링", value: "MENTORING" },
] satisfies { label: string; value: EventTab }[];

export function EventList() {
  const [tab, setTab] = useState<EventTab>("ALL");
  const session = usePortalAuthStore((state) => state.session);
  const validSession = session && !isPortalSessionExpired(session) ? session : null;
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["events", validSession?.sessionId],
      queryFn: ({ pageParam }) => getSomaEventsPage(validSession!.sessionId, pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length >= PORTAL_EVENT_PAGE_SIZE ? allPages.length + 1 : undefined,
      enabled: Boolean(validSession),
    });

  const allEvents = data?.pages.flat() ?? [];
  const events = allEvents.filter((event) => {
    if (tab === "ALL") {
      return true;
    }

    return event.type === tab;
  });

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
          <SegmentControl options={options} value={tab} onValueChange={setTab} />
          {isLoading ? <LoadingState /> : null}
          {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
          {data && events.length === 0 ? (
            <EmptyState title="일정이 없어요" description="조건에 맞는 특강이나 멘토링이 없습니다." />
          ) : null}
          {events.length > 0 ? (
            <div className="sb-list-surface">
              {events.map((event) => (
                <UpcomingEventCard key={event.id} event={event} />
              ))}
            </div>
          ) : null}
          {hasNextPage ? (
            <div className="mt-5 flex flex-col items-center gap-2">
              <Button
                className="w-full sm:w-auto"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
                type="button"
                variant="outline"
              >
                {isFetchingNextPage ? "불러오는 중" : "다음 페이지 더 보기"}
              </Button>
              {data ? (
                <p className="text-[13px] font-medium leading-[19.5px] text-muted-foreground">
                  {data.pages.length}페이지까지 불러왔어요
                </p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
