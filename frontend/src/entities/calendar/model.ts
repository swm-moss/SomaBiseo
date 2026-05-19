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
};
