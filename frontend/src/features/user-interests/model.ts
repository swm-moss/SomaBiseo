import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SomaEvent } from "@/entities/soma-event/model";

export type InterestTopicId =
  | "ai"
  | "frontend"
  | "backend"
  | "security"
  | "devops"
  | "data"
  | "product"
  | "mobile";

type InterestTopic = {
  id: InterestTopicId;
  label: string;
  keywords: string[];
};

export type EventRecommendation = {
  isRecommended: boolean;
  score: number;
  matchedTopics: InterestTopic[];
};

export const INTEREST_TOPICS: InterestTopic[] = [
  {
    id: "ai",
    label: "AI",
    keywords: ["ai", "인공지능", "llm", "agent", "에이전트", "rag", "prompt", "프롬프트", "모델", "머신러닝", "딥러닝"],
  },
  {
    id: "frontend",
    label: "프론트엔드",
    keywords: ["frontend", "프론트", "react", "next", "ui", "ux", "css", "typescript", "javascript", "웹"],
  },
  {
    id: "backend",
    label: "백엔드",
    keywords: ["backend", "백엔드", "spring", "java", "api", "서버", "database", "db", "postgres", "msa"],
  },
  {
    id: "security",
    label: "보안",
    keywords: ["security", "보안", "인증", "인가", "oauth", "jwt", "해킹", "취약점", "권한"],
  },
  {
    id: "devops",
    label: "DevOps",
    keywords: ["devops", "ci/cd", "cicd", "배포", "운영", "docker", "kubernetes", "nginx", "cloud", "aws", "자동화"],
  },
  {
    id: "data",
    label: "데이터",
    keywords: ["data", "데이터", "분석", "analytics", "sql", "pipeline", "파이프라인", "embedding", "vector"],
  },
  {
    id: "product",
    label: "기획/프로덕트",
    keywords: ["product", "프로덕트", "기획", "pm", "사용자", "growth", "그로스", "창업", "비즈니스"],
  },
  {
    id: "mobile",
    label: "모바일",
    keywords: ["mobile", "모바일", "ios", "android", "swift", "kotlin", "flutter", "react native"],
  },
];

type InterestPreferenceState = {
  selectedTopicIds: InterestTopicId[];
  toggleTopic: (topicId: InterestTopicId) => void;
  clearTopics: () => void;
};

export const useInterestPreferenceStore = create<InterestPreferenceState>()(
  persist(
    (set) => ({
      selectedTopicIds: [],
      toggleTopic: (topicId) =>
        set((state) => ({
          selectedTopicIds: state.selectedTopicIds.includes(topicId)
            ? state.selectedTopicIds.filter((selectedTopicId) => selectedTopicId !== topicId)
            : [...state.selectedTopicIds, topicId],
        })),
      clearTopics: () => set({ selectedTopicIds: [] }),
    }),
    {
      name: "somabiseo-interest-preferences",
    },
  ),
);

export function getEventRecommendation(
  event: SomaEvent,
  selectedTopicIds: InterestTopicId[],
  referenceDate = new Date(),
): EventRecommendation {
  if (selectedTopicIds.length === 0 || !isEventActiveAt(event, referenceDate)) {
    return { isRecommended: false, score: 0, matchedTopics: [] };
  }

  const selectedTopics = INTEREST_TOPICS.filter((topic) => selectedTopicIds.includes(topic.id));
  const titleText = normalizeText([event.title, event.topic].join(" "));
  const fullText = normalizeText([
    event.title,
    event.topic,
    event.mentorName ?? "",
    event.location ?? "",
    event.description,
    event.contentText ?? "",
    event.rawText,
  ].join(" "));
  let score = 0;
  const matchedTopics: InterestTopic[] = [];

  for (const topic of selectedTopics) {
    const titleMatches = countKeywordMatches(titleText, topic.keywords);
    const fullMatches = countKeywordMatches(fullText, topic.keywords);

    if (fullMatches === 0) {
      continue;
    }

    matchedTopics.push(topic);
    score += Math.min(fullMatches, 4) + titleMatches * 2;
  }

  return {
    isRecommended: score >= 2,
    score,
    matchedTopics,
  };
}

export function getRecommendedEvents(
  events: SomaEvent[],
  selectedTopicIds: InterestTopicId[],
  limit: number,
  referenceDate = new Date(),
) {
  return events
    .filter((event) => isEventActiveAt(event, referenceDate))
    .map((event) => ({
      event,
      recommendation: getEventRecommendation(event, selectedTopicIds, referenceDate),
    }))
    .filter(({ recommendation }) => recommendation.isRecommended)
    .sort((left, right) => {
      if (right.recommendation.score !== left.recommendation.score) {
        return right.recommendation.score - left.recommendation.score;
      }

      const leftTime = left.event.startAt ? new Date(left.event.startAt).getTime() : Number.POSITIVE_INFINITY;
      const rightTime = right.event.startAt ? new Date(right.event.startAt).getTime() : Number.POSITIVE_INFINITY;

      return leftTime - rightTime;
    })
    .slice(0, limit);
}

export function isEventActiveAt(event: SomaEvent, referenceDate = new Date()) {
  const referenceTime = referenceDate.getTime();
  const endTime = toTime(event.endAt);

  if (endTime != null) {
    return endTime >= referenceTime;
  }

  const startTime = toTime(event.startAt);

  return startTime != null && startTime >= referenceTime;
}

function toTime(value: string | null) {
  if (!value) {
    return null;
  }

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? null : time;
}

function countKeywordMatches(text: string, keywords: string[]) {
  return keywords.reduce((count, keyword) => {
    const normalizedKeyword = normalizeText(keyword);

    return normalizedKeyword && text.includes(normalizedKeyword) ? count + 1 : count;
  }, 0);
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}
