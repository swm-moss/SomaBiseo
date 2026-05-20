"use client";

import { useSearchParams } from "next/navigation";

import { EndedEventsTable } from "@/widgets/ended-events-table/ui";
import { ReviewFeed } from "@/widgets/review-feed/ui";

export function ReviewsContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  if (eventId) {
    return <ReviewFeed />;
  }

  return <EndedEventsTable />;
}
