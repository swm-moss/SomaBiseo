"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getNoticesPage } from "@/entities/notice/api";
import type { NoticeFilter } from "@/entities/notice/model";
import { BookmarkNoticeButton } from "@/features/bookmark-notice/ui";
import { useNoticeBookmarks } from "@/features/bookmark-notice/model";
import { useNoticeReadStore } from "@/features/mark-notice-read/model";
import { routes } from "@/shared/config/routes";
import { getRelativePublishedAt } from "@/shared/lib/date";
import { cn } from "@/shared/lib/utils";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { PaginationControl } from "@/shared/ui/pagination-control";
import { SegmentControl } from "@/shared/ui/segment-control";
import { StatusBadge } from "@/shared/ui/status-badge";

const options = [
  { label: "전체", value: "ALL" },
  { label: "중요", value: "IMPORTANT" },
  { label: "읽지 않음", value: "UNREAD" },
  { label: "북마크", value: "BOOKMARKED" },
] satisfies { label: string; value: NoticeFilter }[];

export function NoticeList() {
  const [filter, setFilter] = useState<NoticeFilter>("ALL");
  const [page, setPage] = useState(1);
  const { bookmarkedNoticeIds } = useNoticeBookmarks();
  const readNoticeIds = useNoticeReadStore((state) => state.readNoticeIds);
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["notices", page],
    queryFn: () => getNoticesPage(page),
    placeholderData: keepPreviousData,
  });
  const pageNotices = useMemo(() => data?.items ?? [], [data]);

  const notices = useMemo(() => {
    if (pageNotices.length === 0) {
      return [];
    }

    return pageNotices.filter((notice) => {
      if (filter === "IMPORTANT") {
        return notice.isImportant;
      }

      if (filter === "UNREAD") {
        return !readNoticeIds.includes(notice.id);
      }

      if (filter === "BOOKMARKED") {
        return bookmarkedNoticeIds.includes(notice.id);
      }

      return true;
    });
  }, [bookmarkedNoticeIds, filter, pageNotices, readNoticeIds]);
  const totalPages = data?.totalPages ?? page;

  const handleFilterChange = (nextFilter: NoticeFilter) => {
    setFilter(nextFilter);
    setPage(1);
  };

  return (
    <section className="sb-section">
      <SegmentControl options={options} value={filter} onValueChange={handleFilterChange} />
      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
      {data && notices.length === 0 ? (
        <EmptyState title="공지 없음" description="이 페이지에는 조건에 맞는 공지가 없습니다." />
      ) : null}
      {notices.length > 0 ? (
        <div className="sb-list-surface">
          {notices.map((notice) => {
            const isRead = readNoticeIds.includes(notice.id);

            return (
              <article key={notice.id} className="sb-list-row">
                <Link className="min-w-0 flex-1" href={routes.noticeDetail(notice.id)}>
                  <div className="flex flex-wrap items-center gap-2">
                    {notice.isImportant ? <StatusBadge tone="red">중요</StatusBadge> : null}
                    {!isRead ? <StatusBadge tone="blue">새 글</StatusBadge> : null}
                  </div>
                  <h3
                    className={cn(
                      "mt-2 line-clamp-2 text-[17px] font-extrabold leading-[25.5px]",
                      isRead && "text-muted-foreground",
                    )}
                  >
                    {notice.title}
                  </h3>
                  <p className="mt-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
                    {getRelativePublishedAt(notice.publishedAt)}
                  </p>
                </Link>
                <BookmarkNoticeButton noticeId={notice.id} />
              </article>
            );
          })}
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
