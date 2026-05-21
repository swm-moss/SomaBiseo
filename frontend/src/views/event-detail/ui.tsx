"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  MapPin,
  RefreshCcw,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { getSomaEventById, summarizeSomaEvent } from "@/entities/soma-event/api";
import type { EventAiSummary, SomaEvent, SomaEventApplicant } from "@/entities/soma-event/model";
import { AddEventToCalendarButton } from "@/features/add-event-to-calendar/ui";
import { CalendarConflictResult } from "@/features/check-calendar-conflict/ui";
import { FavoriteEventButton } from "@/features/favorite-event/ui";
import { AppShell } from "@/widgets/app-shell/ui";
import { EventDetailMentorReviews } from "@/widgets/event-detail-mentor-reviews/ui";
import { routes } from "@/shared/config/routes";
import { formatOptionalDateTime, formatOptionalTimeRange, getRelativeTimeAgo } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { StatusBadge } from "@/shared/ui/status-badge";

const typeLabel = {
  LECTURE: "멘토특강",
  MENTORING: "자유멘토링",
} as const;

const statusLabel: Record<string, string> = {
  OPEN: "신청 가능",
  CLOSED: "마감",
  FULL: "정원 마감",
  SCHEDULED: "예정",
  CANCELED: "취소",
  UNKNOWN: "상태 미확인",
};

const detailLabelMap: Record<string, string> = {
  모집명: "모집 명",
  상태: "상태",
  개설승인: "개설 승인",
  접수기간: "접수 기간",
  강의날짜: "강의 날짜",
  진행방식: "진행 방식",
  장소: "장소",
  모집인원: "모집 인원",
  작성자: "작성자",
  등록일: "등록일",
};

function normalizedLabel(label: string) {
  return label.replace(/\s+/g, "");
}

function displayLabel(label: string) {
  return detailLabelMap[normalizedLabel(label)] ?? label;
}

function getDetailItems(event: SomaEvent) {
  if (event.detailItems.length > 0) {
    return event.detailItems;
  }

  return [
    { label: "강의 날짜", value: event.startAt ? formatOptionalDateTime(event.startAt) : "시간 미정" },
    event.location ? { label: "장소", value: event.location } : null,
    { label: "상태", value: statusLabel[event.status] ?? event.status },
    {
      label: "모집 인원",
      value: event.capacity ? `${event.capacity}명` : "미정",
    },
  ].filter((item): item is { label: string; value: string } => item !== null);
}

