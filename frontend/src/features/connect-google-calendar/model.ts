"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getGoogleCalendarConnection } from "@/entities/calendar/api";
import type { CalendarConnection } from "@/entities/calendar/model";
import { useAuthStore } from "@/features/auth/model";

export const googleCalendarKeys = {
  all: ["google-calendar"] as const,
  connection: (sessionId: string | null) => [
    ...googleCalendarKeys.all,
    "connection",
    sessionId ?? "guest",
  ] as const,
};

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

export function useGoogleCalendarConnectionSync() {
  const sessionId = useAuthStore((state) => state.sessionId);
  const setConnection = useGoogleCalendarStore((state) => state.setConnection);
  const disconnect = useGoogleCalendarStore((state) => state.disconnect);
  const query = useQuery({
    queryKey: googleCalendarKeys.connection(sessionId),
    queryFn: getGoogleCalendarConnection,
    enabled: Boolean(sessionId),
    retry: 0,
  });

  useEffect(() => {
    if (!sessionId) {
      disconnect();
      return;
    }

    if (query.data) {
      setConnection(query.data);
    }

    if (query.isError) {
      disconnect();
    }
  }, [disconnect, query.data, query.isError, sessionId, setConnection]);

  return query;
}
