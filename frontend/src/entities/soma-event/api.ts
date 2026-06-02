import type {
  SomaEventApplicant,
  SomaEventDetailItem,
  EventAiSummary,
  SomaEvent,
  SomaEventFilter,
  SomaEventStatus,
  SomaEventType,
} from "@/entities/soma-event/model";
import { apiClient, type ApiResponse, unwrapApiResponse } from "@/shared/api/client";

const MAX_DASHBOARD_EVENT_PAGES = 3;

export type SomaEventSort =
  | "LECTURE_DATE_DESC"
  | "LECTURE_DATE_ASC"
  | "REGISTERED_AT_DESC"
  | "REMAINING_SEATS_ASC";

export const DEFAULT_SOMA_EVENT_SORT: SomaEventSort = "LECTURE_DATE_DESC";

type PortalPage<T> = {
  items: T[];
  page: number;
  totalPages: number;
  hasNextPage: boolean;
};

type PortalEventResponse = {
  sourceId: string;
  type: SomaEventType;
  title: string;
  mentorName: string | null;
  topic: string | null;
  location: string | null;
  startAt: string | null;
  endAt: string | null;
  applicationStartAt?: string | null;
  applicationEndAt?: string | null;
  capacity?: number | null;
  applicantCount?: number | null;
  status: string | null;
  approvalStatus?: string | null;
  operationType?: string | null;
  author?: string | null;
  registeredAt?: string | null;
  sourceUrl: string;
  detailItems?: SomaEventDetailItem[] | null;
  contentText?: string | null;
  applicants?: SomaEventApplicant[] | null;
  detailSyncedAt?: string | null;
  rawText: string;
};

export type MentoLecApplicationResponse = {
  qustnrSn: string;
  applied: boolean;
  message: string;
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
    location: event.location ?? detailItemValue(event.detailItems, "장소"),
    startAt: event.startAt,
    endAt: event.endAt,
    applicationStartAt: event.applicationStartAt ?? null,
    applicationEndAt: event.applicationEndAt ?? null,
    capacity: event.capacity ?? null,
    applicantCount: event.applicantCount ?? null,
    status: normalizeStatus(event.status),
    approvalStatus: event.approvalStatus ?? null,
    operationType: event.operationType ?? null,
    author: event.author ?? null,
    registeredAt: event.registeredAt ?? null,
    sourceUrl: event.sourceUrl,
    detailItems: event.detailItems ?? [],
    contentText: event.contentText ?? null,
    applicants: event.applicants ?? [],
    detailSyncedAt: event.detailSyncedAt ?? null,
    rawText: event.rawText,
    conflict: { hasConflict: false, busyBlocks: [] },
  };
}

function detailItemValue(
  detailItems: SomaEventDetailItem[] | null | undefined,
  label: string,
) {
  const normalizedLabel = normalizeDetailLabel(label);

  return (
    detailItems?.find((item) => normalizeDetailLabel(item.label) === normalizedLabel)?.value ??
    null
  );
}

function normalizeDetailLabel(label: string) {
  return label.replace(/\s+/g, "");
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

export async function getSomaEvents(
  filter: SomaEventFilter = {},
  page = 1,
  sort: SomaEventSort = DEFAULT_SOMA_EVENT_SORT,
) {
  const eventsPage = await getSomaEventsPage({ page, sort });

  return eventsPage.items.filter((event) => matchesFilter(event, filter));
}

async function getSomaEventsPages(
  maxPages: number,
  sort: SomaEventSort = DEFAULT_SOMA_EVENT_SORT,
  options: Omit<GetSomaEventsPageOptions, "page" | "sort"> = {},
) {
  const firstPage = await getSomaEventsPage({ ...options, page: 1, sort });
  const lastPage = Math.min(maxPages, firstPage.totalPages);

  if (!firstPage.hasNextPage || lastPage <= 1) {
    return firstPage.items;
  }

  const restPages = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) =>
      getSomaEventsPage({ ...options, page: index + 2, sort }),
    ),
  );

  return [
    ...firstPage.items,
    ...restPages.flatMap((pageResponse) => pageResponse.items),
  ];
}

