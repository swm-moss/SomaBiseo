"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";

import { getReviewFeed } from "@/entities/review/api";
import { reviewKeys } from "@/entities/review/keys";
import { ManageReviewActions } from "@/features/manage-review/ui";
import { WriteReviewDialog } from "@/features/write-review/ui";
import { routes } from "@/shared/config/routes";
import { getRelativePublishedAt } from "@/shared/lib/date";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { PaginationControl } from "@/shared/ui/pagination-control";
import { StatusBadge } from "@/shared/ui/status-badge";

const TYPE_LABEL = {
  LECTURE: "멘토특강",
  MENTORING: "자유멘토링",
} as const;

const PAGE_SIZE = 10;

export function ReviewFeed() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQ = searchParams.get("q") ?? "";
  const eventId = searchParams.get("eventId");
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

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [debouncedSearch, urlQ, searchParams, router, pathname]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: reviewKeys.feed(debouncedSearch, eventId, page, PAGE_SIZE),
    queryFn: () => getReviewFeed({
      q: debouncedSearch,
      eventId: eventId ?? undefined,
      page,
      size: PAGE_SIZE,
    }),
    placeholderData: keepPreviousData,
  });

  const updateSearchParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());

    mutate(params);

    const queryString = params.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
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

  const hasFilter = debouncedSearch.length > 0 || Boolean(eventId);

  return (
    <section className="sb-section">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {eventId ? (
          <Link
            href={routes.reviews}
            className="inline-flex items-center gap-1 text-[13px] font-bold text-primary hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            전체 후기로 돌아가기
          </Link>
        ) : (
          <p className="text-[13px] font-semibold text-muted-foreground">
            {data ? `총 ${data.totalElements}개의 후기` : "후기를 불러오는 중"}
          </p>
        )}
        <WriteReviewDialog
          triggerLabel="후기 작성하기"
          triggerSize="default"
          triggerClassName="w-full sm:w-auto"
        />
      </div>

      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          aria-label="후기 검색"
          className="sb-field mt-0 h-11 w-full pl-10"
          placeholder="멘토명 · 강의명 · 내용으로 검색"
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
      </div>

      <div className="mt-4">
        {isLoading ? <LoadingState /> : null}
        {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
        {data && data.items.length === 0 ? (
          <EmptyState
            title={hasFilter ? "조건에 맞는 후기가 없어요" : "아직 등록된 후기가 없어요"}
            description={
              hasFilter
                ? "검색어를 바꾸거나 필터를 해제해 보세요."
                : "강의가 종료되면 연수생들이 후기를 남길 수 있어요."
            }
          />
        ) : null}
        {data && data.items.length > 0 ? (
          <ul className="space-y-3">
            {data.items.map((item) => (
              <li key={item.id} className="rounded-xl bg-white px-5 py-5">
                <div className="flex items-start gap-2">
                  <StatusBadge
                    className="mt-0.5 shrink-0"
                    tone={item.eventType === "LECTURE" ? "blue" : "cyan"}
                  >
                    {TYPE_LABEL[item.eventType]}
                  </StatusBadge>
                  <Link
                    href={routes.eventDetail(item.eventId)}
                    className="min-w-0 text-[17px] font-extrabold leading-[26px] text-foreground hover:underline"
                  >
                    {item.eventTitle}
                  </Link>
                </div>
                <p className="mt-1.5 text-[13px] font-medium text-muted-foreground">
                  {item.mentorName ?? "멘토 미정"}
                </p>
                <p className="mt-4 whitespace-pre-wrap text-[15px] leading-[24px] text-foreground">
                  {item.content}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/40 pt-3">
                  <p className="text-[13px] font-medium text-muted-foreground">
                    {item.authorName}
                    <span aria-hidden="true" className="mx-1.5">
                      ·
                    </span>
                    {getRelativePublishedAt(item.createdAt)}
                  </p>
                  {item.isAuthor ? (
                    <ManageReviewActions
                      reviewId={item.id}
                      initialContent={item.content}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
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
