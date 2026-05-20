"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { getGoogleLoginUrl, logoutSomaPortal } from "@/features/auth/api";
import { isPortalSessionExpired, usePortalAuthStore } from "@/features/auth/model";
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
            const returnTo = `${window.location.origin}${routes.googleLoginCallback}?next=${encodeURIComponent(routes.dashboard)}`;
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
        캘린더 권한은 사용자가 승인한 범위에서만 사용합니다.
      </p>
    </div>
  );
}

export function PortalSessionStatus() {
  const session = usePortalAuthStore((state) => state.session);
  const clearSession = usePortalAuthStore((state) => state.clearSession);

  if (!session || isPortalSessionExpired(session)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-44 truncate text-xs font-semibold text-muted-foreground sm:inline">
        {session.username}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          const sessionId = session.sessionId;

          clearSession();
          void logoutSomaPortal(sessionId);
          toast.success("로그아웃했어요.");
        }}
      >
        <LogOut aria-hidden="true" />
        로그아웃
      </Button>
    </div>
  );
}
