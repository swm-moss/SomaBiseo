"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";

import type { GoogleCalendarEvent } from "@/entities/calendar/model";
import {
  getSomaBiseoEventId,
  getSomaBiseoEventType,
  isSomaBiseoCalendarEvent,
} from "@/entities/calendar/model";
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
import { StatusBadge } from "@/shared/ui/status-badge";

type CalendarView = "SOMA" | "ALL";
type SomaCalendarEventType = "LECTURE" | "MENTORING";
type CalendarEventTimingBadge = "NOW" | "NEXT";

const somaEventTypeLabel: Record<SomaCalendarEventType, string> = {
  LECTURE: "멘토특강",
  MENTORING: "자유멘토링",
};

export function GoogleCalendarEventList() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState<CalendarView>("SOMA");
  const sessionId = useAuthStore((state) => state.sessionId);
  useGoogleCalendarConnectionSync();
  const connected = useGoogleCalendarStore((state) => state.connected);
  const googleAccountEmail = useGoogleCalendarStore((state) => state.googleAccountEmail);
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
          googleAccountEmail={googleAccountEmail}
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

function CalendarEventRow({
  event,
  googleAccountEmail,
  timingBadge,
}: {
  event: GoogleCalendarEvent;
  googleAccountEmail?: string;
  timingBadge?: CalendarEventTimingBadge;
}) {
  const somaEventId = getSomaBiseoEventId(event);
  const eventType = getSomaEventType(event);
  const displayTitle = getCalendarEventDisplayTitle(event);
  const googleCalendarHref = event.htmlLink
    ? withGoogleAccountHint(event.htmlLink, googleAccountEmail)
    : null;

  const content = (
    <div className="flex gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {timingBadge ? <TimingBadge value={timingBadge} /> : null}
          {eventType ? (
            <StatusBadge tone={eventType === "LECTURE" ? "blue" : "cyan"}>
              {somaEventTypeLabel[eventType]}
            </StatusBadge>
          ) : null}
        </div>
        <p className="mt-2 truncate text-[17px] font-semibold leading-[25.5px]">{displayTitle}</p>
        <p className="mt-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
          {formatDateTime(event.startAt)} · {formatTimeRange(event.startAt, event.endAt)}
        </p>
        {event.location ? (
          <p className="mt-2 flex items-center gap-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
            <MapPin aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        ) : null}
      </div>
      {googleCalendarHref ? <GoogleCalendarLink href={googleCalendarHref} /> : null}
    </div>
  );

  if (somaEventId) {
    return (
      <div className="relative border-b border-border/80 last:border-b-0">
        <Link
          aria-label={displayTitle}
          className="absolute inset-0 z-0 transition-colors hover:bg-muted/40"
          href={routes.eventDetail(somaEventId)}
        />
        <div className="pointer-events-none relative z-10 px-5 py-5">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border/80 px-5 py-5 last:border-b-0">
      {content}
    </div>
  );
}

function CalendarEventContent({
  connected,
  emptyDescription,
  emptyTitle,
  error,
  events,
  googleAccountEmail,
  isError,
  isLoading,
  onRetry,
}: {
  connected: boolean;
  emptyDescription: string;
  emptyTitle: string;
  error: unknown;
  events: GoogleCalendarEvent[];
  googleAccountEmail?: string;
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
}) {
  const timingBadgeByEventId = getTimingBadgeByEventId(events);

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
        <CalendarEventRow
          key={event.id}
          event={event}
          googleAccountEmail={googleAccountEmail}
          timingBadge={timingBadgeByEventId.get(event.id)}
        />
      ))}
    </div>
  );
}

function GoogleCalendarLink({ href }: { href: string }) {
  return (
    <a
      aria-label="Google Calendar에서 보기"
      className="pointer-events-auto relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <ExternalLink aria-hidden="true" className="size-4" />
    </a>
  );
}

function TimingBadge({ value }: { value: CalendarEventTimingBadge }) {
  return (
    <span
      className={
        value === "NOW"
          ? "inline-flex h-6 items-center rounded-md bg-emerald-50 px-2 text-[11px] font-black leading-none text-emerald-700"
          : "inline-flex h-6 items-center rounded-md bg-indigo-50 px-2 text-[11px] font-black leading-none text-indigo-700"
      }
    >
      {value}
    </span>
  );
}

function getTimingBadgeByEventId(events: GoogleCalendarEvent[]) {
  const now = Date.now();
  const result = new Map<string, CalendarEventTimingBadge>();

  for (const event of events) {
    const startAt = new Date(event.startAt).getTime();
    const endAt = new Date(event.endAt).getTime();

    if (startAt <= now && now < endAt) {
      result.set(event.id, "NOW");
    }
  }

  const nextEvent = events
    .filter((event) => !result.has(event.id))
    .map((event) => ({
      event,
      startAt: new Date(event.startAt).getTime(),
    }))
    .filter(({ startAt }) => startAt > now)
    .sort((first, second) => first.startAt - second.startAt)[0]?.event;

  if (nextEvent) {
    result.set(nextEvent.id, "NEXT");
  }

  return result;
}

function withGoogleAccountHint(href: string, googleAccountEmail?: string) {
  if (!googleAccountEmail) {
    return href;
  }

  try {
    const url = new URL(href);
    url.searchParams.set("authuser", googleAccountEmail);

    return url.toString();
  } catch {
    const separator = href.includes("?") ? "&" : "?";

    return `${href}${separator}authuser=${encodeURIComponent(googleAccountEmail)}`;
  }
}

function getSomaEventType(event: GoogleCalendarEvent): SomaCalendarEventType | null {
  const markerType = getSomaBiseoEventType(event);

  if (markerType === "LECTURE" || markerType === "MENTORING") {
    return markerType;
  }

  if (event.title.includes("[멘토특강]") || event.title.includes("[멘토 특강]")) {
    return "LECTURE";
  }

  if (
    event.title.includes("[자유멘토링]")
    || event.title.includes("[자유 멘토링]")
    || event.title.includes("[멘토링]")
  ) {
    return "MENTORING";
  }

  return null;
}

function getCalendarEventDisplayTitle(event: GoogleCalendarEvent) {
  return event.title
    .replace("[멘토 특강]", "")
    .replace("[멘토특강]", "")
    .replace("[자유 멘토링]", "")
    .replace("[자유멘토링]", "")
    .replace("[멘토링]", "")
    .trim();
}
