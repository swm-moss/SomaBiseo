"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type GoogleCalendarState = {
  connected: boolean;
  googleAccountEmail?: string;
  selectedCalendarId?: string;
  addedEventIds: string[];
  connect: () => void;
  setConnection: (connection: {
    connected: boolean;
    googleAccountEmail?: string;
    selectedCalendarId?: string;
  }) => void;
  disconnect: () => void;
  markEventAdded: (eventId: string) => void;
};

export const useGoogleCalendarStore = create<GoogleCalendarState>()(
  persist(
    (set) => ({
      connected: false,
      addedEventIds: [],
      connect: () =>
        set({
          connected: true,
          googleAccountEmail: "trainee@gmail.com",
          selectedCalendarId: "primary",
        }),
      setConnection: (connection) =>
        set({
          connected: connection.connected,
          googleAccountEmail: connection.googleAccountEmail,
          selectedCalendarId: connection.selectedCalendarId,
        }),
      disconnect: () =>
        set({
          connected: false,
          googleAccountEmail: undefined,
          selectedCalendarId: undefined,
          addedEventIds: [],
        }),
      markEventAdded: (eventId) =>
        set((state) => ({
          addedEventIds: state.addedEventIds.includes(eventId)
            ? state.addedEventIds
            : [...state.addedEventIds, eventId],
        })),
    }),
    {
      name: "somabiseo-google-calendar",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
