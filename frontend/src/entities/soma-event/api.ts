import type { BusyBlock } from "@/entities/calendar/model";
import type {
  SomaEvent,
  SomaEventFilter,
  SomaEventType,
} from "@/entities/soma-event/model";

const busyBlocks: BusyBlock[] = [
  {
    id: "busy-1",
    title: "팀 회의",
    startAt: "2026-05-20T15:00:00+09:00",
    endAt: "2026-05-20T16:00:00+09:00",
  },
  {
    id: "busy-2",
    title: "멘토링 준비",
    startAt: "2026-05-22T10:30:00+09:00",
    endAt: "2026-05-22T11:30:00+09:00",
  },
];

export const somaEventMocks: SomaEvent[] = [
  {
    id: "event-1",
    sourceId: "soma-lecture-20260520-ai-product",
    type: "LECTURE",
    title: "AI 제품을 실제 사용자에게 붙이는 법",
    mentorName: "정다은 멘토",
    topic: "AI Product",
    description: "프로토타입을 실사용 흐름으로 옮길 때 필요한 제품 판단과 지표를 다룹니다.",
    location: "부산센터 3층 세미나실",
    startAt: "2026-05-20T15:00:00+09:00",
    endAt: "2026-05-20T17:00:00+09:00",
    applicationStartAt: "2026-05-18T10:00:00+09:00",
    applicationEndAt: "2026-05-19T18:00:00+09:00",
    capacity: 40,
    status: "OPEN",
    sourceUrl: "https://swmaestro.org",
    conflict: { hasConflict: true, busyBlocks: [busyBlocks[0]] },
  },
  {
    id: "event-2",
    sourceId: "soma-mentoring-20260522-backend",
    type: "MENTORING",
    title: "백엔드 API 설계 점검",
    mentorName: "이현우 멘토",
    topic: "Backend",
    description: "도메인 경계, 예외 처리, API 응답 계약을 중심으로 프로젝트 구조를 봅니다.",
    location: "온라인",
    startAt: "2026-05-22T10:00:00+09:00",
    endAt: "2026-05-22T12:00:00+09:00",
    applicationStartAt: "2026-05-18T09:00:00+09:00",
    applicationEndAt: "2026-05-21T12:00:00+09:00",
    capacity: 8,
    status: "OPEN",
    sourceUrl: "https://swmaestro.org",
    conflict: { hasConflict: true, busyBlocks: [busyBlocks[1]] },
  },
  {
    id: "event-3",
    sourceId: "soma-lecture-20260525-growth",
    type: "LECTURE",
    title: "초기 서비스 성장 실험",
    mentorName: "김서윤 멘토",
    topic: "Growth",
    description: "초기 사용자 인터뷰와 작게 굴리는 성장 실험의 우선순위를 정리합니다.",
    location: "서울센터 2층",
    startAt: "2026-05-25T19:00:00+09:00",
    endAt: "2026-05-25T21:00:00+09:00",
    applicationStartAt: "2026-05-19T10:00:00+09:00",
    applicationEndAt: "2026-05-24T18:00:00+09:00",
    capacity: 50,
    status: "SCHEDULED",
    sourceUrl: "https://swmaestro.org",
    conflict: { hasConflict: false, busyBlocks: [] },
  },
  {
    id: "event-4",
    sourceId: "soma-mentoring-20260527-security",
    type: "MENTORING",
    title: "OAuth와 개인정보 보관 범위",
    mentorName: "박지훈 멘토",
    topic: "Security",
    description: "OAuth scope, token 저장, 비공식 서비스 고지 범위를 함께 점검합니다.",
    location: "부산센터 4층 회의실",
    startAt: "2026-05-27T14:00:00+09:00",
    endAt: "2026-05-27T15:00:00+09:00",
    applicationStartAt: "2026-05-20T10:00:00+09:00",
    applicationEndAt: "2026-05-26T18:00:00+09:00",
    capacity: 6,
    status: "OPEN",
    sourceUrl: "https://swmaestro.org",
    conflict: { hasConflict: false, busyBlocks: [] },
  },
];

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 180);
  });
}

function matchesType(type: SomaEventType | undefined, event: SomaEvent) {
  return !type || event.type === type;
}

export async function getSomaEvents(filter: SomaEventFilter = {}) {
  const events = somaEventMocks
    .filter((event) => matchesType(filter.type, event))
    .filter((event) => {
      if (!filter.from && !filter.to) {
        return true;
      }

      const start = new Date(event.startAt).getTime();
      const from = filter.from ? new Date(filter.from).getTime() : Number.NEGATIVE_INFINITY;
      const to = filter.to ? new Date(filter.to).getTime() : Number.POSITIVE_INFINITY;

      return start >= from && start <= to;
    })
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  return delay(events);
}

export async function getSomaEventById(eventId: string) {
  return delay(somaEventMocks.find((event) => event.id === eventId) ?? null);
}

export async function getDashboardEvents() {
  const events = await getSomaEvents();

  return {
    todayEvents: events.filter((event) => event.startAt.startsWith("2026-05-18")),
    upcomingEvents: events.slice(0, 3),
    deadlineSoonEvents: events.filter(
      (event) => event.applicationEndAt <= "2026-05-21T23:59:59+09:00",
    ),
    conflictedEvents: events.filter((event) => event.conflict.hasConflict),
  };
}
