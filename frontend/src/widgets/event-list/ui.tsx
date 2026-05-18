"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getSomaEvents } from "@/entities/soma-event/api";
import type { SomaEventType } from "@/entities/soma-event/model";
import { isPortalSessionExpired, usePortalAuthStore } from "@/features/auth/model";
import { UpcomingEventCard } from "@/widgets/upcoming-event-card/ui";
import { routes } from "@/shared/config/routes";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { SegmentControl } from "@/shared/ui/segment-control";
import Link from "next/link";

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
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["events", validSession?.sessionId, tab],
    queryFn: () => getSomaEvents(validSession!.sessionId, { type: tab === "ALL" ? undefined : tab }),
    enabled: Boolean(validSession),
  });

  return (
    <section className="sb-section">
      {!validSession ? (
        <EmptyState
          title="SOMA 포털 로그인이 필요해요"
          description="로그인하면 실제 멘토특강과 자유멘토링 목록을 불러옵니다."
          action={
            <Link
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
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
          {data?.length === 0 ? (
            <EmptyState title="일정이 없어요" description="조건에 맞는 특강이나 멘토링이 없습니다." />
          ) : null}
          {data && data.length > 0 ? (
            <div className="mt-3 rounded-lg bg-white px-4">
              {data.map((event) => (
                <UpcomingEventCard key={event.id} event={event} />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
