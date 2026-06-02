"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { Sparkles, WandSparkles, X } from "lucide-react";

import {
  INTEREST_TOPICS,
  type InterestTopicId,
  useInterestPreferenceStore,
} from "@/features/user-interests/model";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

const DISMISS_KEY = "somabiseo-interest-onboarding-dismissed";
const dismissListeners = new Set<() => void>();
const subscribeDismiss = (notify: () => void) => {
  dismissListeners.add(notify);
  return () => {
    dismissListeners.delete(notify);
  };
};
const getDismissSnapshot = () => window.sessionStorage.getItem(DISMISS_KEY) === "true";
const getDismissServerSnapshot = () => false;

const subscribeMounted = () => () => {};
const getMountedSnapshot = () => true;
const getMountedServerSnapshot = () => false;

export function InterestPreferencePanel() {
  const { selectedTopicIds, toggleTopic, clearTopics, isSaving } =
    useInterestPreferenceStore((state) => state);

  return (
    <div className="rounded-lg bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="size-5 text-primary" />
            <h2 className="text-[18px] font-bold leading-[27px]">관심사</h2>
          </div>
          <p className="mt-1 text-[14px] font-medium leading-[21px] text-muted-foreground">
            대시보드 추천과 목록 강조에 사용됩니다.
          </p>
        </div>
        {selectedTopicIds.length > 0 ? (
          <Button
            className="h-9 px-3 text-[14px]"
            disabled={isSaving}
            variant="ghost"
            onClick={clearTopics}
          >
            <X aria-hidden="true" />
            초기화
          </Button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {INTEREST_TOPICS.map((topic) => (
          <InterestChip
            key={topic.id}
            disabled={isSaving}
            selected={selectedTopicIds.includes(topic.id)}
            topicId={topic.id}
            onToggle={toggleTopic}
          >
            {topic.label}
          </InterestChip>
        ))}
      </div>
    </div>
  );
}

export function InterestOnboardingDialog() {
  const { selectedTopicIds, toggleTopic, clearTopics, isLoading, isSaving } =
    useInterestPreferenceStore((state) => state);
  const mounted = useSyncExternalStore(
    subscribeMounted,
    getMountedSnapshot,
    getMountedServerSnapshot,
  );
  const dismissed = useSyncExternalStore(
    subscribeDismiss,
    getDismissSnapshot,
    getDismissServerSnapshot,
  );
  const [typedText, setTypedText] = useState("");
  const shouldOpen =
    mounted && !isLoading && !dismissed && (selectedTopicIds.length === 0 || typedText.length > 0);
  const typingText = "요즘 끌리는 분야를 알려주면, 맞는 멘토링을 먼저 보여드릴게요.";

  useEffect(() => {
    if (!shouldOpen) {
      return;
    }

    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setTypedText(typingText.slice(0, index));

      if (index >= typingText.length) {
        window.clearInterval(intervalId);
      }
    }, 34);

    return () => window.clearInterval(intervalId);
  }, [shouldOpen, typingText]);

  const selectedLabels = useMemo(
    () =>
      INTEREST_TOPICS.filter((topic) => selectedTopicIds.includes(topic.id))
        .map((topic) => topic.label)
        .join(", "),
    [selectedTopicIds],
  );

  const closeForSession = () => {
    window.sessionStorage.setItem(DISMISS_KEY, "true");
    dismissListeners.forEach((notify) => {
      notify();
    });
  };

  if (!shouldOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="interest-onboarding-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#191f28]/35 px-4 py-4 backdrop-blur-sm sm:items-center"
      role="dialog"
    >
      <div className="sb-interest-dialog w-full max-w-[440px] overflow-hidden rounded-xl bg-white p-5 shadow-[0_24px_80px_rgb(25_31_40_/_22%)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex size-11 items-center justify-center rounded-xl bg-blue-50 text-primary">
              <WandSparkles aria-hidden="true" className="size-5" />
            </div>
            <h2 id="interest-onboarding-title" className="mt-4 text-[24px] font-bold leading-[34px]">
              관심사를 먼저 맞춰볼까요?
            </h2>
          </div>
          <button
            aria-label="관심사 설정 나중에 하기"
            className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            type="button"
            onClick={closeForSession}
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <p className="mt-3 min-h-[52px] text-[16px] font-medium leading-[26px] text-[#4e5968]">
          {typedText}
          <span className="sb-type-caret" aria-hidden="true" />
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {INTEREST_TOPICS.map((topic, index) => (
            <InterestChip
              key={topic.id}
              className="sb-interest-chip-in"
              disabled={isSaving}
              onToggle={toggleTopic}
              selected={selectedTopicIds.includes(topic.id)}
              style={{ animationDelay: `${index * 45}ms` }}
              topicId={topic.id}
            >
              {topic.label}
            </InterestChip>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <Button className="h-12 flex-1" variant="outline" onClick={closeForSession}>
            나중에
          </Button>
          <Button
            className="h-12 flex-[1.4]"
            disabled={selectedTopicIds.length === 0 || isSaving}
            onClick={closeForSession}
          >
            {selectedTopicIds.length === 0 ? "관심사 선택" : `${selectedLabels}로 시작`}
          </Button>
        </div>

        <button
          className="mt-3 w-full text-center text-[13px] font-semibold leading-[20px] text-muted-foreground"
          disabled={isSaving}
          type="button"
          onClick={clearTopics}
        >
          고른 관심사 다시 비우기
        </button>
      </div>
    </div>
  );
}

function InterestChip({
  children,
  className,
  disabled,
  onToggle,
  selected,
  style,
  topicId,
}: {
  children: string;
  className?: string;
  disabled?: boolean;
  onToggle: (topicId: InterestTopicId) => void;
  selected: boolean;
  style?: CSSProperties;
  topicId: InterestTopicId;
}) {
  return (
    <button
      aria-pressed={selected}
      className={cn(
        "min-h-10 rounded-full border px-4 text-[15px] font-semibold transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted text-[#4e5968] hover:bg-white",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
      disabled={disabled}
      style={style}
      type="button"
      onClick={() => onToggle(topicId)}
    >
      {children}
    </button>
  );
}
