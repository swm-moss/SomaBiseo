import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { deleteReview, updateReview } from "@/entities/review/api";
import { REVIEW_CONTENT_MAX, REVIEW_CONTENT_MIN } from "@/entities/review/model";

export const editReviewSchema = z.object({
  content: z
    .string()
    .min(REVIEW_CONTENT_MIN, `최소 ${REVIEW_CONTENT_MIN}자 이상 작성해 주세요.`)
    .max(REVIEW_CONTENT_MAX, `최대 ${REVIEW_CONTENT_MAX}자까지 작성할 수 있어요.`),
});

export type EditReviewFormValues = z.infer<typeof editReviewSchema>;

function invalidateReviewQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;

      if (!Array.isArray(key) || key[0] !== "reviews") {
        return false;
      }

      return key[1] === "feed" || key[1] === "ended-events";
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, content }: { reviewId: number; content: string }) =>
      updateReview(reviewId, content),
    onSuccess: () => invalidateReviewQueries(queryClient),
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId }: { reviewId: number }) => deleteReview(reviewId),
    onSuccess: () => invalidateReviewQueries(queryClient),
  });
}
