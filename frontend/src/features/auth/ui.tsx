"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { getGoogleLoginUrl, logoutGoogleSession } from "@/features/auth/api";
import { authKeys, useAuthSessionQuery, useAuthStore } from "@/features/auth/model";
import { useGoogleCalendarStore } from "@/features/connect-google-calendar/model";
import { ApiResponseError } from "@/shared/api/client";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

export function PortalLoginForm() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        className="h-[52px] w-full bg-foreground text-background hover:bg-foreground/90"
        disabled={loading}
        type="button"
        onClick={async () => {
          try {
            setLoading(true);
            const next = safeNext(new URL(window.location.href).searchParams.get("next"));
            const returnTo = `${window.location.origin}${routes.googleLoginCallback}?next=${encodeURIComponent(next)}`;
            const { url } = await getGoogleLoginUrl(returnTo);

            window.location.href = url;
          } catch (error) {
            setLoading(false);
            toast.error(
              error instanceof Error
                ? error.message
                : "Google 로그인을 시작하지 못했어요.",
            );
          }
        }}
      >
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-white text-[15px] font-bold text-foreground">
          G
        </span>
        {loading ? "Google로 이동 중" : "Google로 계속하기"}
      </Button>
      <p className="text-[13px] font-medium leading-[20px] text-muted-foreground">
        SOMA 포털 아이디와 비밀번호는 받지 않습니다. Google 계정으로 로그인하고
        첫 로그인에는 문자로 공유된 초대 코드만 한 번 확인합니다.
      </p>
    </div>
  );
}

export function InviteVerificationGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { sessionId, session, isLoading, isAuthenticated } = useAuthSessionQuery();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const next = encodeURIComponent(pathname || routes.dashboard);

    if (!sessionId || !isAuthenticated) {
      router.replace(`${routes.login}?next=${next}`);
      return;
    }

    if (session && !session.inviteVerified) {
      router.replace(`${routes.inviteVerify}?next=${next}`);
    }
  }, [isAuthenticated, isLoading, pathname, router, session, sessionId]);

  if (isLoading || !sessionId || !isAuthenticated || !session?.inviteVerified) {
    return (
      <main className="flex min-h-screen items-center bg-background px-5 py-10">
        <div className="mx-auto w-full max-w-sm">
          <p className="text-center text-[15px] font-semibold text-muted-foreground">
            접근 권한 확인 중
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

export function PortalSessionStatus() {
  const queryClient = useQueryClient();
  const { error, session, sessionId, isLoading } = useAuthSessionQuery();
  const clearSessionId = useAuthStore((state) => state.clearSessionId);
  const calendarConnected = useGoogleCalendarStore((state) => state.connected);
  const disconnectCalendar = useGoogleCalendarStore((state) => state.disconnect);

  useEffect(() => {
    if (!sessionId && calendarConnected) {
      disconnectCalendar();
      return;
    }

    if (error instanceof ApiResponseError && error.status === 401) {
      disconnectCalendar();
      queryClient.removeQueries({ queryKey: authKeys.all });
    }
  }, [calendarConnected, disconnectCalendar, error, queryClient, sessionId]);

  if (!sessionId) {
    return null;
  }

  if (isLoading) {
    return <div className="hidden h-8 w-28 rounded-full bg-muted sm:block" />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {session.profileImageUrl ? (
        <span
          aria-hidden="true"
          className="hidden size-7 rounded-full bg-cover bg-center sm:block"
          style={{ backgroundImage: `url(${session.profileImageUrl})` }}
        />
      ) : null}
      <span className="hidden max-w-44 truncate text-xs font-semibold text-muted-foreground sm:inline">
        {session.username}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={async () => {
          try {
            await logoutGoogleSession(session.sessionId);
          } catch {
            // 서버 세션이 이미 만료된 경우도 사용자 입장에서는 로그아웃 완료로 처리합니다.
          } finally {
            clearSessionId();
            disconnectCalendar();
            queryClient.removeQueries({ queryKey: authKeys.all });
            toast.success("로그아웃했어요.");
          }
        }}
      >
        <LogOut aria-hidden="true" />
        로그아웃
      </Button>
    </div>
  );
}

export function DashboardGreeting() {
  const { session } = useAuthSessionQuery();

  return <>안녕하세요{session?.username ? `, ${session.username}님` : ""}</>;
}

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return routes.dashboard;
  }

  return value;
}
