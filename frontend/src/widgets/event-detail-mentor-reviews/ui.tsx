"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getReviewFeed } from "@/entities/review/api";
import { reviewKeys } from "@/entities/review/keys";
import { routes } from "@/shared/config/routes";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { getRelativePublishedAt } from "@/shared/lib/date";

const VISIBLE_COUNT = 3;

export function EventDetailMentorReviews({
  mentorName,
}: {
  mentorName: string | null;
}) {
  const enabled = Boolean(mentorName && mentorName.trim() !== "");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: reviewKeys.feed("", null, mentorName, 1, VISIBLE_COUNT),
    queryFn: () =>
      getReviewFeed({
        mentorName: mentorName ?? undefined,
        page: 1,
        size: VISIBLE_COUNT,
      }),
    enabled,
  });

  const items = data?.items ?? [];

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[20px] font-black leading-[29px]">연수생 후기</h2>
        {enabled && data && data.totalElements > items.length ? (
          <Link
            href={routes.reviewsForMentor(mentorName!)}
            className="text-[14px] font-bold text-primary hover:underline"
          >
            더보기
          </Link>
        ) : null}
      </div>

      {!enabled ? (
        <EmptyState
          className="mt-3"
          title="멘토 정보가 없어요"
          description="원본 일정에서 멘토 정보를 찾지 못했습니다."
        />
      ) : null}

      {enabled && isLoading ? <LoadingState /> : null}
      {enabled && isError ? <ErrorState onRetry={() => void refetch()} /> : null}

      {enabled && data && items.length === 0 ? (
        <EmptyState
          className="mt-3"
          title="아직 등록된 후기가 없어요"
          description="이 멘토의 강의가 끝나면 연수생들이 후기를 남길 수 있어요."
        />
      ) : null}

      {enabled && items.length > 0 ? (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex h-full flex-col rounded-lg bg-white px-5 py-5"
            >
              <p className="text-[15px] font-extrabold leading-[22px] text-foreground">
                {item.eventTopic}
              </p>
              <p className="mt-3 line-clamp-4 flex-1 text-[14px] leading-[22px] text-[#4e5968]">
                {item.content}
              </p>
              <p className="mt-4 text-[13px] font-semibold text-muted-foreground">
                {item.authorName}
                <span aria-hidden="true" className="mx-1.5">
                  ·
                </span>
                {getRelativePublishedAt(item.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
