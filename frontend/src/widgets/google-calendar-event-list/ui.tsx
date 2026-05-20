"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { useAuthStore } from "@/features/auth/model";
import {
  useUpcomingGoogleCalendarEvents,
  useGoogleCalendarConnectionSync,
  useGoogleCalendarStore,
} from "@/features/connect-google-calendar/model";
import { GoogleCalendarConnectButton } from "@/features/connect-google-calendar/ui";
import { ApiResponseError } from "@/shared/api/client";
import { routes } from "@/shared/config/routes";
import { formatDateTime, formatTimeRange } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";

export function GoogleCalendarEventList() {
  const sessionId = useAuthStore((state) => state.sessionId);
  useGoogleCalendarConnectionSync();
  const connected = useGoogleCalendarStore((state) => state.connected);
  const eventsQuery = useUpcomingGoogleCalendarEvents();
  const header = (
    <div className="flex items-center gap-2">
      <CalendarDays aria-hidden="true" className="size-5 text-primary" />
      <h2 className="sb-section-title">내 캘린더 일정</h2>
    </div>
  );

  if (!connected || !sessionId) {
    return (
      <>
        {header}
        <EmptyState
          className="mt-3 border border-dashed"
          title="캘린더 연동하러 가볼까요?"
          description="Google Calendar를 연결하면 개인 일정과 캘린더에 추가한 소마 일정을 앞으로 7일 기준으로 함께 볼 수 있어요."
          action={<GoogleCalendarConnectButton />}
        />
      </>
    );
  }

  if (eventsQuery.isLoading) {
    return (
      <>
        {header}
        <LoadingState
          className="mt-3 min-h-28 rounded-lg border bg-white"
          label="Google Calendar 일정 불러오는 중"
        />
      </>
    );
  }

  if (eventsQuery.isError) {
    return (
      <>
        {header}
        <ErrorState
          description={
            eventsQuery.error instanceof ApiResponseError
              ? eventsQuery.error.message
              : "Google Calendar 일정 조회 상태를 확인해 주세요."
          }
          title="Google Calendar 일정을 불러오지 못했어요"
          onRetry={() => void eventsQuery.refetch()}
        />
      </>
    );
  }

  if (!eventsQuery.data || eventsQuery.data.length === 0) {
    return (
      <>
        {header}
        <EmptyState
          className="mt-3 border"
          description="이번 주 캘린더 일정이 없어요. 관심 있는 소마 일정을 내 캘린더에 추가하면 여기서 함께 보여요."
          title="특강 보러 가볼까요?"
          action={
            <Button asChild size="sm">
              <Link href={routes.events}>특강 보러 가기</Link>
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      {header}
      <div className="sb-list-surface">
        {eventsQuery.data.map((event) => (
          <div key={event.id} className="border-b border-border/80 px-5 py-5 last:border-b-0">
            <p className="truncate text-[17px] font-semibold leading-[25.5px]">{event.title}</p>
            <p className="mt-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
              {formatDateTime(event.startAt)} · {formatTimeRange(event.startAt, event.endAt)}
            </p>
            {event.location ? (
              <p className="mt-1 truncate text-[14px] font-medium leading-[21px] text-muted-foreground">
                {event.location}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
