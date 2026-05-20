import type { SomaEventType } from "@/entities/soma-event/model";

export type ReviewFeedItem = {
  id: number;
  eventId: string;
  eventTitle: string;
  eventType: SomaEventType;
  mentorName: string | null;
  content: string;
  authorName: string;
  createdAt: string;
};

export type ReviewFeedPage = {
  items: ReviewFeedItem[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
};

export type Review = {
  id: number;
  eventId: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export type WritableEvent = {
  eventId: string;
  type: SomaEventType;
  title: string;
  mentorName: string | null;
  endAt: string;
  applicants: string[];
};

export type RecentEndedEvent = {
  eventId: string;
  type: SomaEventType;
  title: string;
  mentorName: string | null;
  endAt: string;
  reviewCount: number;
};

export type ReviewPage = {
  items: Review[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
};

export type ReviewSummary = {
  eventId: string;
  reviewCount: number;
  lastCreatedAt: string | null;
};

export const REVIEW_CONTENT_MIN = 20;
export const REVIEW_CONTENT_MAX = 500;
