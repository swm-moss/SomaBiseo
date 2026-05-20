"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, MessageSquare } from "lucide-react";

import { getEndedEvents } from "@/entities/review/api";
import { reviewKeys } from "@/entities/review/keys";
import { WriteReviewDialog } from "@/features/write-review/ui";
import { routes } from "@/shared/config/routes";
import { formatOptionalDateTime } from "@/shared/lib/date";
import { StatusBadge } from "@/shared/ui/status-badge";

const TYPE_LABEL = {
  LECTURE: "멘토특강",
  MENTORING: "자유멘토링",
} as const;

const DASHBOARD_LIMIT = 3;

export function DashboardReviewPrompt() {
  const { data } = useQuery({
    queryKey: reviewKeys.endedEvents(null, "", null, 1),
    queryFn: () => getEndedEvents({ size: DASHBOARD_LIMIT }),
  });

  const events = data?.items ?? [];

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="sb-section">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-2 text-[20px] font-black leading-[28px]">
            <MessageSquare aria-hidden="true" className="size-5 text-primary" />
            최근 끝난 강의
          </h2>
          <p className="mt-1 text-[14px] leading-[20px] text-muted-foreground">
            이 강의 들으셨나요? 후기를 작성해 연수생들과 공유해 보세요!
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
        {events.map((event) => (
          <li key={event.eventId} className="rounded-xl bg-white px-5 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={event.type === "LECTURE" ? "blue" : "cyan"}>
                {TYPE_LABEL[event.type]}
              </StatusBadge>
              <span className="inline-flex items-center gap-1 text-[13px] font-bold text-muted-foreground">
                <CalendarCheck aria-hidden="true" className="size-4" />
                {formatOptionalDateTime(event.endAt)} 종료
              </span>
            </div>
            <Link
              href={routes.eventDetail(event.eventId)}
              className="mt-3 inline-block text-[17px] font-extrabold leading-[25px] hover:underline"
            >
              {event.title}
            </Link>
            <p className="mt-1 text-[13px] font-semibold text-muted-foreground">
              {event.mentorName ?? "멘토 미정"} · 후기 {event.reviewCount}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <WriteReviewDialog
                eventId={event.eventId}
                eventTitle={event.title}
                triggerClassName="w-full sm:w-auto"
              />
              <Link
                href={routes.reviewsForEvent(event.eventId)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-white px-4 text-[14px] font-bold text-foreground hover:bg-muted"
              >
                후기 보기
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
