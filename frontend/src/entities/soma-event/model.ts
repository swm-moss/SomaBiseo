import type { CalendarConflict } from "@/entities/calendar/model";

export type SomaEventType = "LECTURE" | "MENTORING";

export type SomaEventStatus =
  | "OPEN"
  | "CLOSED"
  | "FULL"
  | "SCHEDULED"
  | "CANCELED"
  | "UNKNOWN";

export type SomaEvent = {
  id: string;
  sourceId: string;
  type: SomaEventType;
  title: string;
  mentorName: string | null;
  topic: string;
  description: string;
  location: string | null;
  startAt: string | null;
  endAt: string | null;
  applicationStartAt: string | null;
  applicationEndAt: string | null;
  capacity: number | null;
  status: SomaEventStatus;
  sourceUrl: string;
  conflict: CalendarConflict;
};

export type SomaEventFilter = {
  type?: SomaEventType;
  from?: string;
  to?: string;
};
