"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, CalendarDays, PlugZap, Unplug } from "lucide-react";
import { toast } from "sonner";

import {
  disconnectGoogleCalendar,
  getGoogleCalendarConnectUrl,
  getGoogleCalendarConnection,
  getGoogleCalendarEvents,
} from "@/entities/calendar/api";
import { useGoogleCalendarStore } from "@/features/connect-google-calendar/model";
import { formatDateTime, formatTimeRange } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { LoadingState } from "@/shared/ui/loading-state";

function getDefaultEventRange() {
  const from = new Date();
  const to = new Date(from);

  to.setDate(from.getDate() + 7);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function ConnectGoogleCalendarPanel() {
  const queryClient = useQueryClient();
  const connected = useGoogleCalendarStore((state) => state.connected);
  const email = useGoogleCalendarStore((state) => state.googleAccountEmail);
  const setConnection = useGoogleCalendarStore((state) => state.setConnection);
  const range = useMemo(() => getDefaultEventRange(), []);
  const connectionQuery = useQuery({
    queryKey: ["google-calendar-connection"],
    queryFn: getGoogleCalendarConnection,
  });
  const eventsQuery = useQuery({
    queryKey: ["google-calendar-events", range.from, range.to],
    queryFn: () => getGoogleCalendarEvents(range.from, range.to),
    enabled: connected,
  });
  const connectMutation = useMutation({
    mutationFn: getGoogleCalendarConnectUrl,
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => {
      toast.error("캘린더 연결을 처리하지 못했어요.");
    },
  });
  const disconnectMutation = useMutation({
    mutationFn: disconnectGoogleCalendar,
    onSuccess: (connection) => {
      setConnection(connection);
      void queryClient.invalidateQueries({ queryKey: ["google-calendar-connection"] });
      void queryClient.removeQueries({ queryKey: ["google-calendar-events"] });
      toast.info("캘린더 연결을 해제했어요.");
    },
    onError: () => {
      toast.error("캘린더 연결 해제를 처리하지 못했어요.");
    },
  });

  useEffect(() => {
    if (connectionQuery.data) {
      setConnection(connectionQuery.data);
    }
  }, [connectionQuery.data, setConnection]);

  if (connected) {
    return (
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-start gap-3">
          <CalendarCheck aria-hidden="true" className="mt-0.5 size-5 text-emerald-600" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Google Calendar 연결됨</p>
            <p className="mt-1 truncate text-sm text-muted-foreground">{email}</p>
          </div>
          <Button
            className="shrink-0"
            size="sm"
            variant="outline"
            disabled={disconnectMutation.isPending}
            onClick={() => disconnectMutation.mutate()}
          >
            <Unplug aria-hidden="true" />
            해제
          </Button>
        </div>
        <div className="mt-5 border-t pt-4">
          <div className="flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="size-4 text-primary" />
            <p className="text-[15px] font-bold leading-[22px]">다가오는 Google Calendar 일정</p>
          </div>
          {eventsQuery.isLoading ? (
            <LoadingState className="mt-3 min-h-24 bg-muted/40" label="캘린더 일정 조회 중" />
          ) : null}
          {eventsQuery.isError ? (
            <ErrorState
              title="캘린더 일정을 불러오지 못했어요"
              description="연결 상태를 확인한 뒤 다시 시도해 주세요."
              onRetry={() => void eventsQuery.refetch()}
            />
          ) : null}
          {!eventsQuery.isLoading && !eventsQuery.isError && eventsQuery.data?.length === 0 ? (
            <EmptyState
              className="mt-3 bg-muted/40"
              title="다가오는 일정 없음"
              description="앞으로 7일 동안 조회된 Google Calendar 일정이 없습니다."
            />
          ) : null}
          {eventsQuery.data && eventsQuery.data.length > 0 ? (
            <div className="mt-3 divide-y divide-border/70">
              {eventsQuery.data.map((event) => (
                <div key={event.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-[15px] font-extrabold leading-[22px]">{event.title}</p>
                  <p className="mt-1 text-[13px] font-semibold leading-[19px] text-muted-foreground">
                    {formatDateTime(event.startAt)} · {formatTimeRange(event.startAt, event.endAt)}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="font-semibold">Google Calendar 연결</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        연결하면 특강과 멘토링이 기존 일정과 겹치는지 확인할 수 있어요.
      </p>
      <Button
        className="mt-4 h-11 w-full"
        disabled={connectMutation.isPending || connectionQuery.isLoading}
        onClick={() => connectMutation.mutate()}
      >
        <PlugZap aria-hidden="true" />
        Google Calendar 연결
      </Button>
    </div>
  );
}
