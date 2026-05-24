"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { getConflictForEvent, getGoogleCalendarEventLink } from "@/entities/calendar/api";
import type { SomaEvent } from "@/entities/soma-event/model";
import { useAuthStore } from "@/features/auth/model";
import {
  useGoogleCalendarConnectionSync,
  useGoogleCalendarStore,
} from "@/features/connect-google-calendar/model";
import { ApiResponseError } from "@/shared/api/client";
import { formatTimeRange } from "@/shared/lib/date";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";

export function CalendarConflictResult({ event }: { event: SomaEvent }) {
  const sessionId = useAuthStore((state) => state.sessionId);
  useGoogleCalendarConnectionSync();
  const connected = useGoogleCalendarStore((state) => state.connected);
  const linkQuery = useQuery({
    queryKey: ["google-calendar-event-link", event.id],
    queryFn: () => getGoogleCalendarEventLink(event),
    enabled: connected && Boolean(sessionId),
    retry: 0,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  const { data, error, isError, isLoading, refetch } = useQuery({
    queryKey: ["calendar-conflict", event.id, sessionId],
    queryFn: () => getConflictForEvent(event),
    enabled: connected && Boolean(sessionId) && linkQuery.data?.alreadyAdded === false,
    retry: 0,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  if (!connected || !sessionId) {
    return (
      <div className="rounded-lg border border-dashed bg-white p-4 text-sm leading-6 text-muted-foreground">
        Google로 로그인하면 이 일정의 충돌 여부를 확인합니다.
      </div>
    );
  }

  if (linkQuery.isLoading) {
    return <LoadingState className="min-h-24 rounded-lg border bg-white" label="캘린더 상태 확인 중" />;
  }

  if (linkQuery.data?.alreadyAdded) {
    return null;
  }

  if (isLoading) {
    return <LoadingState className="min-h-24 rounded-lg border bg-white" label="충돌 확인 중" />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="충돌 여부를 확인하지 못했어요"
        description={
          error instanceof ApiResponseError
            ? error.message
            : "Google Calendar 연결 상태를 확인한 뒤 다시 시도해 주세요."
        }
        onRetry={() => void refetch()}
      />
    );
  }

  if (!data.hasConflict) {
    return (
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 aria-hidden="true" className="size-5" />
          <p className="font-semibold">충돌 없음</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 text-amber-800">
        <AlertTriangle aria-hidden="true" className="size-5" />
        <p className="font-semibold">일정 충돌</p>
      </div>
      <div className="mt-3 space-y-2">
        {data.busyBlocks.map((busy) => (
          <p key={busy.id} className="text-sm text-amber-900">
            {formatTimeRange(busy.startAt, busy.endAt)} {busy.title}
          </p>
        ))}
      </div>
    </div>
  );
}
