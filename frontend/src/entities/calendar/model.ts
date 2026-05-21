export type BusyBlock = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
};

export type CalendarConflict = {
  hasConflict: boolean;
  busyBlocks: BusyBlock[];
};

export type CalendarConflictStatus = CalendarConflict & {
  eventId: string;
  alreadyAdded: boolean;
};

export type CalendarConnection = {
  connected: boolean;
  googleAccountEmail?: string | null;
  calendarId?: string | null;
  calendarName?: string | null;
};

export type GoogleCalendarEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  calendarId: string;
  location: string | null;
  description: string | null;
};

export const SOMA_BISEO_EVENT_MARKER_PREFIX = "SomaBiseo Event ID: ";
export const SOMA_BISEO_EVENT_TYPE_MARKER_PREFIX = "SomaBiseo Event Type: ";

export function isSomaBiseoCalendarEvent(event: GoogleCalendarEvent) {
  return Boolean(getSomaBiseoEventId(event));
}

export function getSomaBiseoEventId(event: GoogleCalendarEvent) {
  return event.description
    ?.split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith(SOMA_BISEO_EVENT_MARKER_PREFIX))
    ?.slice(SOMA_BISEO_EVENT_MARKER_PREFIX.length)
    .trim() ?? null;
}
