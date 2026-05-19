export const reviewKeys = {
  all: ["reviews"] as const,
  list: (eventId: string, page: number) => ["reviews", "list", eventId, page] as const,
  writable: () => ["reviews", "writable"] as const,
  recentEvents: (limit: number) => ["reviews", "recent-events", limit] as const,
  summaries: (eventIds: string[]) =>
    ["reviews", "summaries", [...eventIds].sort().join(",")] as const,
};
