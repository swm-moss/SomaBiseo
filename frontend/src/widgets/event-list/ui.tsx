"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getSomaEvents } from "@/entities/soma-event/api";
import type { SomaEventType } from "@/entities/soma-event/model";
import { UpcomingEventCard } from "@/widgets/upcoming-event-card/ui";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";
import { SegmentControl } from "@/shared/ui/segment-control";

type EventTab = "ALL" | SomaEventType;

const options = [
  { label: "전체", value: "ALL" },
  { label: "멘토특강", value: "LECTURE" },
  { label: "자유멘토링", value: "MENTORING" },
] satisfies { label: string; value: EventTab }[];

export function EventList() {
  const [tab, setTab] = useState<EventTab>("ALL");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["events", tab],
    queryFn: () => getSomaEvents({ type: tab === "ALL" ? undefined : tab }),
  });

  return (
    <section className="sb-section">
      <SegmentControl options={options} value={tab} onValueChange={setTab} />
      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
      {data?.length === 0 ? (
        <EmptyState title="일정이 없어요" description="조건에 맞는 특강이나 멘토링이 없습니다." />
      ) : null}
      {data && data.length > 0 ? (
        <div className="mt-3 rounded-lg bg-white px-4">
          {data.map((event) => (
            <UpcomingEventCard key={event.id} event={event} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
