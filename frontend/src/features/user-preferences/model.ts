"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import {
  bookmarkNotice,
  favoriteEvent,
  getUserPreferences,
  migrateUserPreferences,
  replaceInterestTopics,
  unbookmarkNotice,
  unfavoriteEvent,
} from "@/entities/user-preference/api";
import { emptyUserPreferences, type UserPreferences } from "@/entities/user-preference/model";
import { userPreferenceKeys } from "@/entities/user-preference/keys";
import { useAuthStore } from "@/features/auth/model";

const LEGACY_NOTICE_BOOKMARKS_KEY = "somabiseo-notice-bookmarks";
const LEGACY_EVENT_FAVORITES_KEY = "somabiseo-event-favorites";
const LEGACY_INTERESTS_KEY = "somabiseo-interest-preferences";
const LEGACY_MIGRATION_KEY_PREFIX = "somabiseo-preferences-migrated";
const LEGACY_MOCK_NOTICE_IDS = new Set(["notice-1", "notice-2"]);
const LEGACY_MOCK_EVENT_IDS = new Set(["event-1", "event-2"]);
const migratingSessionIds = new Set<string>();

export function useUserPreferencesQuery() {
  const sessionId = useAuthStore((state) => state.sessionId);

  return useQuery({
    queryKey: userPreferenceKeys.me(sessionId),
    queryFn: getUserPreferences,
    enabled: Boolean(sessionId),
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useUserPreferences() {
  const query = useUserPreferencesQuery();
  const sessionId = useAuthStore((state) => state.sessionId);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId || !query.isSuccess || typeof window === "undefined") {
      return;
    }

    const migrationKey = `${LEGACY_MIGRATION_KEY_PREFIX}:${sessionId}`;

    if (migratingSessionIds.has(sessionId) || window.localStorage.getItem(migrationKey)) {
      return;
    }

    const legacyPreferences = readLegacyPreferences();
    const hasLegacyPreferences =
      legacyPreferences.noticeBookmarkIds.length > 0 ||
      legacyPreferences.eventFavoriteIds.length > 0 ||
      legacyPreferences.interestTopicIds.length > 0;

    if (!hasLegacyPreferences) {
      window.localStorage.setItem(migrationKey, "true");
      return;
    }

    migratingSessionIds.add(sessionId);

    void migrateUserPreferences(legacyPreferences)
      .then((preferences) => {
        setPreferences(queryClient, sessionId, preferences);
        window.localStorage.setItem(migrationKey, "true");
      })
      .catch(() => {
        migratingSessionIds.delete(sessionId);
      });
  }, [query.isSuccess, queryClient, sessionId]);

  return {
    ...query,
    preferences: query.data ?? emptyUserPreferences,
  };
}

export function useReplaceInterestTopics() {
  const sessionId = useAuthStore((state) => state.sessionId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replaceInterestTopics,
    onSuccess: (preferences) => {
      setPreferences(queryClient, sessionId, preferences);
    },
  });
}

export function useToggleNoticeBookmark() {
  const sessionId = useAuthStore((state) => state.sessionId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noticeId, bookmarked }: { noticeId: string; bookmarked: boolean }) =>
      bookmarked ? unbookmarkNotice(noticeId) : bookmarkNotice(noticeId),
    onSuccess: (preferences) => {
      setPreferences(queryClient, sessionId, preferences);
    },
  });
}

export function useToggleEventFavorite() {
  const sessionId = useAuthStore((state) => state.sessionId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, favorite }: { eventId: string; favorite: boolean }) =>
      favorite ? unfavoriteEvent(eventId) : favoriteEvent(eventId),
    onSuccess: (preferences) => {
      setPreferences(queryClient, sessionId, preferences);
    },
  });
}

function setPreferences(
  queryClient: QueryClient,
  sessionId: string | null,
  preferences: UserPreferences,
) {
  queryClient.setQueryData(userPreferenceKeys.me(sessionId), preferences);
}

function readLegacyPreferences() {
  return {
    noticeBookmarkIds: readLegacyPersistedArray(
      LEGACY_NOTICE_BOOKMARKS_KEY,
      "bookmarkedNoticeIds",
    ).filter((noticeId) => !LEGACY_MOCK_NOTICE_IDS.has(noticeId)),
    eventFavoriteIds: readLegacyPersistedArray(
      LEGACY_EVENT_FAVORITES_KEY,
      "favoriteEventIds",
    ).filter((eventId) => !LEGACY_MOCK_EVENT_IDS.has(eventId)),
    interestTopicIds: readLegacyPersistedArray(LEGACY_INTERESTS_KEY, "selectedTopicIds"),
  };
}

function readLegacyPersistedArray(storageKey: string, fieldName: string) {
  try {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
    const value = parsed.state?.[fieldName];

    if (!Array.isArray(value)) {
      return [];
    }

    return Array.from(
      new Set(
        value
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
      ),
    );
  } catch {
    return [];
  }
}
