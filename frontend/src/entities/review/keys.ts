import type { SomaEventType } from "@/entities/soma-event/model";

export const reviewKeys = {
  all: ["reviews"] as const,
  feed: (
    q: string,
    eventId: string | null,
    mentorName: string | null,
    page: number,
    size: number,
  ) =>
    [
      "reviews",
      "feed",
      q,
      eventId ?? "",
      mentorName ?? "",
      page,
      size,
    ] as const,
  endedEvents: (
    type: SomaEventType | null,
    q: string,
    date: string | null,
    page: number,
  ) => ["reviews", "ended-events", type ?? "", q, date ?? "", page] as const,
};
