"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarClock, MessageSquare } from "lucide-react";

import { getRecentEndedEvents, getReviewSummaries } from "@/entities/review/api";
import { reviewKeys } from "@/entities/review/keys";
import { routes } from "@/shared/config/routes";
import { formatOptionalDateTime } from "@/shared/lib/date";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { StatusBadge } from "@/shared/ui/status-badge";

const TYPE_LABEL = {
  LECTURE: "멘토특강",
  MENTORING: "자유멘토링",
} as const;

const RECENT_LIMIT = 20;

export function ReviewList() {
  const {
    data: events,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: reviewKeys.recentEvents(RECENT_LIMIT),
    queryFn: () => getRecentEndedEvents(RECENT_LIMIT),
  });

  const eventIds = useMemo(() => events?.map((event) => event.eventId) ?? [], [events]);
  const { data: summaries } = useQuery({
    queryKey: reviewKeys.summaries(eventIds),
    queryFn: () => getReviewSummaries(eventIds),
    enabled: eventIds.length > 0,
  });

  const summaryByEvent = useMemo(() => {
    const map = new Map<string, number>();

    for (const summary of summaries ?? []) {
      map.set(summary.eventId, summary.reviewCount);
    }

    return map;
  }, [summaries]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  if (!events || events.length === 0) {
    return (
      <EmptyState
        title="아직 후기를 남길 강의가 없어요"
        description="강의가 종료되고 신청자 명단이 수집되면 여기에 표시됩니다."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {events.map((event) => {
        const reviewCount = summaryByEvent.get(event.eventId) ?? event.reviewCount;

        return (
          <li key={event.eventId}>
            <Link
              href={routes.reviewDetail(event.eventId)}
              className="block rounded-xl bg-white px-5 py-5 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={event.type === "LECTURE" ? "blue" : "cyan"}>
                  {TYPE_LABEL[event.type]}
                </StatusBadge>
                <span className="inline-flex items-center gap-1 text-[13px] font-bold text-muted-foreground">
                  <MessageSquare aria-hidden="true" className="size-4" />
                  후기 {reviewCount}
                </span>
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <h3 className="text-[18px] font-extrabold leading-[26px]">{event.title}</h3>
                <ArrowRight aria-hidden="true" className="mt-1 size-5 text-muted-foreground" />
              </div>
              <p className="mt-1 text-[14px] font-semibold text-muted-foreground">
                {event.mentorName ?? "멘토 미정"}
              </p>
              <p className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-muted-foreground">
                <CalendarClock aria-hidden="true" className="size-4" />
                {formatOptionalDateTime(event.endAt)} 종료
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
