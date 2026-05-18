"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type EventFavoriteState = {
  favoriteEventIds: string[];
  toggleFavorite: (eventId: string) => void;
};

export const useEventFavoriteStore = create<EventFavoriteState>()(
  persist(
    (set) => ({
      favoriteEventIds: ["event-1"],
      toggleFavorite: (eventId) =>
        set((state) => {
          const isFavorite = state.favoriteEventIds.includes(eventId);

          return {
            favoriteEventIds: isFavorite
              ? state.favoriteEventIds.filter((id) => id !== eventId)
              : [...state.favoriteEventIds, eventId],
          };
        }),
    }),
    {
      name: "somabiseo-event-favorites",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
