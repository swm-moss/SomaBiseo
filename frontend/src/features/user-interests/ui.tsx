"use client";

import { Sparkles, X } from "lucide-react";

import {
  INTEREST_TOPICS,
  type InterestTopicId,
  useInterestPreferenceStore,
} from "@/features/user-interests/model";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

export function InterestPreferencePanel() {
  const selectedTopicIds = useInterestPreferenceStore((state) => state.selectedTopicIds);
  const toggleTopic = useInterestPreferenceStore((state) => state.toggleTopic);
  const clearTopics = useInterestPreferenceStore((state) => state.clearTopics);

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
          <Button className="h-9 px-3 text-[14px]" variant="ghost" onClick={clearTopics}>
            <X aria-hidden="true" />
            초기화
          </Button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {INTEREST_TOPICS.map((topic) => (
          <InterestChip
            key={topic.id}
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

function InterestChip({
  children,
  onToggle,
  selected,
  topicId,
}: {
  children: string;
  onToggle: (topicId: InterestTopicId) => void;
  selected: boolean;
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
      )}
      type="button"
      onClick={() => onToggle(topicId)}
    >
      {children}
    </button>
  );
}
