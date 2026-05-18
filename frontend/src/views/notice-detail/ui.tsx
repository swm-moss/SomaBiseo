import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { getNoticeById } from "@/entities/notice/api";
import { BookmarkNoticeButton } from "@/features/bookmark-notice/ui";
import { MarkNoticeReadOnView } from "@/features/mark-notice-read/ui";
import { AppShell } from "@/widgets/app-shell/ui";
import { routes } from "@/shared/config/routes";
import { formatDateTime } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/status-badge";

export async function NoticeDetailPage({ noticeId }: { noticeId: string }) {
  const notice = await getNoticeById(noticeId);

  if (!notice) {
    notFound();
  }

  return (
    <AppShell>
      <MarkNoticeReadOnView noticeId={notice.id} />
      <main className="sb-page">
        <Button asChild className="mb-5" variant="ghost">
          <Link href={routes.notices}>
            <ArrowLeft aria-hidden="true" />
            공지 목록
          </Link>
        </Button>

        <article className="rounded-lg bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                {notice.isImportant ? <StatusBadge tone="red">중요</StatusBadge> : null}
                <StatusBadge>{notice.category}</StatusBadge>
              </div>
              <h1 className="mt-4 text-2xl font-black leading-9">{notice.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatDateTime(notice.publishedAt)}
              </p>
            </div>
            <BookmarkNoticeButton noticeId={notice.id} />
          </div>

          <div className="mt-8 whitespace-pre-line text-base leading-8">{notice.content}</div>

          <Button asChild className="mt-8 w-full" variant="outline">
            <a href={notice.sourceUrl} rel="noreferrer" target="_blank">
              원본 보기
              <ExternalLink aria-hidden="true" />
            </a>
          </Button>
        </article>
      </main>
    </AppShell>
  );
}
