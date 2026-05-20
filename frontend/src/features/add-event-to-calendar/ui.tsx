"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Check } from "lucide-react";
import { toast } from "sonner";

import { addEventToGoogleCalendar, getGoogleCalendarEventLink } from "@/entities/calendar/api";
import type { SomaEvent } from "@/entities/soma-event/model";
import { useGoogleCalendarStore } from "@/features/connect-google-calendar/model";
import { Button } from "@/shared/ui/button";

export function AddEventToCalendarButton({ event }: { event: SomaEvent }) {
  const queryClient = useQueryClient();
  const connected = useGoogleCalendarStore((state) => state.connected);
  const linkQueryKey = ["google-calendar-event-link", event.id];
  const { data: eventLink } = useQuery({
    queryKey: linkQueryKey,
    queryFn: () => getGoogleCalendarEventLink(event),
    enabled: connected,
  });
  const isAdded = eventLink?.alreadyAdded ?? false;
  const addMutation = useMutation({
    mutationFn: () => addEventToGoogleCalendar(event),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: linkQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["google-calendar-events"] });
      toast.success(response.alreadyAdded ? "이미 캘린더에 추가된 일정입니다." : "내 캘린더에 일정을 추가했어요.");
    },
    onError: () => {
      toast.error("캘린더에 일정을 추가하지 못했어요.");
    },
  });

  return (
    <Button
      className="h-11 w-full"
      disabled={isAdded || addMutation.isPending}
      variant={isAdded ? "secondary" : "default"}
      onClick={() => {
        if (!connected) {
          toast.error("Google Calendar를 먼저 연결해 주세요.");
          return;
        }

        if (!event.startAt || !event.endAt) {
          toast.error("일정 시간이 확인되지 않아 캘린더에 추가할 수 없어요.");
          return;
        }

        addMutation.mutate();
      }}
    >
      {isAdded ? <Check aria-hidden="true" /> : <CalendarPlus aria-hidden="true" />}
      {isAdded ? "캘린더 추가됨" : addMutation.isPending ? "추가 중" : "내 캘린더에 추가"}
    </Button>
  );
}
