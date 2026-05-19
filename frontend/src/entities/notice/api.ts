import type { Notice, NoticeCategory } from "@/entities/notice/model";
import { apiClient, type ApiResponse, unwrapApiResponse } from "@/shared/api/client";

export const PORTAL_NOTICE_PAGE_SIZE = 10;
const MAX_NOTICE_LOOKUP_PAGES = 10;

type PortalNoticeResponse = {
  sourceId: string;
  title: string;
  sourceUrl: string;
  publishedAt: string | null;
  rawText: string;
};

function inferCategory(notice: PortalNoticeResponse): NoticeCategory {
  const text = `${notice.title} ${notice.rawText}`;

  if (text.includes("멘토링")) {
    return "MENTORING";
  }

  if (text.includes("특강")) {
    return "LECTURE";
  }

  if (text.includes("필수") || text.includes("센터") || text.includes("팀")) {
    return "ADMIN";
  }

  return "GENERAL";
}

function toNotice(notice: PortalNoticeResponse): Notice {
  return {
    id: notice.sourceId,
    sourceId: notice.sourceId,
    title: notice.title,
    content: notice.rawText,
    category: inferCategory(notice),
    sourceUrl: notice.sourceUrl,
    isImportant: notice.title.includes("필수") || notice.title.includes("중요"),
    publishedAt: notice.publishedAt ?? new Date().toISOString(),
  };
}

export async function getNotices(sessionId: string, page = 1) {
  return getNoticesPage(sessionId, page);
}

export async function getNoticesPage(sessionId: string, page = 1) {
  const notices = await unwrapApiResponse(
    apiClient
      .get("soma/notices", {
        searchParams: {
          sessionId,
          page,
        },
      })
      .json<ApiResponse<PortalNoticeResponse[]>>(),
  );

  return notices.map(toNotice);
}

export async function getNoticeById(sessionId: string, noticeId: string) {
  for (let page = 1; page <= MAX_NOTICE_LOOKUP_PAGES; page += 1) {
    const notices = await getNoticesPage(sessionId, page);
    const notice = notices.find((item) => item.id === noticeId);

    if (notice) {
      return notice;
    }

    if (notices.length < PORTAL_NOTICE_PAGE_SIZE) {
      break;
    }
  }

  return null;
}
