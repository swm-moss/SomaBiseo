"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { useAuthSessionQuery } from "@/features/auth/model";
import {
  useCreateReview,
  writeReviewSchema,
  type WriteReviewFormValues,
} from "@/features/write-review/model";
import { getEndedEvents } from "@/entities/review/api";
import { reviewKeys } from "@/entities/review/keys";
import {
  REVIEW_CONTENT_MAX,
  REVIEW_CONTENT_MIN,
  type EndedEvent,
} from "@/entities/review/model";
import type { SomaEventType } from "@/entities/soma-event/model";
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
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { StatusBadge } from "@/shared/ui/status-badge";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { cn } from "@/shared/lib/utils";

const TYPE_LABEL: Record<SomaEventType, string> = {
  LECTURE: "멘토특강",
  MENTORING: "자유멘토링",
};

type WriteReviewDialogProps = {
  eventId?: string;
  eventTitle?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerSize?: "default" | "sm" | "lg";
};

export function WriteReviewDialog({
  eventId,
  eventTitle,
  triggerLabel = "후기 작성",
  triggerClassName,
  triggerSize = "sm",
}: WriteReviewDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn("whitespace-nowrap", triggerClassName)}
          size={triggerSize}
          variant="default"
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {open ? (
          eventId ? (
            <FixedEventFlow
              eventId={eventId}
              eventTitle={eventTitle}
              onClose={() => setOpen(false)}
            />
          ) : (
            <PickerFlow onClose={() => setOpen(false)} />
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function FixedEventFlow({
  eventId,
  eventTitle,
  onClose,
}: {
  eventId: string;
  eventTitle?: string;
  onClose: () => void;
}) {
  const { session } = useAuthSessionQuery();

  return (
    <>
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
        onClose={onClose}
      />
    </>
  );
}

function PickerFlow({ onClose }: { onClose: () => void }) {
  const { session } = useAuthSessionQuery();
  const [selected, setSelected] = useState<EndedEvent | null>(null);

  if (!selected) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>어떤 강의의 후기인가요?</DialogTitle>
          <DialogDescription>
            끝난 강의 중에서 후기를 남길 강의를 선택해 주세요.
          </DialogDescription>
        </DialogHeader>
        <EventPicker onSelect={setSelected} />
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>후기 작성</DialogTitle>
        <DialogDescription>
          선택한 강의에 대한 솔직한 후기를 남겨주세요.
        </DialogDescription>
      </DialogHeader>
      <SelectedEventCard event={selected} onReset={() => setSelected(null)} />
      <WriteReviewForm
        key={selected.eventId}
        eventId={selected.eventId}
        sessionUsername={session?.username ?? null}
        onClose={onClose}
      />
    </>
  );
}

function EventPicker({ onSelect }: { onSelect: (event: EndedEvent) => void }) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: reviewKeys.endedEvents(null, debouncedSearch, null, 1),
    queryFn: () => getEndedEvents({ q: debouncedSearch, size: 8 }),
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          aria-label="끝난 강의 검색"
          className="sb-field h-11 w-full pl-10"
          placeholder="강의명·멘토명으로 검색"
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
      </div>
      <div className="max-h-[320px] overflow-y-auto rounded-xl border border-border/60 bg-white">
        {isLoading ? (
          <div className="p-6">
            <LoadingState />
          </div>
        ) : null}
        {isError ? (
          <div className="p-6">
            <ErrorState onRetry={() => void refetch()} />
          </div>
        ) : null}
        {data && data.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={
                debouncedSearch.length > 0
                  ? "조건에 맞는 강의가 없어요"
                  : "끝난 강의가 아직 없어요"
              }
              description={
                debouncedSearch.length > 0
                  ? "강의명이나 멘토명을 다시 입력해 보세요."
                  : "강의가 종료되면 후기를 남길 수 있어요."
              }
            />
          </div>
        ) : null}
        {data && data.items.length > 0 ? (
          <ul>
            {data.items.map((event, index) => (
              <li
                key={event.eventId}
                className={cn(index === 0 ? null : "border-t border-border/40")}
              >
                <button
                  type="button"
                  className="flex w-full flex-col items-start gap-1.5 px-4 py-3 text-left transition-colors hover:bg-muted"
                  onClick={() => onSelect(event)}
                >
                  <StatusBadge tone={event.type === "LECTURE" ? "blue" : "cyan"}>
                    {TYPE_LABEL[event.type]}
                  </StatusBadge>
                  <span className="text-[15px] font-bold leading-[22px] text-foreground">
                    {event.title}
                  </span>
                  <span className="text-[13px] font-semibold text-muted-foreground">
                    {event.mentorName ?? "멘토 미정"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function SelectedEventCard({
  event,
  onReset,
}: {
  event: EndedEvent;
  onReset: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <StatusBadge tone={event.type === "LECTURE" ? "blue" : "cyan"}>
            {TYPE_LABEL[event.type]}
          </StatusBadge>
          <p className="mt-2 text-[15px] font-bold leading-[22px] text-foreground">
            {event.title}
          </p>
          <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">
            {event.mentorName ?? "멘토 미정"}
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 text-[13px] font-bold text-primary hover:underline"
          onClick={onReset}
        >
          변경
        </button>
      </div>
    </div>
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
          className="sb-field mt-3 min-h-[140px] resize-y"
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
