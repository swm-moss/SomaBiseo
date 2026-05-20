"use client";

import { CalendarCheck } from "lucide-react";

import { useAuthSessionQuery } from "@/features/auth/model";
import {
  useGoogleCalendarConnectionSync,
  useGoogleCalendarStore,
} from "@/features/connect-google-calendar/model";

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
        </div>
      </div>
    </div>
  );
}
