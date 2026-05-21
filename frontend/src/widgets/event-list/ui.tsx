"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronDown, Search, X } from "lucide-react";

import {
  DEFAULT_SOMA_EVENT_SORT,
  getSomaEventsPage,
  type SomaEventMode,
  type SomaEventSort,
} from "@/entities/soma-event/api";
import type { SomaEventType } from "@/entities/soma-event/model";
import {
  getEventRecommendation,
  useInterestPreferenceStore,
} from "@/features/user-interests/model";
import {
  useGoogleCalendarConflictStatuses,
  useGoogleCalendarConnectionSync,
  useGoogleCalendarStore,
} from "@/features/connect-google-calendar/model";
import { UpcomingEventCard } from "@/widgets/upcoming-event-card/ui";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { FilterChips } from "@/shared/ui/filter-chips";
import { LoadingState } from "@/shared/ui/loading-state";
import { PaginationControl } from "@/shared/ui/pagination-control";

type EventTab = "ALL" | SomaEventType;
type ModeFilter = "ALL" | SomaEventMode;

const options = [
  { label: "전체", value: "ALL" },
  { label: "멘토특강", value: "LECTURE" },
  { label: "자유멘토링", value: "MENTORING" },
] satisfies { label: string; value: EventTab }[];

const modeOptions = [
  { label: "전체", value: "ALL" },
  { label: "온라인", value: "ONLINE" },
  { label: "오프라인", value: "OFFLINE" },
] satisfies { label: string; value: ModeFilter }[];

const sortOptions = [
  { label: "최신 강의순", value: "LECTURE_DATE_DESC" },
  { label: "빠른 강의순", value: "LECTURE_DATE_ASC" },
  { label: "최근 등록순", value: "REGISTERED_AT_DESC" },
  { label: "마감 임박순", value: "APPLICATION_DEADLINE_ASC" },
] satisfies { label: string; value: SomaEventSort }[];

const EVENT_TABS = new Set<EventTab>(["ALL", "LECTURE", "MENTORING"]);
const EVENT_MODES = new Set<ModeFilter>(["ALL", "ONLINE", "OFFLINE"]);
const EVENT_SORTS = new Set<SomaEventSort>([
  "LECTURE_DATE_DESC",
  "LECTURE_DATE_ASC",
  "REGISTERED_AT_DESC",
  "APPLICATION_DEADLINE_ASC",
]);

function parseTab(value: string | null): EventTab {
  return value && EVENT_TABS.has(value as EventTab)
    ? (value as EventTab)
    : "ALL";
}

function parseMode(value: string | null): ModeFilter {
  return value && EVENT_MODES.has(value as ModeFilter)
    ? (value as ModeFilter)
    : "ALL";
}

function parseSort(value: string | null): SomaEventSort {
  return value && EVENT_SORTS.has(value as SomaEventSort)
    ? (value as SomaEventSort)
    : DEFAULT_SOMA_EVENT_SORT;
}

