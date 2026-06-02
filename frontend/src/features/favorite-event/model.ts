"use client";

import { useToggleEventFavorite, useUserPreferences } from "@/features/user-preferences/model";

export function useEventFavorites() {
  const { preferences, isLoading, isFetching } = useUserPreferences();

  return {
    favoriteEventIds: preferences.eventFavoriteIds,
    isLoading,
    isFetching,
  };
}

export function useFavoriteEventMutation() {
  return useToggleEventFavorite();
}
