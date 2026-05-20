"use client";

import { useState } from "react";
import { CalendarCheck, PlugZap, Unplug } from "lucide-react";
import { toast } from "sonner";

import { getGoogleCalendarConnectUrl } from "@/entities/calendar/api";
import { useGoogleCalendarStore } from "@/features/connect-google-calendar/model";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

export function ConnectGoogleCalendarPanel() {
  const [loading, setLoading] = useState(false);
  const connected = useGoogleCalendarStore((state) => state.connected);
  const email = useGoogleCalendarStore((state) => state.googleAccountEmail);
  const disconnect = useGoogleCalendarStore((state) => state.disconnect);

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
            onClick={() => {
              disconnect();
              toast.info("캘린더 연결을 해제했어요.");
            }}
          >
            <Unplug aria-hidden="true" />
            해제
          </Button>
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
        disabled={loading}
        onClick={async () => {
          try {
            setLoading(true);
            const returnTo = `${window.location.origin}${routes.googleLoginCallback}?next=${encodeURIComponent(routes.settings)}`;
            const { url } = await getGoogleCalendarConnectUrl(returnTo);

            window.location.href = url;
          } catch (error) {
            setLoading(false);
            toast.error(
              error instanceof Error
                ? error.message
                : "Google Calendar 연결을 시작하지 못했어요.",
            );
          }
        }}
      >
        <PlugZap aria-hidden="true" />
        {loading ? "Google로 이동 중" : "Google Calendar 연결"}
      </Button>
    </div>
  );
}
