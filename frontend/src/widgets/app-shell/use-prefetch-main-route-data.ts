"use client";

import { useQueryClient } from "@tanstack/react-query";

import {
  DEFAULT_SOMA_EVENT_SORT,
  getDashboardEvents,
  getSomaEventsPage,
} from "@/entities/soma-event/api";
import { getNotices } from "@/entities/notice/api";
import { useAuthStore } from "@/features/auth/model";
import { routes } from "@/shared/config/routes";

const eventListQueryKey = [
  "events",
  "ALL",
  "ALL",
  DEFAULT_SOMA_EVENT_SORT,
  "",
  "",
  1,
] as const;

export function usePrefetchMainRouteData() {
  const queryClient = useQueryClient();
  const sessionId = useAuthStore((state) => state.sessionId);

  return (href: string) => {
    if (!sessionId) {
      return;
    }

    if (href === routes.dashboard) {
      void queryClient.prefetchQuery({
        queryKey: ["dashboard-events", sessionId],
        queryFn: () => getDashboardEvents(),
      });
      void queryClient.prefetchQuery({
        queryKey: ["dashboard-notices", sessionId],
        queryFn: () => getNotices(),
      });
      return;
    }

    if (href === routes.events) {
      void queryClient.prefetchQuery({
        queryKey: eventListQueryKey,
        queryFn: () => getSomaEventsPage(),
      });
    }
  };
}
