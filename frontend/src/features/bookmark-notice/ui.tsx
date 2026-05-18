"use client";

import { Bookmark } from "lucide-react";

import { useNoticeBookmarkStore } from "@/features/bookmark-notice/model";
import { cn } from "@/shared/lib/utils";

export function BookmarkNoticeButton({ noticeId }: { noticeId: string }) {
  const bookmarkedNoticeIds = useNoticeBookmarkStore((state) => state.bookmarkedNoticeIds);
  const toggleBookmark = useNoticeBookmarkStore((state) => state.toggleBookmark);
  const isBookmarked = bookmarkedNoticeIds.includes(noticeId);

  return (
    <button
      aria-label={isBookmarked ? "공지 북마크 해제" : "공지 북마크"}
      className={cn(
        "sb-tap inline-flex size-11 items-center justify-center rounded-lg bg-white text-muted-foreground transition-colors hover:bg-slate-100",
        isBookmarked && "bg-blue-50 text-primary",
      )}
      type="button"
      onClick={() => toggleBookmark(noticeId)}
    >
      <Bookmark aria-hidden="true" className={cn("size-5", isBookmarked && "fill-current")} />
    </button>
  );
}
