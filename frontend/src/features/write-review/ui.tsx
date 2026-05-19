"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PenSquare } from "lucide-react";

import { usePortalAuthStore } from "@/features/auth/model";
import {
  useCreateReview,
  useWritableEvents,
  writeReviewSchema,
  type WriteReviewFormValues,
} from "@/features/write-review/model";
import type { WritableEvent } from "@/entities/review/model";
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
  preselectedEventId?: string;
  triggerLabel?: string;
  triggerClassName?: string;
};

export function WriteReviewDialog({
  preselectedEventId,
  triggerLabel = "후기 작성",
  triggerClassName,
}: WriteReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: writableEvents, isLoading, isError, refetch } = useWritableEvents(open);
  const session = usePortalAuthStore((state) => state.session);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName} size="sm" variant="default">
          <PenSquare aria-hidden="true" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>후기 작성</DialogTitle>
          <DialogDescription>
            종료 후 3일 이내의 강의에만 후기를 남길 수 있어요. 신청자 명단에서 본인 이름을 골라주세요.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-[14px] text-muted-foreground">강의 목록을 불러오는 중이에요.</p>
        ) : null}

        {isError ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] text-destructive">강의 목록을 불러오지 못했어요.</p>
            <Button onClick={() => void refetch()} size="sm" variant="ghost">
              다시
            </Button>
          </div>
        ) : null}

        {writableEvents && writableEvents.length === 0 ? (
          <p className="text-[14px] text-muted-foreground">
            지금은 후기를 남길 수 있는 강의가 없어요.
          </p>
        ) : null}

        {writableEvents && writableEvents.length > 0 ? (
          <WriteReviewForm
            events={writableEvents}
            preselectedEventId={preselectedEventId}
            sessionUsername={session?.username ?? null}
            onClose={() => setOpen(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function WriteReviewForm({
  events,
  preselectedEventId,
  sessionUsername,
  onClose,
}: {
  events: WritableEvent[];
  preselectedEventId?: string;
  sessionUsername: string | null;
  onClose: () => void;
}) {
  const initialEventId = useMemo(() => {
    if (preselectedEventId && events.some((event) => event.eventId === preselectedEventId)) {
      return preselectedEventId;
    }

    return events[0]?.eventId ?? "";
  }, [events, preselectedEventId]);

  const initialAuthor = useMemo(
    () => pickInitialAuthor(events, initialEventId, sessionUsername),
    [events, initialEventId, sessionUsername],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WriteReviewFormValues>({
    defaultValues: {
      eventId: initialEventId,
      authorName: initialAuthor,
      content: "",
    },
  });

  const selectedEventId = watch("eventId");
  const selectedEvent = events.find((event) => event.eventId === selectedEventId);
  const applicants = selectedEvent?.applicants ?? [];
  const contentValue = watch("content") ?? "";
  const contentLength = contentValue.length;

  const createMutation = useCreateReview();

  useEffect(() => {
    if (!selectedEvent) {
      return;
    }

    const matched = sessionUsername && selectedEvent.applicants.includes(sessionUsername)
      ? sessionUsername
      : selectedEvent.applicants[0] ?? "";

    setValue("authorName", matched);
  }, [selectedEventId, selectedEvent, sessionUsername, setValue]);

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
            eventId: parsed.data.eventId,
            input: {
              authorName: parsed.data.authorName,
              content: parsed.data.content.trim(),
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
        <label className="text-[14px] font-bold leading-[20px]" htmlFor="review-event">
          강의
        </label>
        <select
          id="review-event"
          className="sb-field mt-2"
          {...register("eventId")}
        >
          {events.map((event) => (
            <option key={event.eventId} value={event.eventId}>
              {event.title} · {event.mentorName ?? "멘토 미정"}
            </option>
          ))}
        </select>
        {errors.eventId ? (
          <p className="mt-1 text-[13px] text-destructive">{errors.eventId.message}</p>
        ) : null}
      </div>

      <div>
        <label className="text-[14px] font-bold leading-[20px]" htmlFor="review-author">
          이름 (신청자 명단)
        </label>
        <select
          id="review-author"
          className="sb-field mt-2"
          {...register("authorName")}
        >
          {applicants.length === 0 ? <option value="">명단이 비어 있어요</option> : null}
          {applicants.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
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
            applicants.length === 0
          }
        >
          {isSubmitting || createMutation.isPending ? "등록 중" : "등록"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function pickInitialAuthor(
  events: WritableEvent[],
  eventId: string,
  sessionUsername: string | null,
) {
  const event = events.find((item) => item.eventId === eventId);

  if (!event) {
    return "";
  }

  if (sessionUsername && event.applicants.includes(sessionUsername)) {
    return sessionUsername;
  }

  return event.applicants[0] ?? "";
}
