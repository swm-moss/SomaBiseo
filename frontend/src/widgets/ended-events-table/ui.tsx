"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MessageSquareText, Search } from "lucide-react";

import { getEndedEvents } from "@/entities/review/api";
import { reviewKeys } from "@/entities/review/keys";
import type { EndedEvent } from "@/entities/review/model";
import type { SomaEventType } from "@/entities/soma-event/model";
import { WriteReviewDialog } from "@/features/write-review/ui";
import { routes } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { PaginationControl } from "@/shared/ui/pagination-control";
import { StatusBadge } from "@/shared/ui/status-badge";

const PAGE_SIZE = 10;

const TYPE_LABEL: Record<SomaEventType, string> = {
  LECTURE: "멘토특강",
  MENTORING: "자유멘토링",
};

type TypeFilter = "ALL" | SomaEventType;

const TYPE_OPTIONS: { label: string; value: TypeFilter }[] = [
  { label: "전체", value: "ALL" },
  { label: "멘토특강", value: "LECTURE" },
  { label: "자유멘토링", value: "MENTORING" },
];

const dayFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
});

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatDay(value: string) {
  return dayFormatter.format(new Date(value));
}

function formatTime(value: string) {
  return timeFormatter.format(new Date(value));
}

function parseTypeFilter(value: string | null): TypeFilter {
  if (value === "LECTURE" || value === "MENTORING") {
    return value;
  }

  return "ALL";
}

