import type { Metadata } from "next";

import { ReviewDetailPage } from "@/views/review-detail/ui";

export const metadata: Metadata = {
  title: "강의 후기",
};

export default async function Page({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <ReviewDetailPage eventId={eventId} />;
}
