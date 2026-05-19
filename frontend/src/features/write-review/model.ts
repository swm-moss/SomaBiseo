import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import {
  createReview,
  getWritableEvents,
  type CreateReviewInput,
} from "@/entities/review/api";
import { reviewKeys } from "@/entities/review/keys";
import { REVIEW_CONTENT_MAX, REVIEW_CONTENT_MIN } from "@/entities/review/model";

export const writeReviewSchema = z.object({
  eventId: z.string().min(1, "강의를 선택해 주세요."),
  authorName: z.string().min(1, "이름을 선택해 주세요."),
  content: z
    .string()
    .min(REVIEW_CONTENT_MIN, `최소 ${REVIEW_CONTENT_MIN}자 이상 작성해 주세요.`)
    .max(REVIEW_CONTENT_MAX, `최대 ${REVIEW_CONTENT_MAX}자까지 작성할 수 있어요.`),
});

export type WriteReviewFormValues = z.infer<typeof writeReviewSchema>;

export function useWritableEvents(enabled: boolean) {
  return useQuery({
    queryKey: reviewKeys.writable(),
    queryFn: getWritableEvents,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, input }: { eventId: string; input: CreateReviewInput }) =>
      createReview(eventId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;

          if (!Array.isArray(key) || key[0] !== "reviews") {
            return false;
          }

          if (key[1] === "list" && key[2] === variables.eventId) {
            return true;
          }

          return ["writable", "recent-events", "summaries"].includes(key[1] as string);
        },
      });
    },
  });
}
