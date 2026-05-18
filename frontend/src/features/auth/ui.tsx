"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { loginSomaPortal, logoutSomaPortal } from "@/features/auth/api";
import { isPortalSessionExpired, usePortalAuthStore } from "@/features/auth/model";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

const loginSchema = z.object({
  username: z.string().min(1, "포털 아이디를 입력해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function PortalLoginForm() {
  const router = useRouter();
  const setSession = usePortalAuthStore((state) => state.setSession);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit(async (values) => {
        const parsed = loginSchema.safeParse(values);

        if (!parsed.success) {
          const firstIssue = parsed.error.issues[0];

          setError(firstIssue?.path[0] === "password" ? "password" : "username", {
            message: parsed.error.issues[0]?.message ?? "이메일을 확인해 주세요.",
          });
          return;
        }

        try {
          const session = await loginSomaPortal(parsed.data);

          setSession(session);
          toast.success("SOMA 포털에 연결됐어요.");
          router.push(routes.dashboard);
        } catch (error) {
          setError("root", {
            message:
              error instanceof Error
                ? error.message
                : "로그인하지 못했습니다. 계정을 확인해 주세요.",
          });
        }
      })}
    >
      <div>
        <label className="text-sm font-semibold" htmlFor="username">
          SOMA 포털 아이디
        </label>
        <input
          className="mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/20"
          id="username"
          autoComplete="username"
          placeholder="zun_e@kakao.com"
          type="text"
          {...register("username")}
        />
        {errors.username ? (
          <p className="mt-2 text-sm text-destructive">{errors.username.message}</p>
        ) : null}
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="password">
          비밀번호
        </label>
        <input
          className="mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/20"
          id="password"
          autoComplete="current-password"
          placeholder="SOMA 포털 비밀번호"
          type="password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="mt-2 text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>
      {errors.root ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-destructive">
          {errors.root.message}
        </p>
      ) : null}
      <Button className="h-11 w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "로그인 중" : "SOMA 포털로 로그인"}
      </Button>
    </form>
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
          toast.success("포털 세션을 끊었어요.");
        }}
      >
        <LogOut aria-hidden="true" />
        로그아웃
      </Button>
    </div>
  );
}
