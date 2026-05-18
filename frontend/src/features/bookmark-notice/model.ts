"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type NoticeBookmarkState = {
  bookmarkedNoticeIds: string[];
  toggleBookmark: (noticeId: string) => void;
};

export const useNoticeBookmarkStore = create<NoticeBookmarkState>()(
  persist(
    (set) => ({
      bookmarkedNoticeIds: [],
      toggleBookmark: (noticeId) =>
        set((state) => {
          const isBookmarked = state.bookmarkedNoticeIds.includes(noticeId);

          return {
            bookmarkedNoticeIds: isBookmarked
              ? state.bookmarkedNoticeIds.filter((id) => id !== noticeId)
              : [...state.bookmarkedNoticeIds, noticeId],
          };
        }),
    }),
    {
      name: "somabiseo-notice-bookmarks",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
