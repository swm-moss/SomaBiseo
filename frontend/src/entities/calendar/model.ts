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
  googleAccountEmail?: string;
  calendarId?: string;
  calendarName?: string;
};
