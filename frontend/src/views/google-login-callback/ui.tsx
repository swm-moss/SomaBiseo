"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import type { AuthSession } from "@/features/auth/api";
import { authKeys, useAuthStore } from "@/features/auth/model";
import { useGoogleCalendarStore } from "@/features/connect-google-calendar/model";
import { PRODUCT_NAME } from "@/shared/constants/product";
import { routes } from "@/shared/config/routes";
import { LoadingState } from "@/shared/ui/loading-state";

export function GoogleLoginCallbackPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSessionId = useAuthStore((state) => state.setSessionId);
  const setConnection = useGoogleCalendarStore((state) => state.setConnection);

  useEffect(() => {
    const url = new URL(window.location.href);
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const error = fragment.get("error");
    const next = safeNext(url.searchParams.get("next"));

    if (error) {
      toast.error(error);
      router.replace(routes.login);
      return;
    }

    const sessionId = fragment.get("sessionId");
    const username = fragment.get("username");
    const email = fragment.get("email");
    const profileImageUrl = fragment.get("profileImageUrl");
    const expiresAt = fragment.get("expiresAt");

    if (!sessionId || !username || !email || !expiresAt) {
      toast.error("Google 로그인 정보를 확인하지 못했어요.");
      router.replace(routes.login);
      return;
    }

    const session: AuthSession = {
      sessionId,
      username,
      email,
      profileImageUrl: profileImageUrl || null,
      provider: "GOOGLE",
      expiresAt,
    };

    setSessionId(sessionId);
    queryClient.setQueryData(authKeys.me(sessionId), session);

    if (fragment.get("calendarConnected") === "true") {
      setConnection({
        connected: true,
        googleAccountEmail: email,
        calendarId: "primary",
      });
    }

    toast.success("Google 계정으로 로그인했어요.");
    router.replace(next);
  }, [queryClient, router, setConnection, setSessionId]);

  return (
    <main className="flex min-h-screen items-center bg-background px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <Image
          alt={PRODUCT_NAME}
          className="mx-auto h-auto w-[176px] object-contain"
          height={240}
          priority
          src="/brand/somabiseo-logo.png"
          unoptimized
          width={720}
        />
        <LoadingState className="mt-8" label="Google 로그인 처리 중" />
      </div>
    </main>
  );
}

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return routes.dashboard;
  }

  return value;
}
