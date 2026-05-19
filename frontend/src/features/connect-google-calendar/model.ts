"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CalendarConnection } from "@/entities/calendar/model";

type GoogleCalendarState = {
  connected: boolean;
  googleAccountEmail?: string;
  selectedCalendarId?: string;
  addedEventIds: string[];
  connect: () => void;
  disconnect: () => void;
  setConnection: (connection: CalendarConnection) => void;
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
      disconnect: () =>
        set({
          connected: false,
          googleAccountEmail: undefined,
          selectedCalendarId: undefined,
          addedEventIds: [],
        }),
      setConnection: (connection) =>
        set((state) => ({
          connected: connection.connected,
          googleAccountEmail: connection.googleAccountEmail ?? undefined,
          selectedCalendarId: connection.calendarId ?? undefined,
          addedEventIds: connection.connected ? state.addedEventIds : [],
        })),
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
