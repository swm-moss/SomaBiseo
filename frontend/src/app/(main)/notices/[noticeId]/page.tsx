import type { Metadata } from "next";

import { NoticeDetailPage } from "@/views/notice-detail/ui";

export const metadata: Metadata = {
  title: "공지 상세",
};

export default async function Page({
  params,
}: {
  params: Promise<{ noticeId: string }>;
}) {
  const { noticeId } = await params;

  return <NoticeDetailPage noticeId={noticeId} />;
}
