"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MessageSquareText, Search } from "lucide-react";

import { getEndedEvents } from "@/entities/review/api";
import { reviewKeys } from "@/entities/review/keys";
import type { SomaEventType } from "@/entities/soma-event/model";
import { WriteReviewDialog } from "@/features/write-review/ui";
import { routes } from "@/shared/config/routes";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { PaginationControl } from "@/shared/ui/pagination-control";
import { SegmentControl } from "@/shared/ui/segment-control";
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
    <section className="sb-section">
      <div className="space-y-3">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            aria-label="강의 검색"
            className="sb-field h-11 w-full pl-10"
            placeholder="강의명·멘토명으로 검색"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <SegmentControl<TypeFilter>
          options={TYPE_OPTIONS}
          value={typeFilter}
          onValueChange={changeTypeFilter}
        />
      </div>

      <div className="mt-4">
        {isLoading ? <LoadingState /> : null}
        {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
        {data && data.items.length === 0 ? (
          <EmptyState
            title={hasFilter ? "조건에 맞는 강의가 없어요" : "끝난 강의가 아직 없어요"}
            description={
              hasFilter
                ? "검색어나 필터를 바꿔 보세요."
                : "강의가 종료되면 여기에서 후기를 남길 수 있어요."
            }
          />
        ) : null}
        {data && data.items.length > 0 ? (
          <>
            <p className="text-[13px] font-semibold text-muted-foreground">
              총 {totalElements}개 강의
            </p>
            <div className="-mx-5 mt-3 overflow-x-auto px-5">
              <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
                <thead>
                  <tr className="border-b border-border text-[13px] font-semibold text-muted-foreground">
                    <th className="px-3 py-2">유형</th>
                    <th className="px-3 py-2">제목</th>
                    <th className="px-3 py-2">진행날짜</th>
                    <th className="px-3 py-2">멘토</th>
                    <th className="px-3 py-2">후기</th>
                    <th className="px-3 py-2 text-right">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr
                      key={item.eventId}
                      className="border-b border-border/60 align-top transition-colors hover:bg-muted/40"
                    >
                      <td className="px-3 py-3">
                        <StatusBadge tone={item.type === "LECTURE" ? "blue" : "cyan"}>
                          {TYPE_LABEL[item.type]}
                        </StatusBadge>
                      </td>
                      <td className="px-3 py-3 font-bold text-foreground">
                        {item.title}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        <div>{formatDay(item.endAt)}</div>
                        <div className="text-[13px]">
                          {formatTime(item.startAt)} ~ {formatTime(item.endAt)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-foreground">
                        {item.mentorName ?? "멘토 미정"}
                      </td>
                      <td className="px-3 py-3 text-foreground">{item.reviewCount}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-white px-3 text-[13px] font-bold text-foreground hover:bg-muted"
                            href={routes.reviewsForEvent(item.eventId)}
                          >
                            <MessageSquareText
                              aria-hidden="true"
                              className="size-3.5"
                            />
                            후기 보기
                          </a>
                          <WriteReviewDialog
                            preselectedEventId={item.eventId}
                            triggerLabel="후기 작성"
                          />
                        </div>
                      </td>
                    </tr>
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
