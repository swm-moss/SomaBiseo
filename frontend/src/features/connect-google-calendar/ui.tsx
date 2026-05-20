"use client";

import { useState } from "react";
import { CalendarCheck } from "lucide-react";
import { toast } from "sonner";

import { getGoogleCalendarConnectUrl } from "@/entities/calendar/api";
import { useAuthSessionQuery } from "@/features/auth/model";
import {
  useGoogleCalendarConnectionSync,
  useGoogleCalendarStore,
} from "@/features/connect-google-calendar/model";
import { Button } from "@/shared/ui/button";

export function ConnectGoogleCalendarPanel() {
  const { session } = useAuthSessionQuery();
  useGoogleCalendarConnectionSync();
  const connected = useGoogleCalendarStore((state) => state.connected);
  const email = useGoogleCalendarStore((state) => state.googleAccountEmail) ?? session?.email;

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-start gap-3">
        <CalendarCheck
          aria-hidden="true"
          className={connected ? "mt-0.5 size-5 text-emerald-600" : "mt-0.5 size-5 text-muted-foreground"}
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {connected ? "Google Calendar 연결됨" : "Google 로그인이 필요합니다"}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {connected
              ? "Google 로그인 권한으로 캘린더 일정 조회와 충돌 확인을 사용할 수 있어요."
              : "Google로 로그인하면 캘린더 권한도 함께 승인됩니다."}
          </p>
          {email ? <p className="mt-1 truncate text-sm text-muted-foreground">{email}</p> : null}
          {!connected ? <GoogleCalendarConnectButton className="mt-4" /> : null}
        </div>
      </div>
    </div>
  );
}

export function GoogleCalendarConnectButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className={className}
      disabled={loading}
      size="sm"
      type="button"
      onClick={async () => {
        try {
          setLoading(true);
          const returnTo = `${window.location.origin}${window.location.pathname}`;
          const { url } = await getGoogleCalendarConnectUrl(returnTo);

          window.location.href = url;
        } catch (error) {
          setLoading(false);
          toast.error(
            error instanceof Error
              ? error.message
              : "캘린더 연동을 시작하지 못했어요.",
          );
        }
      }}
    >
      <CalendarCheck aria-hidden="true" />
      {loading ? "Google로 이동 중" : "캘린더 연동하기"}
    </Button>
  );
}
