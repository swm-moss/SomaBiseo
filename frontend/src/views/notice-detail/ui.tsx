"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { getNoticeById } from "@/entities/notice/api";
import { BookmarkNoticeButton } from "@/features/bookmark-notice/ui";
import { MarkNoticeReadOnView } from "@/features/mark-notice-read/ui";
import { AppShell } from "@/widgets/app-shell/ui";
import { routes } from "@/shared/config/routes";
import { formatDateTime } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { StatusBadge } from "@/shared/ui/status-badge";

export function NoticeDetailPage({ noticeId }: { noticeId: string }) {
  const { data: notice, isLoading, isError, refetch } = useQuery({
    queryKey: ["notice", noticeId],
    queryFn: () => getNoticeById(noticeId),
  });

  return (
    <AppShell>
      {notice ? <MarkNoticeReadOnView noticeId={notice.id} /> : null}
      <main className="sb-page">
        <Button asChild className="mb-5" variant="ghost">
          <Link href={routes.notices}>
            <ArrowLeft aria-hidden="true" />
            공지 목록
          </Link>
        </Button>

        {isLoading ? <LoadingState /> : null}
        {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
        {!isLoading && !isError && !notice ? (
          <EmptyState title="공지 없음" description="목록에서 다시 선택해 주세요." />
        ) : null}

        {notice ? (
          <article className="rounded-lg bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  {notice.isImportant ? <StatusBadge tone="red">중요</StatusBadge> : null}
                  <StatusBadge>{notice.category}</StatusBadge>
                </div>
                <h1 className="mt-4 text-[24px] font-black leading-[33px]">{notice.title}</h1>
                <p className="mt-2 text-[14px] font-medium leading-[21px] text-muted-foreground">
                  {formatDateTime(notice.publishedAt)}
                </p>
              </div>
              <BookmarkNoticeButton noticeId={notice.id} />
            </div>

            <div className="mt-8 whitespace-pre-line text-[17px] leading-[27px]">
              {notice.content}
            </div>

            <Button asChild className="mt-8 w-full" variant="outline">
              <a href={notice.sourceUrl} rel="noreferrer" target="_blank">
                원본 보기
                <ExternalLink aria-hidden="true" />
              </a>
            </Button>
          </article>
        ) : null}
      </main>
    </AppShell>
  );
}
