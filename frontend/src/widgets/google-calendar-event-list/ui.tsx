"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";

import { getGoogleCalendarEvents } from "@/entities/calendar/api";
import { useAuthStore } from "@/features/auth/model";
import { useGoogleCalendarStore } from "@/features/connect-google-calendar/model";
import { ApiResponseError } from "@/shared/api/client";
import { formatDateTime, formatTimeRange } from "@/shared/lib/date";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";

export function GoogleCalendarEventList() {
  const sessionId = useAuthStore((state) => state.sessionId);
  const connected = useGoogleCalendarStore((state) => state.connected);
  const eventsQuery = useQuery({
    queryKey: ["google-calendar-events", "upcoming", sessionId],
    queryFn: () => {
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      return getGoogleCalendarEvents(now.toISOString(), sevenDaysLater.toISOString());
    },
    enabled: connected && Boolean(sessionId),
    retry: 0,
  });

  if (!connected || !sessionId) {
    return (
      <div className="rounded-lg border border-dashed bg-white p-4 text-sm leading-6 text-muted-foreground">
        Google로 로그인하면 내 캘린더의 다가오는 일정도 함께 확인할 수 있습니다.
      </div>
    );
  }

  if (eventsQuery.isLoading) {
    return <LoadingState className="min-h-28 rounded-lg border bg-white" label="Google Calendar 일정 불러오는 중" />;
  }

  if (eventsQuery.isError) {
    return (
      <ErrorState
        description={
          eventsQuery.error instanceof ApiResponseError
            ? eventsQuery.error.message
            : "Google Calendar 일정 조회 상태를 확인해 주세요."
        }
        title="Google Calendar 일정을 불러오지 못했어요"
        onRetry={() => void eventsQuery.refetch()}
      />
    );
  }

  if (!eventsQuery.data || eventsQuery.data.length === 0) {
    return (
      <EmptyState
        className="border"
        description="앞으로 7일 안에 표시할 Google Calendar 일정이 없습니다."
        title="다가오는 일정이 없어요"
      />
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <CalendarDays aria-hidden="true" className="size-5 text-primary" />
        <h2 className="text-sm font-semibold">다가오는 Google Calendar 일정</h2>
      </div>
      <div className="divide-y">
        {eventsQuery.data.map((event) => (
          <div key={event.id} className="px-4 py-3">
            <p className="truncate text-sm font-semibold">{event.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDateTime(event.startAt)} · {formatTimeRange(event.startAt, event.endAt)}
            </p>
            {event.location ? (
              <p className="mt-1 truncate text-sm text-muted-foreground">{event.location}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