function parsePage(value: string | null): number {
  const parsed = Number(value ?? "1");

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(value: string | null): string {
  if (!value) {
    return "";
  }

  return ISO_DATE_PATTERN.test(value) ? value : "";
}

export function EventList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = parseTab(searchParams.get("tab"));
  const mode = parseMode(searchParams.get("mode"));
  const sort = parseSort(searchParams.get("sort"));
  const page = parsePage(searchParams.get("page"));
  const date = parseDate(searchParams.get("date"));
  const urlQ = searchParams.get("q") ?? "";

  const [searchInput, setSearchInput] = useState(urlQ);
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);

  const selectedTopicIds = useInterestPreferenceStore(
    (state) => state.selectedTopicIds,
  );
  useGoogleCalendarConnectionSync();
  const calendarConnected = useGoogleCalendarStore((state) => state.connected);
  const type = tab === "ALL" ? undefined : tab;
  const modeFilter = mode === "ALL" ? undefined : mode;
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["events", tab, mode, sort, debouncedSearch, date, page],
    queryFn: () =>
      getSomaEventsPage({
        page,
        sort,
        type,
        mode: modeFilter,
        q: debouncedSearch,
        date: date || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const events = data?.items ?? [];
  const totalPages = data?.totalPages ?? page;
  const eventIds = events.map((event) => event.id);
  const conflictStatusesQuery = useGoogleCalendarConflictStatuses(eventIds);
  const conflictStatusByEventId = new Map(
    (conflictStatusesQuery.data ?? []).map((status) => [
      status.eventId,
      status,
    ]),
  );

  const updateSearchParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());

    mutate(params);

    const queryString = params.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

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

  const handleTabChange = (nextTab: EventTab) => {
    updateSearchParams((params) => {
      if (nextTab === "ALL") {
        params.delete("tab");
      } else {
        params.set("tab", nextTab);
      }

      params.delete("page");
    });
  };

  const handleModeChange = (nextMode: ModeFilter) => {
    updateSearchParams((params) => {
      if (nextMode === "ALL") {
        params.delete("mode");
      } else {
        params.set("mode", nextMode);
      }

      params.delete("page");
    });
  };

  const handleSortChange = (nextSort: SomaEventSort) => {
    updateSearchParams((params) => {
      if (nextSort === DEFAULT_SOMA_EVENT_SORT) {
        params.delete("sort");
      } else {
        params.set("sort", nextSort);
      }

      params.delete("page");
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateSearchParams((params) => {
      if (nextPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(nextPage));
      }
    });
  };

  const handleDateChange = (nextDate: string) => {
    updateSearchParams((params) => {
      if (!nextDate) {
        params.delete("date");
      } else {
        params.set("date", nextDate);
      }

      params.delete("page");
    });
  };

  return (
    <section className="sb-section">
      <div className="mb-4 space-y-2">
        <FilterChips
          ariaLabel="특강 유형"
          label="유형"
          options={options}
          value={tab}
          onValueChange={handleTabChange}
        />
        <FilterChips
          ariaLabel="진행 장소"
          label="장소"
          options={modeOptions}
          value={mode}
          onValueChange={handleModeChange}
        />
      </div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            aria-label="특강 검색"
            className="h-12 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-[15px] font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder="제목 · 멘토 · 주제로 검색"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
        <div className="relative shrink-0">
          <CalendarDays
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            aria-label="강의 날짜"
            className="h-12 w-40 rounded-lg border border-border bg-white pl-9 pr-9 text-[14px] font-semibold text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            type="date"
            value={date}
            onChange={(event) => handleDateChange(event.target.value)}
          />
          {date ? (
            <button
              aria-label="날짜 필터 해제"
              className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              type="button"
              onClick={() => handleDateChange("")}
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          ) : null}
        </div>
        <div className="relative shrink-0">
          <select
            aria-label="정렬"
            className="h-12 w-32 appearance-none rounded-lg border border-border bg-white pl-3 pr-9 text-[14px] font-semibold text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 sm:w-40"
            value={sort}
            onChange={(event) =>
              handleSortChange(event.target.value as SomaEventSort)
            }
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </div>
        </div>
      </div>
      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
      {data && events.length === 0 ? (
        <EmptyState
          title="일정이 없어요"
          description="이 페이지에는 조건에 맞는 일정이 없습니다."
        />
      ) : null}
      {events.length > 0 ? (
        <div className="sb-list-surface">
          {events.map((event) => (
            <UpcomingEventCard
              key={event.id}
              event={event}
              calendarCheckState={
                calendarConnected
                  ? conflictStatusesQuery.isError
                    ? "error"
                    : conflictStatusesQuery.isLoading ||
                        conflictStatusesQuery.isFetching
                      ? "loading"
                      : "ready"
                  : "idle"
              }
              calendarStatus={conflictStatusByEventId.get(event.id)}
              recommendation={getEventRecommendation(event, selectedTopicIds)}
            />
          ))}
        </div>
      ) : null}
      <PaginationControl
        isDisabled={isFetching}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </section>
  );
}
