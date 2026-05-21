import type { CalendarConflict } from "@/entities/calendar/model";

export type SomaEventType = "LECTURE" | "MENTORING";

export type SomaEventStatus =
  | "OPEN"
  | "CLOSED"
  | "FULL"
  | "SCHEDULED"
  | "CANCELED"
  | "UNKNOWN";

export type SomaEventDetailItem = {
  label: string;
  value: string;
};

export type SomaEventApplicant = {
  no: string;
  traineeName: string;
  appliedAt: string;
  canceledAt: string | null;
  status: string;
};

export type EventAiSummary = {
  sourceId: string;
  contentHash: string;
  model: string;
  cached: boolean;
  oneLine: string;
  summaryBullets: string[];
  targetAudience: string[];
  keyTopics: string[];
  takeaways: string[];
  difficulty: "입문" | "중급" | "심화" | "미정";
  inputTokens: number | null;
  outputTokens: number | null;
  generatedAt: string;
};

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
  applicantCount: number | null;
  status: SomaEventStatus;
  approvalStatus: string | null;
  operationType: string | null;
  author: string | null;
  registeredAt: string | null;
  sourceUrl: string;
  detailItems: SomaEventDetailItem[];
  contentText: string | null;
  applicants: SomaEventApplicant[];
  detailSyncedAt: string | null;
  rawText: string;
  conflict: CalendarConflict;
};

export type SomaEventFilter = {
  type?: SomaEventType;
  from?: string;
  to?: string;
};
