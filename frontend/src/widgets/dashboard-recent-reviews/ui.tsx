"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";

import { getReviewFeed } from "@/entities/review/api";
import { reviewKeys } from "@/entities/review/keys";
import { routes } from "@/shared/config/routes";
import { EmptyState } from "@/shared/ui/empty-state";

const DASHBOARD_LIMIT = 3;

export function DashboardRecentReviews() {
  const { data } = useQuery({
    queryKey: reviewKeys.feed("", null, 1, DASHBOARD_LIMIT),
    queryFn: () => getReviewFeed({ size: DASHBOARD_LIMIT }),
  });

  const items = data?.items ?? [];

  return (
    <section className="sb-section">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare aria-hidden="true" className="size-5 text-primary" />
          <h2 className="sb-section-title">최근 후기</h2>
        </div>
        <Link
          href={routes.reviews}
          className="text-[14px] font-bold text-primary hover:underline"
        >
          전체 보기
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState className="mt-3" title="아직 등록된 후기가 없어요" />
      ) : (
        <div className="sb-list-surface">
          {items.map((item) => (
            <Link
              key={item.id}
              className="block border-b border-border/80 px-5 py-5 transition-colors last:border-b-0 hover:bg-muted/40"
              href={routes.reviewsForEvent(item.eventId)}
            >
              <p className="text-[17px] font-semibold leading-[25.5px]">
                {item.eventTopic ?? item.eventTitle}
              </p>
              <p className="mt-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
                {item.mentorName ?? "멘토 미정"}
              </p>
              <p className="mt-2 line-clamp-2 text-[14px] leading-[21px] text-muted-foreground">
                {item.content}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