function contentLines(event: SomaEvent) {
  return (event.contentText ?? "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function applicantTone(applicant: SomaEventApplicant) {
  return applicant.status.includes("취소") ? "text-destructive" : "text-primary";
}

function AiSummarySection({
  isError,
  isLoading,
  onRetry,
  summary,
}: {
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
  summary: EventAiSummary | undefined;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles aria-hidden="true" className="size-5 text-primary" />
          <h2 className="text-[20px] font-bold leading-[29px]">AI 요약</h2>
        </div>
        {summary ? (
          <span className="text-[13px] font-semibold text-muted-foreground">
            {summary.cached ? "캐시됨" : "새 요약"}
          </span>
        ) : null}
      </div>

      <div className="mt-3 rounded-lg bg-white px-5 py-5">
        {isLoading ? (
          <div className="space-y-3" aria-label="AI 요약 생성 중">
            <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ) : null}

        {isError ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px] font-semibold leading-[23px] text-muted-foreground">
              요약을 만들지 못했어요.
            </p>
            <Button className="shrink-0" onClick={onRetry} variant="ghost">
              <RefreshCcw aria-hidden="true" />
              다시
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && summary ? (
          <div className="space-y-5">
            <p className="text-[17px] font-bold leading-[27px] text-foreground">{summary.oneLine}</p>

            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="blue">난이도 {summary.difficulty}</StatusBadge>
              {summary.keyTopics.slice(0, 4).map((topic) => (
                <StatusBadge key={topic} tone="neutral">
                  {topic}
                </StatusBadge>
              ))}
            </div>

            <div className="space-y-5">
              <SummaryList title="핵심" items={summary.summaryBullets} />
              <SummaryList title="추천 대상" items={summary.targetAudience} />
              <SummaryList title="얻는 것" items={summary.takeaways} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SummaryList({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <p className="text-[13px] font-bold leading-[19px] text-muted-foreground">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-[15px] font-medium leading-[23px] text-[#4e5968]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EventDetailPage({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const locationRefreshRequestedRef = useRef<string | null>(null);
  const { data: event, isLoading, isError, refetch } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getSomaEventById(eventId),
  });
  const {
    data: aiSummary,
    isError: isAiSummaryError,
    isLoading: isAiSummaryLoading,
    refetch: refetchAiSummary,
  } = useQuery({
    queryKey: ["event-ai-summary", event?.sourceId, event?.sourceUrl],
    queryFn: () => summarizeSomaEvent(event!.sourceUrl),
    enabled: Boolean(event?.sourceUrl),
    staleTime: 10 * 60_000,
  });
  const refreshDetailMutation = useMutation({
    mutationFn: (variables: { silent?: boolean }) => {
      void variables;

      return getSomaEventById(eventId, { refresh: true });
    },
    onSuccess: async (freshEvent, variables) => {
      queryClient.setQueryData(["event", eventId], freshEvent);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["events"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-events"] }),
      ]);

      if (!variables.silent) {
        toast.success("원본 정보를 다시 확인했어요.");
      }
    },
    onError: (_error, variables) => {
      if (!variables.silent) {
        toast.error("원본 정보를 다시 확인하지 못했어요.");
      }
    },
  });
  const eventContentLines = event ? contentLines(event) : [];
  const hasLocation = Boolean(event?.location);

  useEffect(() => {
    if (!event || event.location || refreshDetailMutation.isPending) {
      return;
    }

    if (locationRefreshRequestedRef.current === event.id) {
      return;
    }

    locationRefreshRequestedRef.current = event.id;
    refreshDetailMutation.mutate({ silent: true });
  }, [event, refreshDetailMutation]);

  return (
    <AppShell>
      <main className="sb-page">
        <Button asChild className="mb-5" variant="ghost">
          <Link href={routes.events}>
            <ArrowLeft aria-hidden="true" />
            일정 목록
          </Link>
        </Button>

        {isLoading ? <LoadingState /> : null}
        {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
        {!isLoading && !isError && !event ? (
          <EmptyState title="일정 없음" description="목록에서 다시 선택해 주세요." />
        ) : null}

        {event ? (
          <article className="space-y-14">
            <section className="border-b border-border/80 pb-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone={event.type === "LECTURE" ? "blue" : "cyan"}>
                      {typeLabel[event.type]}
                    </StatusBadge>
                    <StatusBadge tone={event.status === "OPEN" ? "green" : "neutral"}>
                      {statusLabel[event.status] ?? event.status}
                    </StatusBadge>
                    {event.approvalStatus ? (
                      <StatusBadge tone="blue">승인 {event.approvalStatus}</StatusBadge>
                    ) : null}
                  </div>
                  <h1 className="mt-4 max-w-4xl text-[28px] font-black leading-[38px] tracking-normal sm:text-[34px] sm:leading-[46px]">
                    {event.topic}
                  </h1>
                  <p className="mt-3 text-[15px] font-bold leading-[22px] text-muted-foreground">
                    {event.mentorName ?? event.author ?? "멘토 미정"}
                  </p>
                </div>
                <FavoriteEventButton eventId={event.id} />
              </div>

              <div className={`mt-7 grid gap-3 sm:grid-cols-2 ${hasLocation ? "lg:grid-cols-3" : ""}`}>
                <div className="flex gap-3 rounded-lg bg-white px-4 py-4">
                  <CalendarClock aria-hidden="true" className="mt-0.5 size-5 text-primary" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold leading-[19px] text-muted-foreground">시간</p>
                    <p className="mt-1 text-[15px] font-extrabold leading-[22px]">
                      {event.endAt
                        ? `${formatOptionalDateTime(event.startAt)} · ${formatOptionalTimeRange(
                            event.startAt,
                            event.endAt,
                          )}`
                        : formatOptionalDateTime(event.startAt)}
                    </p>
                  </div>
                </div>
                {event.location || refreshDetailMutation.isPending ? (
                  <div className="flex gap-3 rounded-lg bg-white px-4 py-4">
                    <MapPin
                      aria-hidden="true"
                      className={`mt-0.5 size-5 ${event.location ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold leading-[19px] text-muted-foreground">장소</p>
                      <p className="mt-1 text-[15px] font-extrabold leading-[22px] text-foreground">
                        {event.location ?? "원본 확인 중"}
                      </p>
                    </div>
                  </div>
                ) : null}
                <div className="flex gap-3 rounded-lg bg-white px-4 py-4">
                  <Users aria-hidden="true" className="mt-0.5 size-5 text-primary" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold leading-[19px] text-muted-foreground">신청</p>
                    <p className="mt-1 text-[15px] font-extrabold leading-[22px]">
                      {event.applicantCount ?? event.applicants.length}
                      {event.capacity ? ` / ${event.capacity}` : ""}명
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <AiSummarySection
              isError={isAiSummaryError}
              isLoading={isAiSummaryLoading}
              onRetry={() => void refetchAiSummary()}
              summary={aiSummary}
            />

            <section>
              <h2 className="text-[20px] font-black leading-[29px]">상세 정보</h2>
              <div className="mt-3 overflow-hidden rounded-lg border border-border/80 bg-white">
                <dl className="grid lg:grid-cols-2">
                  {getDetailItems(event).map((item) => (
                    <div
                      key={`${item.label}-${item.value}`}
                      className="grid grid-cols-[92px_1fr] gap-4 border-b border-border/70 px-4 py-4 last:border-b-0 sm:grid-cols-[120px_1fr] lg:border-r lg:even:border-r-0 lg:[&:nth-last-child(-n+2)]:border-b-0"
                    >
                      <dt className="text-[14px] font-extrabold leading-[22px] text-muted-foreground">
                        {displayLabel(item.label)}
                      </dt>
                      <dd className="min-w-0 text-[15px] font-bold leading-[23px] text-foreground">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            <section>
              <h2 className="text-[20px] font-black leading-[29px]">멘토링 내용</h2>
              <div className="mt-3 rounded-lg bg-white px-5 py-5">
                {eventContentLines.length > 0 ? (
                  eventContentLines.map((line, index) => (
                    <p key={`${index}-${line}`} className="text-[16px] font-medium leading-[27px] text-[#4e5968]">
                      {line}
                    </p>
                  ))
                ) : (
                  <EmptyState title="본문 없음" description="포털 상세 페이지에서 본문 영역을 찾지 못했습니다." />
                )}
              </div>
            </section>

            <EventDetailMentorReviews mentorName={event.mentorName} />

            <section>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-black leading-[29px]">신청자 리스트</h2>
                    <span className="inline-flex items-center gap-1 text-[14px] font-extrabold text-primary">
                      <CheckCircle2 aria-hidden="true" className="size-4" />
                      {event.applicantCount ?? event.applicants.length}명
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] font-semibold leading-[19px] text-muted-foreground">
                    {refreshDetailMutation.isPending
                      ? "원본 확인 중"
                      : event.detailSyncedAt
                        ? `원본 확인 ${getRelativeTimeAgo(event.detailSyncedAt)}`
                        : "원본 확인 필요"}
                  </p>
                </div>
                <Button
                  className="h-10 w-full sm:w-auto"
                  disabled={refreshDetailMutation.isPending}
                  onClick={() => refreshDetailMutation.mutate({ silent: false })}
                  variant="outline"
                >
                  <RefreshCcw
                    aria-hidden="true"
                    className={refreshDetailMutation.isPending ? "animate-spin" : undefined}
                  />
                  새로고침
                </Button>
              </div>
              {event.applicants.length > 0 ? (
                <>
                  <div className="mt-3 divide-y divide-border/70 overflow-hidden rounded-lg bg-white md:hidden">
                    {event.applicants.map((applicant) => (
                      <div key={`${applicant.no}-${applicant.traineeName}`} className="px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <UserRound aria-hidden="true" className="size-4 text-muted-foreground" />
                            <p className="truncate text-[16px] font-extrabold">
                              {applicant.traineeName}
                            </p>
                          </div>
                          <p className={`shrink-0 text-[13px] font-extrabold ${applicantTone(applicant)}`}>
                            {applicant.status}
                          </p>
                        </div>
                        <p className="mt-2 text-[14px] font-semibold leading-[21px] text-muted-foreground">
                          신청 {applicant.appliedAt}
                          {applicant.canceledAt ? ` · 취소 ${applicant.canceledAt}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 hidden overflow-hidden rounded-lg bg-white md:block">
                    <table className="w-full table-fixed text-left">
                      <thead className="border-b border-border/80 bg-muted/60">
                        <tr className="text-[14px] font-extrabold text-muted-foreground">
                          <th className="w-20 px-5 py-4">NO.</th>
                          <th className="px-5 py-4">연수생</th>
                          <th className="px-5 py-4">신청일</th>
                          <th className="px-5 py-4">취소일</th>
                          <th className="w-32 px-5 py-4">상태</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/70">
                        {event.applicants.map((applicant) => (
                          <tr key={`${applicant.no}-${applicant.traineeName}`} className="text-[15px] font-bold">
                            <td className="px-5 py-4 text-muted-foreground">{applicant.no}</td>
                            <td className="px-5 py-4">{applicant.traineeName}</td>
                            <td className="px-5 py-4 text-[#4e5968]">{applicant.appliedAt}</td>
                            <td className="px-5 py-4 text-[#4e5968]">{applicant.canceledAt ?? "-"}</td>
                            <td className={`px-5 py-4 ${applicantTone(applicant)}`}>{applicant.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <EmptyState title="신청자 정보 없음" description="포털 상세 페이지에서 신청자 목록을 찾지 못했습니다." />
              )}
            </section>

            <section className="space-y-3">
              <CalendarConflictResult event={event} />
              <AddEventToCalendarButton event={event} />
              <Button asChild className="w-full" variant="outline">
                <a href={event.sourceUrl} rel="noreferrer" target="_blank">
                  원본 보기
                  <ExternalLink aria-hidden="true" />
                </a>
              </Button>
            </section>
          </article>
        ) : null}
      </main>
    </AppShell>
  );
}
