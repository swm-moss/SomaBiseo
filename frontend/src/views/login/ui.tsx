"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { PortalLoginForm } from "@/features/auth/ui";
import { useAuthSessionQuery } from "@/features/auth/model";
import { routes } from "@/shared/config/routes";
import { PRODUCT_NAME, PRODUCT_TAGLINE, NON_OFFICIAL_NOTICE } from "@/shared/constants/product";

export function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isInviteVerified, isLoading } = useAuthSessionQuery();

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return;
    }

    const next = safeNext(new URL(window.location.href).searchParams.get("next"));

    if (!isInviteVerified) {
      router.replace(`${routes.inviteVerify}?next=${encodeURIComponent(next)}`);
      return;
    }

    router.replace(next);
  }, [isAuthenticated, isInviteVerified, isLoading, router]);

  return (
    <main className="flex min-h-screen items-center bg-background px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <Image
          alt={PRODUCT_NAME}
          className="h-auto w-[176px] object-contain"
          height={240}
          priority
          src="/brand/somabiseo-logo.png"
          unoptimized
          width={720}
        />
        <h1 className="mt-3 text-[30px] font-black leading-[40px]">소마 생활을 정리해요.</h1>
        <p className="mt-3 text-[17px] leading-[25.5px] text-muted-foreground">
          {PRODUCT_TAGLINE} 포털 비밀번호 없이 사용할 수 있어요.
        </p>

        <div className="mt-8 rounded-lg bg-white p-5">
          {isLoading ? (
            <p className="text-center text-[15px] font-semibold leading-[24px] text-muted-foreground">
              로그인 상태 확인 중
            </p>
          ) : (
            <PortalLoginForm />
          )}
        </div>

        <p className="mt-5 text-[13px] leading-[19.5px] text-muted-foreground">
          {NON_OFFICIAL_NOTICE}
        </p>
      </div>
    </main>
  );
}

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value === routes.login) {
    return routes.dashboard;
  }

  return value;
}
