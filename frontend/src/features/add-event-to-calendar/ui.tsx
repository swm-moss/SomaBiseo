"use client";

import { CalendarPlus, Check } from "lucide-react";
import { toast } from "sonner";

import type { SomaEvent } from "@/entities/soma-event/model";
import { useGoogleCalendarStore } from "@/features/connect-google-calendar/model";
import { Button } from "@/shared/ui/button";

export function AddEventToCalendarButton({ event }: { event: SomaEvent }) {
  const connected = useGoogleCalendarStore((state) => state.connected);
  const addedEventIds = useGoogleCalendarStore((state) => state.addedEventIds);
  const markEventAdded = useGoogleCalendarStore((state) => state.markEventAdded);
  const isAdded = addedEventIds.includes(event.id);

  return (
    <Button
      className="h-11 w-full"
      disabled={isAdded}
      variant={isAdded ? "secondary" : "default"}
      onClick={() => {
        if (!connected) {
          toast.error("Google Calendar를 먼저 연결해 주세요.");
          return;
        }

        markEventAdded(event.id);
        toast.success("내 캘린더에 일정을 추가했어요.");
      }}
    >
      {isAdded ? <Check aria-hidden="true" /> : <CalendarPlus aria-hidden="true" />}
      {isAdded ? "캘린더 추가됨" : "내 캘린더에 추가"}
    </Button>
  );
}
