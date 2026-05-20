import type {
  RecentEndedEvent,
  Review,
  ReviewFeedPage,
} from "@/entities/review/model";
import { apiClient, type ApiResponse, unwrapApiResponse } from "@/shared/api/client";

export async function getRecentEndedEvents(limit = 3) {
  return unwrapApiResponse(
    apiClient
      .get("reviews/recent-events", { searchParams: { limit } })
      .json<ApiResponse<RecentEndedEvent[]>>(),
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
  attended: boolean;
};

export async function createReview(eventId: string, input: CreateReviewInput) {
  return unwrapApiResponse(
    apiClient
      .post(`events/${encodeURIComponent(eventId)}/reviews`, { json: input })
      .json<ApiResponse<Review>>(),
  );
}