export type SomaEventMode = "ONLINE" | "OFFLINE";

export type GetSomaEventsPageOptions = {
  page?: number;
  sort?: SomaEventSort;
  type?: SomaEventType;
  mode?: SomaEventMode;
  q?: string;
  date?: string;
  activeAt?: string;
};

export async function getSomaEventsPage({
  page = 1,
  sort = DEFAULT_SOMA_EVENT_SORT,
  type,
  mode,
  q,
  date,
  activeAt,
}: GetSomaEventsPageOptions = {}) {
  const searchParams: Record<string, string | number> = { page, sort };

  if (type) {
    searchParams.type = type;
  }

  if (mode) {
    searchParams.mode = mode;
  }

  const trimmedQ = q?.trim();

  if (trimmedQ) {
    searchParams.q = trimmedQ;
  }

  const trimmedDate = date?.trim();

  if (trimmedDate) {
    searchParams.date = trimmedDate;
  }

  if (activeAt) {
    searchParams.activeAt = activeAt;
  }

  const response = await unwrapApiResponse(
    apiClient
      .get("soma/events", { searchParams })
      .json<ApiResponse<PortalEventResponse[] | PortalPage<PortalEventResponse>>>(),
  );
  const pageResponse = normalizePortalPage(response, page);

  return {
    ...pageResponse,
    items: pageResponse.items.map(toSomaEvent),
  };
}

export async function getSomaEventById(eventId: string, options: { refresh?: boolean } = {}) {
  const searchParams: Record<string, string | boolean> = {
    sourceId: eventId,
  };

  if (options.refresh) {
    searchParams.refresh = true;
  }

  const detail = await unwrapApiResponse(
    apiClient
      .get("soma/events/detail", { searchParams })
      .json<ApiResponse<PortalEventResponse>>(),
  );

  return toSomaEvent(detail);
}

export async function applyMentoLec(sessionId: string, qustnrSn: string) {
  return unwrapApiResponse(
    apiClient
      .post(`soma/mento-lecs/${qustnrSn}/apply`, {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      })
      .json<ApiResponse<MentoLecApplicationResponse>>(),
  );
}

export async function cancelMentoLecApplication(sessionId: string, qustnrSn: string) {
  return unwrapApiResponse(
    apiClient
      .delete(`soma/mento-lecs/${qustnrSn}/application`, {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      })
      .json<ApiResponse<MentoLecApplicationResponse>>(),
  );
}

export async function summarizeSomaEvent(sourceUrl: string) {
  return unwrapApiResponse(
    apiClient
      .post("soma/events/summary", {
        json: {
          sourceUrl,
        },
      })
      .json<ApiResponse<EventAiSummary>>(),
  );
}

function normalizePortalPage<T>(
  response: T[] | PortalPage<T>,
  requestedPage: number,
): PortalPage<T> {
  if (Array.isArray(response)) {
    return {
      items: response,
      page: requestedPage,
      totalPages: requestedPage,
      hasNextPage: false,
    };
  }

  return response;
}

export async function getAlmostFullEvents() {
  const response = await unwrapApiResponse(
    apiClient
      .get("soma/events/almost-full")
      .json<ApiResponse<PortalEventResponse[]>>(),
  );

  return response.map(toSomaEvent);
}

export async function getDashboardEvents() {
  const now = new Date();
  const [events, almostFullEvents] = await Promise.all([
    getSomaEventsPages(MAX_DASHBOARD_EVENT_PAGES, "LECTURE_DATE_ASC", {
      activeAt: now.toISOString(),
    }),
    getAlmostFullEvents(),
  ]);
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return {
    todayEvents: events.filter((event) => event.startAt?.startsWith(today)),
    upcomingEvents: events.slice(0, 3),
    recommendationCandidates: events,
    almostFullEvents,
    conflictedEvents: events.filter((event) => event.conflict.hasConflict),
  };
}
