"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";

import {
  DEFAULT_SOMA_EVENT_SORT,
  getSomaEventsPage,
  type SomaEventSort,
} from "@/entities/soma-event/api";
import type { SomaEventType } from "@/entities/soma-event/model";
import {
  getEventRecommendation,
  useInterestPreferenceStore,
} from "@/features/user-interests/model";
import { UpcomingEventCard } from "@/widgets/upcoming-event-card/ui";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { PaginationControl } from "@/shared/ui/pagination-control";
import { SegmentControl } from "@/shared/ui/segment-control";

type EventTab = "ALL" | SomaEventType;

const options = [
  { label: "전체", value: "ALL" },
  { label: "멘토특강", value: "LECTURE" },
  { label: "자유멘토링", value: "MENTORING" },
] satisfies { label: string; value: EventTab }[];

const sortOptions = [
  { label: "최신 강의순", value: "LECTURE_DATE_DESC" },
  { label: "빠른 강의순", value: "LECTURE_DATE_ASC" },
  { label: "최근 등록순", value: "REGISTERED_AT_DESC" },
  { label: "마감 임박순", value: "APPLICATION_DEADLINE_ASC" },
] satisfies { label: string; value: SomaEventSort }[];

export function EventList() {
  const [tab, setTab] = useState<EventTab>("ALL");
  const [sort, setSort] = useState<SomaEventSort>(DEFAULT_SOMA_EVENT_SORT);
  const [page, setPage] = useState(1);
  const selectedTopicIds = useInterestPreferenceStore((state) => state.selectedTopicIds);
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["events", page, sort],
    queryFn: () => getSomaEventsPage(page, sort),
    placeholderData: keepPreviousData,
  });

  const events = (data?.items ?? []).filter((event) => {
    if (tab === "ALL") {
      return true;
    }

    return event.type === tab;
  });
  const totalPages = data?.totalPages ?? page;

  const handleTabChange = (nextTab: EventTab) => {
    setTab(nextTab);
    setPage(1);
  };

  const handleSortChange = (nextSort: SomaEventSort) => {
    setSort(nextSort);
    setPage(1);
  };

  return (
    <section className="sb-section">
      <div className="mb-6 flex items-center gap-3">
        <SegmentControl
          className="mx-0 min-w-0 flex-1 px-0"
          options={options}
          value={tab}
          onValueChange={handleTabChange}
        />
        <div className="relative shrink-0">
          <select
            aria-label="정렬"
            className="h-12 w-32 appearance-none rounded-lg border border-border bg-white pl-3 pr-9 text-[14px] font-semibold text-foreground outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/15 sm:w-40"
            value={sort}
            onChange={(event) => handleSortChange(event.target.value as SomaEventSort)}
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
      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
      {data && events.length === 0 ? (
        <EmptyState title="일정이 없어요" description="이 페이지에는 조건에 맞는 일정이 없습니다." />
      ) : null}
      {events.length > 0 ? (
        <div className="sb-list-surface">
          {events.map((event) => (
            <UpcomingEventCard
              key={event.id}
              event={event}
              recommendation={getEventRecommendation(event, selectedTopicIds)}
            />
          ))}
        </div>
      ) : null}
      <PaginationControl
        isDisabled={isFetching}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </section>
  );
}
