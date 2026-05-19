"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, MessageSquare, UserRound } from "lucide-react";

import { getRecentEndedEvents, getReviewsPage } from "@/entities/review/api";
import { reviewKeys } from "@/entities/review/keys";
import { WriteReviewDialog } from "@/features/write-review/ui";
import { routes } from "@/shared/config/routes";
import { formatOptionalDateTime, getRelativePublishedAt } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { PaginationControl } from "@/shared/ui/pagination-control";
import { StatusBadge } from "@/shared/ui/status-badge";

const TYPE_LABEL = {
  LECTURE: "멘토특강",
  MENTORING: "자유멘토링",
} as const;

const RECENT_LOOKUP_LIMIT = 30;
const PAGE_SIZE = 10;

export function ReviewDetailList({ eventId }: { eventId: string }) {
  const [page, setPage] = useState(1);

  const { data: recentEvents } = useQuery({
    queryKey: reviewKeys.recentEvents(RECENT_LOOKUP_LIMIT),
    queryFn: () => getRecentEndedEvents(RECENT_LOOKUP_LIMIT),
  });

  const event = useMemo(
    () => recentEvents?.find((item) => item.eventId === eventId),
    [recentEvents, eventId],
  );

  const {
    data: reviewPage,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: reviewKeys.list(eventId, page),
    queryFn: () => getReviewsPage(eventId, page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  return (
    <section className="sb-section">
      <Button asChild className="mb-4" variant="ghost">
        <Link href={routes.reviews}>
          <ArrowLeft aria-hidden="true" />
          후기 목록
        </Link>
      </Button>

      <header className="rounded-xl bg-white px-5 py-5">
        {event ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={event.type === "LECTURE" ? "blue" : "cyan"}>
                {TYPE_LABEL[event.type]}
              </StatusBadge>
              <span className="inline-flex items-center gap-1 text-[13px] font-bold text-muted-foreground">
                <MessageSquare aria-hidden="true" className="size-4" />
                후기 {reviewPage?.totalElements ?? 0}
              </span>
            </div>
            <Link
              href={routes.eventDetail(eventId)}
              className="mt-3 inline-block text-[20px] font-black leading-[28px] hover:underline"
            >
              {event.title}
            </Link>
            <p className="mt-1 text-[14px] font-semibold text-muted-foreground">
              {event.mentorName ?? "멘토 미정"}
            </p>
            <p className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-muted-foreground">
              <CalendarClock aria-hidden="true" className="size-4" />
              {formatOptionalDateTime(event.endAt)} 종료
            </p>
          </>
        ) : (
          <Link
            href={routes.eventDetail(eventId)}
            className="text-[18px] font-extrabold hover:underline"
          >
            강의 정보 보기 →
          </Link>
        )}
        <div className="mt-4">
          <WriteReviewDialog preselectedEventId={eventId} />
        </div>
      </header>

      <div className="mt-4">
        {isLoading ? <LoadingState /> : null}
        {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
        {reviewPage && reviewPage.items.length === 0 ? (
          <EmptyState
            title="첫 후기를 남겨보세요"
            description="후기를 남기면 다른 연수생들에게도 큰 도움이 됩니다."
          />
        ) : null}
        {reviewPage && reviewPage.items.length > 0 ? (
          <ul className="space-y-3">
            {reviewPage.items.map((review) => (
              <li key={review.id} className="rounded-xl bg-white px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 text-[15px] font-extrabold">
                    <UserRound aria-hidden="true" className="size-4 text-muted-foreground" />
                    {review.authorName}
                  </p>
                  <span className="text-[12px] font-semibold text-muted-foreground">
                    {getRelativePublishedAt(review.createdAt)}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-[15px] font-medium leading-[24px] text-[#4e5968]">
                  {review.content}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
        {reviewPage ? (
          <PaginationControl
            isDisabled={isFetching}
            page={reviewPage.page}
            totalPages={reviewPage.totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </div>
    </section>
  );
}
