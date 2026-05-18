import type { Notice } from "@/entities/notice/model";

export const noticeMocks: Notice[] = [
  {
    id: "notice-1",
    sourceId: "soma-notice-20260518-lecture",
    title: "5월 멘토특강 신청 일정 안내",
    content:
      "5월 멘토특강 신청 기간과 참여 방법을 안내합니다. 관심 있는 특강은 일정 충돌 여부를 먼저 확인해 주세요.",
    category: "LECTURE",
    sourceUrl: "https://swmaestro.org",
    isImportant: true,
    publishedAt: "2026-05-18T07:30:00+09:00",
    deadlineAt: "2026-05-19T18:00:00+09:00",
  },
  {
    id: "notice-2",
    sourceId: "soma-notice-20260517-office-hour",
    title: "자유멘토링 운영 시간 변경",
    content:
      "이번 주 자유멘토링 일부 시간이 조정됐습니다. 이미 캘린더에 추가한 일정은 상세 페이지에서 다시 확인해 주세요.",
    category: "MENTORING",
    sourceUrl: "https://swmaestro.org",
    isImportant: false,
    publishedAt: "2026-05-17T16:00:00+09:00",
  },
  {
    id: "notice-3",
    sourceId: "soma-notice-20260516-security",
    title: "개인 프로젝트 저장소 공개 범위 점검 요청",
    content:
      "개인 프로젝트 저장소에 민감 정보가 올라가지 않도록 환경변수와 OAuth 토큰 저장 위치를 점검해 주세요.",
    category: "ADMIN",
    sourceUrl: "https://swmaestro.org",
    isImportant: true,
    publishedAt: "2026-05-16T10:00:00+09:00",
  },
  {
    id: "notice-4",
    sourceId: "soma-notice-20260515-center",
    title: "부산센터 출입 카드 재발급 안내",
    content: "부산센터 출입 카드 재발급 신청은 운영 데스크에서 받습니다.",
    category: "GENERAL",
    sourceUrl: "https://swmaestro.org",
    isImportant: false,
    publishedAt: "2026-05-15T11:20:00+09:00",
  },
];

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 160);
  });
}

export async function getNotices() {
  return delay(
    [...noticeMocks].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    ),
  );
}

export async function getNoticeById(noticeId: string) {
  return delay(noticeMocks.find((notice) => notice.id === noticeId) ?? null);
}
