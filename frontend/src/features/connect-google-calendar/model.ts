"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  getConflictStatusesForEvents,
  getGoogleCalendarConnection,
  getGoogleCalendarEvents,
} from "@/entities/calendar/api";
import type { CalendarConnection } from "@/entities/calendar/model";
import { useAuthStore } from "@/features/auth/model";

export const googleCalendarKeys = {
  all: ["google-calendar"] as const,
  connection: (sessionId: string | null) => [
    ...googleCalendarKeys.all,
    "connection",
    sessionId ?? "guest",
  ] as const,
  upcomingEvents: (sessionId: string | null) => [
    ...googleCalendarKeys.all,
    "events",
    "upcoming",
    sessionId ?? "guest",
  ] as const,
  eventsByRange: (sessionId: string | null, from: string, to: string) => [
    ...googleCalendarKeys.all,
    "events",
    "range",
    sessionId ?? "guest",
    from,
    to,
  ] as const,
  conflictStatuses: (sessionId: string | null, eventIds: string[]) => [
    ...googleCalendarKeys.all,
    "conflicts",
    sessionId ?? "guest",
    eventIds.join(","),
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

export function useUpcomingGoogleCalendarEvents() {
  const sessionId = useAuthStore((state) => state.sessionId);
  const connected = useGoogleCalendarStore((state) => state.connected);

  return useQuery({
    queryKey: googleCalendarKeys.upcomingEvents(sessionId),
    queryFn: () => {
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      return getGoogleCalendarEvents(now.toISOString(), sevenDaysLater.toISOString());
    },
    enabled: connected && Boolean(sessionId),
    retry: 0,
  });
}

export function useGoogleCalendarEventsInRange(from: Date, to: Date) {
  const sessionId = useAuthStore((state) => state.sessionId);
  const connected = useGoogleCalendarStore((state) => state.connected);
  const fromIso = from.toISOString();
  const toIso = to.toISOString();

  return useQuery({
    queryKey: googleCalendarKeys.eventsByRange(sessionId, fromIso, toIso),
    queryFn: () => getGoogleCalendarEvents(fromIso, toIso),
    enabled: connected && Boolean(sessionId),
    retry: 0,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useGoogleCalendarConflictStatuses(eventIds: string[]) {
  const sessionId = useAuthStore((state) => state.sessionId);
  const connected = useGoogleCalendarStore((state) => state.connected);
  const uniqueEventIds = [...new Set(eventIds)].filter(Boolean);

  return useQuery({
    queryKey: googleCalendarKeys.conflictStatuses(sessionId, uniqueEventIds),
    queryFn: () => getConflictStatusesForEvents(uniqueEventIds),
    enabled: connected && Boolean(sessionId) && uniqueEventIds.length > 0,
    retry: 0,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
