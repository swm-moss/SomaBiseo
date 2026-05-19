import type { Notice, NoticeCategory } from "@/entities/notice/model";
import { apiClient, type ApiResponse, unwrapApiResponse } from "@/shared/api/client";

const MAX_NOTICE_LOOKUP_PAGES = 10;

export type PortalPage<T> = {
  items: T[];
  page: number;
  totalPages: number;
  hasNextPage: boolean;
};

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

export async function getNotices(page = 1) {
  const noticesPage = await getNoticesPage(page);

  return noticesPage.items;
}

export async function getNoticesPage(page = 1) {
  const response = await unwrapApiResponse(
    apiClient
      .get("soma/notices", {
        searchParams: {
          page,
        },
      })
      .json<ApiResponse<PortalNoticeResponse[] | PortalPage<PortalNoticeResponse>>>(),
  );
  const pageResponse = normalizePortalPage(response, page);

  return {
    ...pageResponse,
    items: pageResponse.items.map(toNotice),
  };
}

export async function getNoticeById(noticeId: string) {
  for (let page = 1; page <= MAX_NOTICE_LOOKUP_PAGES; page += 1) {
    const noticesPage = await getNoticesPage(page);
    const notice = noticesPage.items.find((item) => item.id === noticeId);

    if (notice) {
      return notice;
    }

    if (!noticesPage.hasNextPage) {
      break;
    }
  }

  return null;
}

function normalizePortalPage<T>(
  response: T[] | PortalPage<T>,
  requestedPage: number,
): PortalPage<T> {
  if (Array.isArray(response)) {
    return {
      items: response,
      page: requestedPage,
      totalPages: requestedPage,
      hasNextPage: false,
    };
  }

  return response;
}
