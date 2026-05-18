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
  mentorName: string;
  topic: string;
  description: string;
  location: string;
  startAt: string;
  endAt: string;
  applicationStartAt: string;
  applicationEndAt: string;
  capacity: number;
  status: SomaEventStatus;
  sourceUrl: string;
  conflict: CalendarConflict;
};

export type SomaEventFilter = {
  type?: SomaEventType;
  from?: string;
  to?: string;
};
