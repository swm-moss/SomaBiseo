"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  editReviewSchema,
  useDeleteReview,
  useUpdateReview,
  type EditReviewFormValues,
} from "@/features/manage-review/model";
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

type ManageReviewActionsProps = {
  reviewId: number;
  initialContent: string;
};

export function ManageReviewActions({ reviewId, initialContent }: ManageReviewActionsProps) {
  return (
    <div className="flex items-center gap-2 text-[12px] font-bold">
      <EditReviewTrigger reviewId={reviewId} initialContent={initialContent} />
      <span aria-hidden="true" className="text-border">
        ·
      </span>
      <DeleteReviewTrigger reviewId={reviewId} />
    </div>
  );
}

function EditReviewTrigger({
  reviewId,
  initialContent,
}: {
  reviewId: number;
  initialContent: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          수정
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>후기 수정</DialogTitle>
          <DialogDescription>
            본인이 작성한 후기 내용을 수정합니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <EditReviewForm
            reviewId={reviewId}
            initialContent={initialContent}
            onClose={() => setOpen(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function EditReviewForm({
  reviewId,
  initialContent,
  onClose,
}: {
  reviewId: number;
  initialContent: string;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditReviewFormValues>({
    defaultValues: { content: initialContent },
  });

  const contentValue = watch("content") ?? "";
  const contentLength = contentValue.length;
  const updateMutation = useUpdateReview();

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        const parsed = editReviewSchema.safeParse(values);

        if (!parsed.success) {
          const issue = parsed.error.issues[0];

          if (issue) {
            setError("content", { message: issue.message });
          }

          return;
        }

        try {
          await updateMutation.mutateAsync({
            reviewId,
            content: parsed.data.content.trim(),
          });
          toast.success("후기를 수정했어요.");
          onClose();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "후기를 수정하지 못했어요.";

          toast.error(message);
        }
      })}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <label className="text-[14px] font-bold leading-[20px]" htmlFor="edit-review-content">
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
          id="edit-review-content"
          rows={6}
          maxLength={REVIEW_CONTENT_MAX + 50}
          placeholder={`최소 ${REVIEW_CONTENT_MIN}자, 최대 ${REVIEW_CONTENT_MAX}자`}
          className="sb-field mt-3 min-h-[140px] resize-y py-3"
          {...register("content")}
        />
        {errors.content ? (
          <p className="mt-1 text-[13px] text-destructive">{errors.content.message}</p>
        ) : null}
      </div>

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>
          취소
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            updateMutation.isPending ||
            contentLength < REVIEW_CONTENT_MIN ||
            contentLength > REVIEW_CONTENT_MAX
          }
        >
          {isSubmitting || updateMutation.isPending ? "저장 중" : "저장"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function DeleteReviewTrigger({ reviewId }: { reviewId: number }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteReview();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ reviewId });
      toast.success("후기를 삭제했어요.");
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "후기를 삭제하지 못했어요.";

      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-destructive hover:underline"
        >
          삭제
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>후기를 삭제할까요?</DialogTitle>
          <DialogDescription>
            삭제한 후기는 복구할 수 없어요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={deleteMutation.isPending}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "삭제 중" : "삭제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
