import type {
  SomaEvent,
  SomaEventFilter,
  SomaEventStatus,
  SomaEventType,
} from "@/entities/soma-event/model";
import { apiClient, type ApiResponse, unwrapApiResponse } from "@/shared/api/client";

type PortalEventResponse = {
  sourceId: string;
  type: SomaEventType;
  title: string;
  mentorName: string | null;
  topic: string | null;
  location: string | null;
  startAt: string | null;
  endAt: string | null;
  status: string | null;
  sourceUrl: string;
  rawText: string;
};

const knownStatuses = new Set<SomaEventStatus>([
  "OPEN",
  "CLOSED",
  "FULL",
  "SCHEDULED",
  "CANCELED",
  "UNKNOWN",
]);

function normalizeStatus(status: string | null): SomaEventStatus {
  if (status && knownStatuses.has(status as SomaEventStatus)) {
    return status as SomaEventStatus;
  }

  return "UNKNOWN";
}

function toSomaEvent(event: PortalEventResponse): SomaEvent {
  return {
    id: event.sourceId,
    sourceId: event.sourceId,
    type: event.type,
    title: event.title,
    mentorName: event.mentorName,
    topic: event.topic ?? event.title,
    description: event.rawText,
    location: event.location,
    startAt: event.startAt,
    endAt: event.endAt,
    applicationStartAt: null,
    applicationEndAt: null,
    capacity: null,
    status: normalizeStatus(event.status),
    sourceUrl: event.sourceUrl,
    conflict: { hasConflict: false, busyBlocks: [] },
  };
}

function byStartAt(a: SomaEvent, b: SomaEvent) {
  const aTime = a.startAt ? new Date(a.startAt).getTime() : Number.POSITIVE_INFINITY;
  const bTime = b.startAt ? new Date(b.startAt).getTime() : Number.POSITIVE_INFINITY;

  return aTime - bTime;
}

function matchesFilter(event: SomaEvent, filter: SomaEventFilter) {
  if (filter.type && event.type !== filter.type) {
    return false;
  }

  if (!event.startAt || (!filter.from && !filter.to)) {
    return true;
  }

  const start = new Date(event.startAt).getTime();
  const from = filter.from ? new Date(filter.from).getTime() : Number.NEGATIVE_INFINITY;
  const to = filter.to ? new Date(filter.to).getTime() : Number.POSITIVE_INFINITY;

  return start >= from && start <= to;
}

export async function getSomaEvents(sessionId: string, filter: SomaEventFilter = {}, page = 1) {
  const events = await unwrapApiResponse(
    apiClient
      .get("soma/events", {
        searchParams: {
          sessionId,
          page,
        },
      })
      .json<ApiResponse<PortalEventResponse[]>>(),
  );

  return events.map(toSomaEvent).filter((event) => matchesFilter(event, filter)).sort(byStartAt);
}

export async function getSomaEventById(sessionId: string, eventId: string) {
  const events = await getSomaEvents(sessionId);

  return events.find((event) => event.id === eventId) ?? null;
}

export async function getDashboardEvents(sessionId: string) {
  const events = await getSomaEvents(sessionId);
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return {
    todayEvents: events.filter((event) => event.startAt?.startsWith(today)),
    upcomingEvents: events.slice(0, 3),
    deadlineSoonEvents: events.filter((event) => event.status === "OPEN").slice(0, 3),
    conflictedEvents: events.filter((event) => event.conflict.hasConflict),
  };
}
