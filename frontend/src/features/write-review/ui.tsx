"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useAuthSessionQuery } from "@/features/auth/model";
import {
  useCreateReview,
  writeReviewSchema,
  type WriteReviewFormValues,
} from "@/features/write-review/model";
import { REVIEW_CONTENT_MAX, REVIEW_CONTENT_MIN } from "@/entities/review/model";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";

type WriteReviewDialogProps = {
  eventId: string;
  eventTitle?: string;
  triggerLabel?: string;
  triggerClassName?: string;
};

export function WriteReviewDialog({
  eventId,
  eventTitle,
  triggerLabel = "후기 작성",
  triggerClassName,
}: WriteReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const { session } = useAuthSessionQuery();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn("whitespace-nowrap", triggerClassName)}
          size="sm"
          variant="default"
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>후기 작성</DialogTitle>
          <DialogDescription>
            {eventTitle
              ? `'${eventTitle}' 강의에 대한 후기를 남겨주세요.`
              : "직접 수강한 강의에 대해서만 솔직한 후기를 남겨주세요."}
          </DialogDescription>
        </DialogHeader>

        <WriteReviewForm
          eventId={eventId}
          sessionUsername={session?.username ?? null}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function WriteReviewForm({
  eventId,
  sessionUsername,
  onClose,
}: {
  eventId: string;
  sessionUsername: string | null;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WriteReviewFormValues>({
    defaultValues: {
      authorName: sessionUsername ?? "",
      content: "",
      attended: false,
    },
  });

  const contentValue = watch("content") ?? "";
  const contentLength = contentValue.length;
  const authorName = watch("authorName") ?? "";
  const attended = watch("attended");

  const createMutation = useCreateReview();

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        const parsed = writeReviewSchema.safeParse(values);

        if (!parsed.success) {
          const issue = parsed.error.issues[0];

          if (issue) {
            setError(issue.path[0] as keyof WriteReviewFormValues, {
              message: issue.message,
            });
          }

          return;
        }

        try {
          await createMutation.mutateAsync({
            eventId,
            input: {
              authorName: parsed.data.authorName,
              content: parsed.data.content.trim(),
              attended: true,
            },
          });
          toast.success("후기를 등록했어요.");
          onClose();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "후기를 등록하지 못했어요.";

          toast.error(message);
        }
      })}
    >
      <div>
        <label className="text-[14px] font-bold leading-[20px]" htmlFor="review-author">
          이름
        </label>
        <input
          id="review-author"
          type="text"
          className="sb-field mt-2"
          placeholder="실명을 입력해 주세요"
          maxLength={100}
          {...register("authorName")}
        />
        {errors.authorName ? (
          <p className="mt-1 text-[13px] text-destructive">{errors.authorName.message}</p>
        ) : null}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <label className="text-[14px] font-bold leading-[20px]" htmlFor="review-content">
            후기 내용
          </label>
          <span
            className={cn(
              "text-[12px] font-semibold",
              contentLength < REVIEW_CONTENT_MIN || contentLength > REVIEW_CONTENT_MAX
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {contentLength}/{REVIEW_CONTENT_MAX}
          </span>
        </div>
        <textarea
          id="review-content"
          rows={6}
          maxLength={REVIEW_CONTENT_MAX + 50}
          placeholder={`최소 ${REVIEW_CONTENT_MIN}자, 최대 ${REVIEW_CONTENT_MAX}자`}
          className="sb-field mt-2 min-h-[140px] resize-y"
          {...register("content")}
        />
        {errors.content ? (
          <p className="mt-1 text-[13px] text-destructive">{errors.content.message}</p>
        ) : null}
      </div>

      <label className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-3 text-[13px] leading-[19px] text-foreground">
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-primary"
          {...register("attended")}
        />
        <span>
          이 강의를 직접 들었습니다.
          <span className="block text-[12px] font-semibold text-muted-foreground">
            허위 작성 시 책임은 본인에게 있어요.
          </span>
        </span>
      </label>
      {errors.attended ? (
        <p className="mt-1 text-[13px] text-destructive">{errors.attended.message}</p>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>
          취소
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            createMutation.isPending ||
            contentLength < REVIEW_CONTENT_MIN ||
            contentLength > REVIEW_CONTENT_MAX ||
            authorName.trim() === "" ||
            !attended
          }
        >
          {isSubmitting || createMutation.isPending ? "등록 중" : "등록"}
        </Button>
      </DialogFooter>
    </form>
  );
}
