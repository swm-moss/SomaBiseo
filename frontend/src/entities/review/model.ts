import type { SomaEventType } from "@/entities/soma-event/model";

export type ReviewFeedItem = {
  id: number;
  eventId: string;
  eventTitle: string;
  eventType: SomaEventType;
  mentorName: string | null;
  content: string;
  authorName: string;
  isAuthor: boolean;
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

export type EndedEvent = {
  eventId: string;
  type: SomaEventType;
  title: string;
  mentorName: string | null;
  startAt: string;
  endAt: string;
  reviewCount: number;
};

export type EndedEventPage = {
  items: EndedEvent[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
};

export const REVIEW_CONTENT_MIN = 20;
export const REVIEW_CONTENT_MAX = 500;
