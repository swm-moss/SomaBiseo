import type { UserPreferences } from "@/entities/user-preference/model";
import { apiClient, type ApiResponse, unwrapApiResponse } from "@/shared/api/client";

export type UserPreferencesMigrationPayload = {
  noticeBookmarkIds: string[];
  eventFavoriteIds: string[];
  interestTopicIds: string[];
};

export async function getUserPreferences() {
  return unwrapApiResponse(
    apiClient.get("user/preferences").json<ApiResponse<UserPreferences>>(),
  );
}

export async function migrateUserPreferences(payload: UserPreferencesMigrationPayload) {
  return unwrapApiResponse(
    apiClient
      .post("user/preferences/migrate", {
        json: payload,
      })
      .json<ApiResponse<UserPreferences>>(),
  );
}

export async function replaceInterestTopics(topicIds: string[]) {
  return unwrapApiResponse(
    apiClient
      .put("user/preferences/interests", {
        json: { topicIds },
      })
      .json<ApiResponse<UserPreferences>>(),
  );
}

export async function bookmarkNotice(noticeId: string) {
  return unwrapApiResponse(
    apiClient
      .post(`user/preferences/notice-bookmarks/${encodeURIComponent(noticeId)}`)
      .json<ApiResponse<UserPreferences>>(),
  );
}

export async function unbookmarkNotice(noticeId: string) {
  return unwrapApiResponse(
    apiClient
      .delete(`user/preferences/notice-bookmarks/${encodeURIComponent(noticeId)}`)
      .json<ApiResponse<UserPreferences>>(),
  );
}

export async function favoriteEvent(eventId: string) {
  return unwrapApiResponse(
    apiClient
      .post(`user/preferences/event-favorites/${encodeURIComponent(eventId)}`)
      .json<ApiResponse<UserPreferences>>(),
  );
}

export async function unfavoriteEvent(eventId: string) {
  return unwrapApiResponse(
    apiClient
      .delete(`user/preferences/event-favorites/${encodeURIComponent(eventId)}`)
      .json<ApiResponse<UserPreferences>>(),
  );
}
