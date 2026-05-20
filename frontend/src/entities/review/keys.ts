import type { SomaEventType } from "@/entities/soma-event/model";

export const reviewKeys = {
  all: ["reviews"] as const,
  feed: (q: string, eventId: string | null, page: number) =>
    ["reviews", "feed", q, eventId ?? "", page] as const,
  recentEvents: (limit: number) => ["reviews", "recent-events", limit] as const,
  endedEvents: (
    type: SomaEventType | null,
    q: string,
    page: number,
  ) => ["reviews", "ended-events", type ?? "", q, page] as const,
};
