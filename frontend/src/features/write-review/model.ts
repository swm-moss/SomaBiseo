import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import {
  createReview,
  getRecentEndedEvents,
  type CreateReviewInput,
} from "@/entities/review/api";
import { reviewKeys } from "@/entities/review/keys";
import { REVIEW_CONTENT_MAX, REVIEW_CONTENT_MIN } from "@/entities/review/model";

const WRITABLE_LIMIT = 100;

export const writeReviewSchema = z.object({
  eventId: z.string().min(1, "강의를 선택해 주세요."),
  authorName: z
    .string()
    .trim()
    .min(1, "이름을 입력해 주세요.")
    .max(100, "이름은 100자 이내로 입력해 주세요."),
  content: z
    .string()
    .min(REVIEW_CONTENT_MIN, `최소 ${REVIEW_CONTENT_MIN}자 이상 작성해 주세요.`)
    .max(REVIEW_CONTENT_MAX, `최대 ${REVIEW_CONTENT_MAX}자까지 작성할 수 있어요.`),
  attended: z
    .boolean()
    .refine((value) => value === true, "이 강의를 직접 들었음을 확인해 주세요."),
});

export type WriteReviewFormValues = z.infer<typeof writeReviewSchema>;

export function useWritableEventsForReview(enabled: boolean) {
  return useQuery({
    queryKey: reviewKeys.recentEvents(WRITABLE_LIMIT),
    queryFn: () => getRecentEndedEvents(WRITABLE_LIMIT),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, input }: { eventId: string; input: CreateReviewInput }) =>
      createReview(eventId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;

          if (!Array.isArray(key) || key[0] !== "reviews") {
            return false;
          }

          return key[1] === "feed" || key[1] === "recent-events";
        },
      });
    },
  });
}
