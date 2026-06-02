"use client";

import { Bookmark } from "lucide-react";
import { toast } from "sonner";

import { useBookmarkNoticeMutation, useNoticeBookmarks } from "@/features/bookmark-notice/model";
import { cn } from "@/shared/lib/utils";

export function BookmarkNoticeButton({ noticeId }: { noticeId: string }) {
  const { bookmarkedNoticeIds, isLoading } = useNoticeBookmarks();
  const bookmarkMutation = useBookmarkNoticeMutation();
  const isBookmarked = bookmarkedNoticeIds.includes(noticeId);

  return (
    <button
      aria-label={isBookmarked ? "공지 북마크 해제" : "공지 북마크"}
      className={cn(
        "sb-tap inline-flex size-11 items-center justify-center rounded-lg bg-white text-muted-foreground transition-colors hover:bg-slate-100",
        isBookmarked && "bg-blue-50 text-primary",
      )}
      disabled={isLoading || bookmarkMutation.isPending}
      type="button"
      onClick={() =>
        bookmarkMutation.mutate(
          { noticeId, bookmarked: isBookmarked },
          {
            onError: () => toast.error("북마크를 저장하지 못했어요."),
          },
        )
      }
    >
      <Bookmark aria-hidden="true" className={cn("size-5", isBookmarked && "fill-current")} />
    </button>
  );
}
