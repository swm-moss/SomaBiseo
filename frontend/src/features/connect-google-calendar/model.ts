"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CalendarConnection } from "@/entities/calendar/model";

type GoogleCalendarState = {
  connected: boolean;
  googleAccountEmail?: string;
  selectedCalendarId?: string;
  connect: () => void;
  disconnect: () => void;
  setConnection: (connection: CalendarConnection) => void;
};

export const useGoogleCalendarStore = create<GoogleCalendarState>()(
  persist(
    (set) => ({
      connected: false,
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
        }),
      setConnection: (connection) =>
        set({
          connected: connection.connected,
          googleAccountEmail: connection.googleAccountEmail ?? undefined,
          selectedCalendarId: connection.calendarId ?? undefined,
        }),
    }),
    {
      name: "somabiseo-google-calendar",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
