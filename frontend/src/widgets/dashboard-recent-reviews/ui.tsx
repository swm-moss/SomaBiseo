"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";

import { getReviewFeed } from "@/entities/review/api";
import { reviewKeys } from "@/entities/review/keys";
import { routes } from "@/shared/config/routes";
import { getRelativePublishedAt } from "@/shared/lib/date";
import { StatusBadge } from "@/shared/ui/status-badge";

const TYPE_LABEL = {
  LECTURE: "멘토특강",
  MENTORING: "자유멘토링",
} as const;

const DASHBOARD_LIMIT = 3;

export function DashboardRecentReviews() {
  const { data } = useQuery({
    queryKey: reviewKeys.feed("", null, 1, DASHBOARD_LIMIT),
    queryFn: () => getReviewFeed({ size: DASHBOARD_LIMIT }),
  });

  const items = data?.items ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="sb-section">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-2 text-[20px] font-black leading-[28px]">
            <MessageSquare aria-hidden="true" className="size-5 text-primary" />
            최근 후기
          </h2>
          <p className="mt-1 text-[14px] leading-[20px] text-muted-foreground">
            연수생들이 남긴 솔직한 후기를 살펴보세요.
          </p>
        </div>
        <Link
          href={routes.reviews}
          className="text-[14px] font-bold text-primary hover:underline"
        >
          전체 보기
        </Link>
      </header>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl bg-white px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={routes.reviewsForEvent(item.eventId)}
                className="min-w-0 flex-1 text-[15px] font-extrabold leading-[22px] text-foreground hover:underline"
              >
                {item.eventTitle}
              </Link>
              <StatusBadge
                className="shrink-0"
                tone={item.eventType === "LECTURE" ? "blue" : "cyan"}
              >
                {TYPE_LABEL[item.eventType]}
              </StatusBadge>
            </div>
            <p className="mt-1 text-[13px] font-medium text-muted-foreground">
              {item.mentorName ?? "멘토 미정"}
            </p>
            <p className="mt-2.5 line-clamp-2 text-[14px] leading-[21px] text-foreground">
              {item.content}
            </p>
            <p className="mt-3 text-[12px] font-medium text-muted-foreground">
              {item.authorName}
              <span aria-hidden="true" className="mx-1.5">
                ·
              </span>
              {getRelativePublishedAt(item.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
