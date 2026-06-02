"use client";

import { useToggleNoticeBookmark, useUserPreferences } from "@/features/user-preferences/model";

export function useNoticeBookmarks() {
  const { preferences, isLoading, isFetching } = useUserPreferences();

  return {
    bookmarkedNoticeIds: preferences.noticeBookmarkIds,
    isLoading,
    isFetching,
  };
}

export function useBookmarkNoticeMutation() {
  return useToggleNoticeBookmark();
}
