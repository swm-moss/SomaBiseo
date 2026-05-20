import type { SomaEventType } from "@/entities/soma-event/model";

export const reviewKeys = {
  all: ["reviews"] as const,
  feed: (q: string, eventId: string | null, page: number) =>
    ["reviews", "feed", q, eventId ?? "", page] as const,
  endedEvents: (
    type: SomaEventType | null,
    q: string,
    date: string | null,
    page: number,
  ) => ["reviews", "ended-events", type ?? "", q, date ?? "", page] as const,
};