export function EndedEventsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQ = searchParams.get("q") ?? "";
  const typeFilter = parseTypeFilter(searchParams.get("type"));
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const [searchInput, setSearchInput] = useState(urlQ);
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);

  useEffect(() => {
    if (debouncedSearch === urlQ) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch === "") {
      params.delete("q");
    } else {
      params.set("q", debouncedSearch);
    }

    params.delete("page");

    const queryString = params.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [debouncedSearch, urlQ, searchParams, router, pathname]);

  const apiType: SomaEventType | undefined =
    typeFilter === "ALL" ? undefined : typeFilter;

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: reviewKeys.endedEvents(apiType ?? null, debouncedSearch, page),
    queryFn: () =>
      getEndedEvents({
        type: apiType,
        q: debouncedSearch,
        page,
        size: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  });

  const updateSearchParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());

    mutate(params);

    const queryString = params.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const changeTypeFilter = (next: TypeFilter) => {
    updateSearchParams((params) => {
      if (next === "ALL") {
        params.delete("type");
      } else {
        params.set("type", next);
      }

      params.delete("page");
    });
  };

  const changePage = (nextPage: number) => {
    updateSearchParams((params) => {
      if (nextPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(nextPage));
      }
    });
  };

  const totalElements = data?.totalElements ?? 0;
  const hasFilter = debouncedSearch.length > 0 || typeFilter !== "ALL";

  return (
    <section className="mt-6 lg:mt-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="relative lg:max-w-[420px] lg:flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
          />
          <input
            aria-label="강의 검색"
            className="h-12 w-full rounded-xl border-0 bg-muted pl-11 pr-4 text-[15px] font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:bg-white focus:ring-2 focus:ring-primary/25"
            placeholder="강의명·멘토명으로 검색"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {TYPE_OPTIONS.map((option) => {
            const isSelected = option.value === typeFilter;

            return (
              <button
                key={option.value}
                aria-pressed={isSelected}
                className={cn(
                  "h-10 shrink-0 rounded-full px-4 text-[14px] font-bold transition-colors",
                  isSelected
                    ? "bg-foreground text-white"
                    : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
                type="button"
                onClick={() => changeTypeFilter(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? <LoadingState /> : null}
        {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
        {data && data.items.length === 0 ? (
          <EmptyState
            title={hasFilter ? "조건에 맞는 강의가 없어요" : "끝난 강의가 아직 없어요"}
            description={
              hasFilter
                ? "검색어나 필터를 바꿔 보세요"
                : "강의가 종료되면 여기에서 후기를 남길 수 있어요"
            }
          />
        ) : null}
        {data && data.items.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-muted-foreground">
                총 <span className="text-foreground">{totalElements}</span>개 강의
              </p>
              {isFetching ? (
                <span className="text-[12px] font-semibold text-muted-foreground">
                  불러오는 중
                </span>
              ) : null}
            </div>

            <ul className="mt-3 flex flex-col gap-2 lg:hidden">
              {data.items.map((item) => (
                <EndedEventCard key={item.eventId} item={item} />
              ))}
            </ul>

            <div className="mt-3 hidden overflow-hidden rounded-2xl bg-white lg:block">
              <table className="w-full border-collapse text-left text-[15px]">
                <colgroup>
                  <col className="w-[110px]" />
                  <col />
                  <col className="w-[200px]" />
                  <col className="w-[140px]" />
                  <col className="w-[88px]" />
                  <col className="w-[220px]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border/70 bg-muted/40 text-[13px] font-bold text-muted-foreground">
                    <th className="px-5 py-3.5">유형</th>
                    <th className="px-5 py-3.5">제목</th>
                    <th className="px-5 py-3.5">진행일시</th>
                    <th className="px-5 py-3.5">멘토</th>
                    <th className="px-5 py-3.5 text-right">후기</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <EndedEventRow key={item.eventId} item={item} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
        {data ? (
          <PaginationControl
            isDisabled={isFetching}
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={changePage}
          />
        ) : null}
      </div>
    </section>
  );
}

function EndedEventRow({ item }: { item: EndedEvent }) {
  return (
    <tr className="border-b border-border/40 align-middle last:border-b-0 hover:bg-muted/30">
      <td className="px-5 py-4">
        <StatusBadge tone={item.type === "LECTURE" ? "blue" : "cyan"}>
          {TYPE_LABEL[item.type]}
        </StatusBadge>
      </td>
      <td className="px-5 py-4">
        <p className="text-[15px] font-bold leading-[22px] text-foreground">
          {item.title}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className="text-[14px] font-semibold text-foreground">{formatDay(item.endAt)}</p>
        <p className="mt-0.5 text-[13px] font-medium text-muted-foreground">
          {formatTime(item.startAt)} ~ {formatTime(item.endAt)}
        </p>
      </td>
      <td className="px-5 py-4 text-[14px] font-semibold text-foreground">
        {item.mentorName ?? <span className="text-muted-foreground">미정</span>}
      </td>
      <td className="px-5 py-4 text-right text-[15px] font-bold tabular-nums text-foreground">
        {item.reviewCount}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            className="inline-flex h-9 items-center gap-1 rounded-lg bg-muted px-3 text-[13px] font-bold text-foreground transition-colors hover:bg-secondary"
            href={routes.reviewsForEvent(item.eventId)}
          >
            <MessageSquareText aria-hidden="true" className="size-3.5" />
            후기 보기
          </Link>
          <WriteReviewDialog
            eventId={item.eventId}
            eventTitle={item.title}
            triggerLabel="후기 작성"
          />
        </div>
      </td>
    </tr>
  );
}

function EndedEventCard({ item }: { item: EndedEvent }) {
  return (
    <li className="rounded-2xl bg-white p-5">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
        <StatusBadge tone={item.type === "LECTURE" ? "blue" : "cyan"}>
          {TYPE_LABEL[item.type]}
        </StatusBadge>
        <span aria-hidden="true">·</span>
        <span>{item.mentorName ?? "멘토 미정"}</span>
      </div>
      <p className="mt-3 text-[16px] font-bold leading-[24px] text-foreground">
        {item.title}
      </p>
      <p className="mt-2 text-[13px] font-medium text-muted-foreground">
        {formatDay(item.endAt)} · {formatTime(item.startAt)} ~ {formatTime(item.endAt)}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-muted-foreground">
          후기 <span className="font-bold text-foreground">{item.reviewCount}</span>
        </span>
        <div className="flex items-center gap-2">
          <Link
            className="inline-flex h-9 items-center gap-1 rounded-lg bg-muted px-3 text-[13px] font-bold text-foreground transition-colors hover:bg-secondary"
            href={routes.reviewsForEvent(item.eventId)}
          >
            <MessageSquareText aria-hidden="true" className="size-3.5" />
            후기 보기
          </Link>
          <WriteReviewDialog
            eventId={item.eventId}
            eventTitle={item.title}
            triggerLabel="후기 작성"
          />
        </div>
      </div>
    </li>
  );
}
