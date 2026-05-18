"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type NoticeReadState = {
  readNoticeIds: string[];
  markRead: (noticeId: string) => void;
};

export const useNoticeReadStore = create<NoticeReadState>()(
  persist(
    (set) => ({
      readNoticeIds: [],
      markRead: (noticeId) =>
        set((state) => ({
          readNoticeIds: state.readNoticeIds.includes(noticeId)
            ? state.readNoticeIds
            : [...state.readNoticeIds, noticeId],
        })),
    }),
    {
      name: "somabiseo-notice-reads",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
