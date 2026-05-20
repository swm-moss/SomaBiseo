import type {
  EndedEventPage,
  Review,
  ReviewFeedPage,
} from "@/entities/review/model";
import type { SomaEventType } from "@/entities/soma-event/model";
import { apiClient, type ApiResponse, unwrapApiResponse } from "@/shared/api/client";

export type GetEndedEventsParams = {
  type?: SomaEventType;
  q?: string;
  page?: number;
  size?: number;
};

export async function getEndedEvents({
  type,
  q,
  page = 1,
  size = 10,
}: GetEndedEventsParams = {}) {
  const searchParams: Record<string, string | number> = { page, size };

  if (type) {
    searchParams.type = type;
  }

  if (q && q.trim() !== "") {
    searchParams.q = q.trim();
  }

  return unwrapApiResponse(
    apiClient
      .get("reviews/ended-events", { searchParams })
      .json<ApiResponse<EndedEventPage>>(),
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
