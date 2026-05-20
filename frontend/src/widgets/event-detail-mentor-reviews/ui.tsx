"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { getRelativePublishedAt } from "@/shared/lib/date";

type MentorReview = {
  id: number;
  eventTopic: string;
  content: string;
  authorName: string;
  createdAt: string;
};

const INITIAL_COUNT = 3;

// TODO(#34): mock 데이터. 백엔드 연동 시 useQuery + getReviewFeedByMentor 로 교체.
const MOCK_REVIEWS: MentorReview[] = [
  {
    id: 1,
    eventTopic: "프로덕션 레벨 LLM 서비스 아키텍처",
    content:
      "RAG 파이프라인을 구축할 때 자주 놓치는 비용/지연 트레이드오프를 실제 사례로 정리해 주셔서 도움이 많이 됐어요. 특히 캐싱 전략 부분이 인상적이었습니다.",
    authorName: "김연수",
    createdAt: "2026-05-12T10:00:00Z",
  },
  {
    id: 2,
    eventTopic: "사이드 프로젝트 기획부터 배포까지",
    content:
      "처음 사이드 프로젝트를 해보는 입장에서, 무엇부터 시작해야 할지 큰 그림을 잡아주셔서 좋았습니다. 멘토님의 실패 경험까지 솔직하게 공유해 주셔서 더 와닿았어요.",
    authorName: "이마에",
    createdAt: "2026-05-08T14:30:00Z",
  },
  {
    id: 3,
    eventTopic: "프로덕션 레벨 LLM 서비스 아키텍처",
    content:
      "질문 하나하나에 길게 답해 주셔서 한 시간이 어떻게 지나갔는지 모르겠어요. 다음 멘토링도 신청하고 싶습니다.",
    authorName: "박개발",
    createdAt: "2026-05-01T19:15:00Z",
  },
  {
    id: 4,
    eventTopic: "사이드 프로젝트 기획부터 배포까지",
    content:
      "기획-디자인-개발의 우선순위를 어떻게 잡아야 하는지 명확해졌습니다. 첫 미팅 전에 준비해 가면 좋은 자료까지 알려주셔서 감사합니다.",
    authorName: "최배포",
    createdAt: "2026-04-22T09:45:00Z",
  },
  {
    id: 5,
    eventTopic: "프로덕션 레벨 LLM 서비스 아키텍처",
    content:
      "이론보다 실제 운영에서 겪었던 장애 사례 위주로 풀어주셔서 좋았어요. 다음에는 비용 최적화만 따로 깊이 다뤄주시면 좋겠습니다.",
    authorName: "정데브",
    createdAt: "2026-04-15T20:00:00Z",
  },
];

export function EventDetailMentorReviews({
  mentorName,
}: {
  mentorName: string | null;
}) {
  const [expanded, setExpanded] = useState(false);

  const reviews = MOCK_REVIEWS;
  const visible = expanded ? reviews : reviews.slice(0, INITIAL_COUNT);
  const remaining = reviews.length - INITIAL_COUNT;
  const hasMore = remaining > 0;

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare aria-hidden="true" className="size-5 text-primary" />
          <h2 className="text-[20px] font-black leading-[29px]">
            멘토 후기
            {mentorName ? (
              <span className="ml-2 text-[15px] font-bold text-muted-foreground">
                {mentorName} 멘토
              </span>
            ) : null}
          </h2>
        </div>
        <span className="text-[13px] font-semibold text-muted-foreground">
          총 {reviews.length}개
        </span>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          className="mt-3"
          title="아직 등록된 후기가 없어요"
          description="이 멘토의 강의가 끝나면 연수생들이 후기를 남길 수 있어요."
        />
      ) : (
        <>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((review) => (
              <li
                key={review.id}
                className="flex h-full flex-col rounded-lg bg-white px-5 py-5"
              >
                <p className="text-[15px] font-extrabold leading-[22px] text-foreground">
                  {review.eventTopic}
                </p>
                <p className="mt-3 line-clamp-4 flex-1 text-[14px] leading-[22px] text-[#4e5968]">
                  {review.content}
                </p>
                <p className="mt-4 text-[13px] font-semibold text-muted-foreground">
                  {review.authorName}
                  <span aria-hidden="true" className="mx-1.5">
                    ·
                  </span>
                  {getRelativePublishedAt(review.createdAt)}
                </p>
              </li>
            ))}
          </ul>

          {hasMore ? (
            <div className="mt-4 flex justify-center">
              <Button
                className="w-full sm:w-auto"
                onClick={() => setExpanded((value) => !value)}
                variant="outline"
              >
                {expanded ? "접기" : `더보기 (+${remaining})`}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
