"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";

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

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function todayInSeoul() {
  return isoDateFormatter.format(new Date());
}

export function EndedEventsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQ = searchParams.get("q") ?? "";
  const dateFilter = searchParams.get("date") ?? "";
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

  const apiDate = dateFilter || undefined;

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: reviewKeys.endedEvents(null, debouncedSearch, dateFilter || null, page),
    queryFn: () =>
      getEndedEvents({
        q: debouncedSearch,
        date: apiDate,
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

  const changeDateFilter = (next: string) => {
    updateSearchParams((params) => {
      if (next === "") {
        params.delete("date");
      } else {
        params.set("date", next);
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
  const hasFilter = debouncedSearch.length > 0 || dateFilter !== "";
  const maxDate = todayInSeoul();

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
        <div className="relative">
          <input
            aria-label="진행 날짜로 필터"
            className={cn(
              "h-12 rounded-xl border-0 bg-muted px-4 text-[15px] font-semibold outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-primary/25",
              dateFilter ? "text-foreground" : "text-muted-foreground",
              dateFilter ? "pr-10" : "pr-4",
            )}
            type="date"
            max={maxDate}
            value={dateFilter}
            onChange={(event) => changeDateFilter(event.target.value)}
          />
          {dateFilter ? (
            <button
              aria-label="날짜 필터 해제"
              className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-white text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              type="button"
              onClick={() => changeDateFilter("")}
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          ) : null}
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

            <ul className="mt-3 overflow-hidden rounded-2xl bg-white lg:hidden">
              {data.items.map((item, index) => (
                <EndedEventListItem
                  key={item.eventId}
                  item={item}
                  isLast={index === data.items.length - 1}
                />
              ))}
            </ul>

            <div className="mt-3 hidden overflow-hidden rounded-2xl bg-white lg:block">
              <table className="w-full border-collapse text-left text-[15px]">
                <colgroup>
                  <col className="w-[110px]" />
                  <col />
                  <col className="w-[200px]" />
                  <col className="w-[140px]" />
                  <col className="w-[80px]" />
                  <col className="w-[260px]" />
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
        <p className="text-[14px] font-semibold text-foreground">{formatDay(item.startAt)}</p>
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
            className="inline-flex h-9 items-center whitespace-nowrap rounded-lg bg-muted px-3.5 text-[13px] font-bold text-foreground transition-colors hover:bg-secondary"
            href={routes.reviewsForEvent(item.eventId)}
          >
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

function EndedEventListItem({
  item,
  isLast,
}: {
  item: EndedEvent;
  isLast: boolean;
}) {
  return (
    <li
      className={cn(
        "px-5 py-5",
        isLast ? null : "border-b border-border/60",
      )}
    >
      <h3 className="text-[17px] font-extrabold leading-[24px] text-foreground">
        {item.title}
      </h3>
      <p className="mt-1 text-[14px] font-semibold text-muted-foreground">
        {item.mentorName ?? "멘토 미정"}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-muted-foreground">
        <StatusBadge tone={item.type === "LECTURE" ? "blue" : "cyan"}>
          {TYPE_LABEL[item.type]}
        </StatusBadge>
        <span className="text-foreground">{formatDay(item.startAt)}</span>
        <span aria-hidden="true">·</span>
        <span>
          {formatTime(item.startAt)} ~ {formatTime(item.endAt)}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          후기 <span className="font-bold text-foreground">{item.reviewCount}</span>
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Link
          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-muted text-[14px] font-bold text-foreground transition-colors hover:bg-secondary"
          href={routes.reviewsForEvent(item.eventId)}
        >
          후기 보기
        </Link>
        <WriteReviewDialog
          eventId={item.eventId}
          eventTitle={item.title}
          triggerLabel="후기 작성"
          triggerClassName="h-10 flex-1"
        />
      </div>
    </li>
  );
}
