"use client";

import { useEffect } from "react";

import { useNoticeReadStore } from "@/features/mark-notice-read/model";

export function MarkNoticeReadOnView({ noticeId }: { noticeId: string }) {
  const markRead = useNoticeReadStore((state) => state.markRead);

  useEffect(() => {
    markRead(noticeId);
  }, [markRead, noticeId]);

  return null;
}
