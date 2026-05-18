import type { Metadata } from "next";

import { EventDetailPage } from "@/views/event-detail/ui";

export const metadata: Metadata = {
  title: "일정 상세",
};

export default async function Page({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <EventDetailPage eventId={eventId} />;
}
