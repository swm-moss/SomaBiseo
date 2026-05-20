import type {
  RecentEndedEvent,
  Review,
  ReviewFeedItem,
  ReviewFeedPage,
  ReviewPage,
  ReviewSummary,
  WritableEvent,
} from "@/entities/review/model";
import { apiClient, type ApiResponse, unwrapApiResponse } from "@/shared/api/client";

export async function getWritableEvents() {
  return unwrapApiResponse(
    apiClient.get("reviews/writable").json<ApiResponse<WritableEvent[]>>(),
  );
}

export async function getRecentEndedEvents(limit = 3) {
  return unwrapApiResponse(
    apiClient
      .get("reviews/recent-events", { searchParams: { limit } })
      .json<ApiResponse<RecentEndedEvent[]>>(),
  );
}

export async function getReviewSummaries(eventIds: string[]) {
  if (eventIds.length === 0) {
    return [] as ReviewSummary[];
  }

  return unwrapApiResponse(
    apiClient
      .get("reviews/summaries", { searchParams: { eventIds: eventIds.join(",") } })
      .json<ApiResponse<ReviewSummary[]>>(),
  );
}

export async function getReviewsPage(eventId: string, page = 1, size = 10) {
  return unwrapApiResponse(
    apiClient
      .get(`events/${encodeURIComponent(eventId)}/reviews`, {
        searchParams: { page, size },
      })
      .json<ApiResponse<ReviewPage>>(),
  );
}

export type GetReviewFeedParams = {
  q?: string;
  eventId?: string;
  page?: number;
  size?: number;
};

export async function getReviewFeed({
  q,
  eventId,
  page = 1,
  size = 10,
}: GetReviewFeedParams = {}) {
  const searchParams: Record<string, string | number> = { page, size };

  if (q && q.trim() !== "") {
    searchParams.q = q.trim();
  }

  if (eventId && eventId.trim() !== "") {
    searchParams.eventId = eventId.trim();
  }

  return unwrapApiResponse(
    apiClient.get("reviews", { searchParams }).json<ApiResponse<ReviewFeedPage>>(),
  );
}

export type CreateReviewInput = {
  authorName: string;
  content: string;
  attended?: boolean;
};

export async function createReview(eventId: string, input: CreateReviewInput) {
  return unwrapApiResponse(
    apiClient
      .post(`events/${encodeURIComponent(eventId)}/reviews`, { json: input })
      .json<ApiResponse<Review>>(),
  );
}
