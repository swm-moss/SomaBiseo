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

export function isSomaBiseoCalendarEvent(event: GoogleCalendarEvent) {
  return event.description
    ?.split("\n")
    .some((line) => line.trim().startsWith(SOMA_BISEO_EVENT_MARKER_PREFIX)) ?? false;
}
