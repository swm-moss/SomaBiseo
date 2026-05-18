export type NoticeCategory = "GENERAL" | "LECTURE" | "MENTORING" | "ADMIN";

export type Notice = {
  id: string;
  sourceId: string;
  title: string;
  content: string;
  category: NoticeCategory;
  sourceUrl: string;
  isImportant: boolean;
  publishedAt: string;
  deadlineAt?: string;
};

export type NoticeFilter = "ALL" | "IMPORTANT" | "UNREAD" | "BOOKMARKED";
