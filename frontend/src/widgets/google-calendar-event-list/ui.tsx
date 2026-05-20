"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

import type { GoogleCalendarEvent } from "@/entities/calendar/model";
import { isSomaBiseoCalendarEvent } from "@/entities/calendar/model";
import { useAuthStore } from "@/features/auth/model";
import {
  useGoogleCalendarConnectionSync,
  useGoogleCalendarEventsInRange,
  useGoogleCalendarStore,
} from "@/features/connect-google-calendar/model";
import { GoogleCalendarConnectButton } from "@/features/connect-google-calendar/ui";
import { ApiResponseError } from "@/shared/api/client";
import { routes } from "@/shared/config/routes";
import { formatDateRange, formatDateTime, formatTimeRange, getWeekRange } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";

type CalendarView = "SOMA" | "ALL";

export function GoogleCalendarEventList() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState<CalendarView>("SOMA");
  const sessionId = useAuthStore((state) => state.sessionId);
  useGoogleCalendarConnectionSync();
  const connected = useGoogleCalendarStore((state) => state.connected);
  const { start: weekStart, end: weekEnd } = getWeekRange(weekOffset);
  const eventsQuery = useGoogleCalendarEventsInRange(weekStart, weekEnd);

  const weekLabel = weekOffset === 0 ? "이번 주" : formatDateRange(weekStart, weekEnd);
  const calendarEvents = eventsQuery.data ?? [];
  const somaEvents = calendarEvents.filter(isSomaBiseoCalendarEvent);
  const selectedEvents = view === "SOMA" ? somaEvents : calendarEvents;

  return (
    <div>
      <div className="flex items-center gap-2">
        <CalendarDays aria-hidden="true" className="size-5 text-primary" />
        <h2 className="sb-section-title">이번 주 일정</h2>
      </div>

      <div className="mt-3 space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
          <Button
            className="h-9 px-3"
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setWeekOffset((offset) => offset - 1)}
          >
            이전
          </Button>
          <p className="min-w-0 text-center text-[14px] font-bold leading-[21px]">
            {weekLabel}
          </p>
          <Button
            className="h-9 px-3"
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setWeekOffset((offset) => offset + 1)}
          >
            다음
          </Button>
        </div>

        <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-white">
          <CalendarViewButton
            count={somaEvents.length}
            isSelected={view === "SOMA"}
            label="소마 일정"
            onClick={() => setView("SOMA")}
          />
          <CalendarViewButton
            count={calendarEvents.length}
            isSelected={view === "ALL"}
            label="전체 일정"
            onClick={() => setView("ALL")}
          />
        </div>
      </div>

      <div className="mt-3">
        <CalendarEventContent
          connected={connected && Boolean(sessionId)}
          emptyDescription={
            view === "SOMA"
              ? "내 캘린더에 추가한 소마 특강이나 멘토링 일정이 없어요."
              : "이번 주 캘린더 일정이 없어요. 관심 있는 소마 일정을 내 캘린더에 추가하면 여기서 함께 보여요."
          }
          emptyTitle={view === "SOMA" ? "내 소마 일정이 없어요" : "특강 보러 가볼까요?"}
          events={selectedEvents}
          isError={eventsQuery.isError}
          isLoading={eventsQuery.isLoading}
          error={eventsQuery.error}
          onRetry={() => void eventsQuery.refetch()}
        />
      </div>
    </div>
  );
}

function CalendarViewButton({
  count,
  isSelected,
  label,
  onClick,
}: {
  count: number;
  isSelected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={
        isSelected
          ? "min-h-14 bg-blue-50 px-4 text-left text-blue-700"
          : "min-h-14 px-4 text-left text-muted-foreground transition-colors hover:bg-muted/50"
      }
      type="button"
      onClick={onClick}
    >
      <span className="block text-[13px] font-bold leading-[18px]">{label}</span>
      <span className="mt-0.5 block text-[18px] font-extrabold leading-[24px]">{count}개</span>
    </button>
  );
}

function CalendarEventContent({
  connected,
  emptyDescription,
  emptyTitle,
  error,
  events,
  isError,
  isLoading,
  onRetry,
}: {
  connected: boolean;
  emptyDescription: string;
  emptyTitle: string;
  error: unknown;
  events: GoogleCalendarEvent[];
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
}) {
  if (!connected) {
    return (
      <EmptyState
        className="border border-dashed"
        title="캘린더 연동하러 가볼까요?"
        description="Google Calendar를 연결하면 개인 일정과 캘린더에 추가한 소마 일정을 주 단위로 볼 수 있어요."
        action={<GoogleCalendarConnectButton />}
      />
    );
  }

  if (isLoading) {
    return <LoadingState className="min-h-28 rounded-lg border bg-white" label="Google Calendar 일정 불러오는 중" />;
  }

  if (isError) {
    return (
      <ErrorState
        description={
          error instanceof ApiResponseError
            ? error.message
            : "Google Calendar 일정 조회 상태를 확인해 주세요."
        }
        title="Google Calendar 일정을 불러오지 못했어요"
        onRetry={onRetry}
      />
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        className="border"
        description={emptyDescription}
        title={emptyTitle}
        action={
          <Button asChild size="sm">
            <Link href={routes.events}>특강 보러 가기</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="sb-list-surface">
      {events.map((event) => (
        <CalendarEventRow key={event.id} event={event} />
      ))}
    </div>
  );
}

function CalendarEventRow({ event }: { event: GoogleCalendarEvent }) {
  return (
    <div className="border-b border-border/80 px-5 py-5 last:border-b-0">
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
  );
}
