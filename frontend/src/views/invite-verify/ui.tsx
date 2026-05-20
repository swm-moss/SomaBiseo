"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { verifyInviteCode } from "@/features/auth/api";
import { authKeys, useAuthSessionQuery } from "@/features/auth/model";
import { PRODUCT_NAME } from "@/shared/constants/product";
import { routes } from "@/shared/config/routes";
import { ApiResponseError } from "@/shared/api/client";
import { Button } from "@/shared/ui/button";

export function InviteVerifyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { sessionId, session, isLoading, isAuthenticated } = useAuthSessionQuery();
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const next =
    typeof window === "undefined"
      ? routes.dashboard
      : safeNext(new URL(window.location.href).searchParams.get("next"));

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`${routes.login}?next=${encodeURIComponent(next)}`);
      return;
    }

    if (session?.inviteVerified) {
      router.replace(next);
    }
  }, [isAuthenticated, isLoading, next, router, session, sessionId]);

  const mutation = useMutation({
    mutationFn: () => verifyInviteCode(sessionId!, code),
    onSuccess: (verifiedSession) => {
      queryClient.setQueryData(authKeys.me(sessionId), verifiedSession);
      toast.success("초대 코드 인증이 완료됐어요.");
      router.replace(next);
    },
    onError: (error) => {
      const message =
        error instanceof ApiResponseError
          ? error.message
          : "초대 코드를 확인하지 못했어요.";

      setErrorMessage(message);
      toast.error(message);
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (code.length !== 6 || mutation.isPending || !sessionId) {
      return;
    }

    setErrorMessage(null);
    mutation.mutate();
  };

  return (
    <main className="flex min-h-screen items-center bg-background px-5 py-10">
      <section className="mx-auto w-full max-w-[420px]">
        <Image
          alt={PRODUCT_NAME}
          className="h-auto w-[164px] object-contain"
          height={240}
          priority
          src="/brand/somabiseo-logo.png"
          unoptimized
          width={720}
        />
        <div className="mt-8 rounded-xl bg-white p-5 shadow-[0_18px_48px_rgb(25_31_40_/_8%)]">
          <div className="inline-flex size-11 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <LockKeyhole aria-hidden="true" className="size-5" />
          </div>
          <h1 className="mt-4 text-[26px] font-bold leading-[36px]">소마 활동자 확인</h1>
          <p className="mt-2 text-[15px] font-medium leading-[23px] text-muted-foreground">
            부산센터 사무국에서 보낸 UPSTAGE 계정 가입 안내 문자를 확인해 주세요.
          </p>

          <div className="mt-5 rounded-lg bg-muted p-4">
            <p className="text-[13px] font-bold leading-[18px] text-foreground">찾을 문자</p>
            <div className="mt-3 space-y-2 text-[13px] font-medium leading-[20px] text-muted-foreground">
              <p>[Web발신] AI·SW마에스트로 부산센터 사무국입니다.</p>
              <p>제17기 부산센터 필수 참여 교육인 [AI 기술 교육] 참여를 위한 UPSTAGE 계정 가입을 요청드립니다.</p>
              <p>★반드시 5월 21일까지 가입 및 설문지 제출 필수★</p>
              <p className="font-semibold text-foreground">설문 링크 : docs.google.com/forms/...viewform?fbzx=문자 속 긴 숫자</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[13px] font-bold leading-[18px] text-foreground">입력할 부분</p>
            <div className="mt-2 overflow-hidden rounded-lg border border-blue-100 bg-blue-50">
              <div className="overflow-x-auto px-4 py-3 text-[13px] font-semibold leading-[24px] text-primary">
                <span className="whitespace-nowrap">예시: ...viewform?fbzx=123456789012</span>
                <span className="ml-1 inline-flex translate-y-[1px] items-center gap-0.5 rounded-md bg-primary px-2 py-1 text-white">
                  <span>345678</span>
                </span>
              </div>
              <div className="flex items-center gap-2 border-t border-blue-100 px-4 py-3 text-[13px] font-semibold text-primary">
                <ArrowDown aria-hidden="true" className="size-4" />
                위 숫자는 예시입니다. 실제 문자 속 설문 링크 맨 끝 6자리를 입력해 주세요.
              </div>
            </div>
          </div>

          <form className="mt-6" onSubmit={handleSubmit}>
            <label className="text-[14px] font-semibold leading-[20px]" htmlFor="invite-code">
              설문 링크 마지막 6자리
            </label>
            <input
              autoComplete="one-time-code"
              autoFocus
              className="mt-2 h-[58px] w-full rounded-lg border-0 bg-muted px-4 text-center text-[24px] font-bold tracking-[0.28em] text-foreground outline-none transition-colors placeholder:tracking-normal placeholder:text-muted-foreground focus:bg-white focus:ring-2 focus:ring-primary/20"
              id="invite-code"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              placeholder="6자리"
              value={code}
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                setErrorMessage(null);
              }}
            />
            {errorMessage ? (
              <p className="mt-2 text-[13px] font-semibold leading-[20px] text-destructive">
                {errorMessage}
              </p>
            ) : (
              <p className="mt-2 text-[13px] font-medium leading-[20px] text-muted-foreground">
                5회 연속 실패하면 잠시 입력이 제한됩니다.
              </p>
            )}
            <Button
              className="mt-5 h-[52px] w-full"
              disabled={code.length !== 6 || mutation.isPending || !sessionId}
              type="submit"
            >
              <ShieldCheck aria-hidden="true" />
              {mutation.isPending ? "확인 중" : "인증하고 시작하기"}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return routes.dashboard;
  }

  return value;
}
