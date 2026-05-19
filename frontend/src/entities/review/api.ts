import type {
  RecentEndedEvent,
  Review,
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

export type CreateReviewInput = {
  authorName: string;
  content: string;
};

export async function createReview(eventId: string, input: CreateReviewInput) {
  return unwrapApiResponse(
    apiClient
      .post(`events/${encodeURIComponent(eventId)}/reviews`, { json: input })
      .json<ApiResponse<Review>>(),
  );
}
