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
  email: z.string().email("이메일 형식으로 입력해 주세요."),
  name: z.string().min(1, "이름을 입력해 주세요."),
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
      email: "",
      name: "",
    },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit(async (values) => {
        const parsed = loginSchema.safeParse(values);

        if (!parsed.success) {
          const firstIssue = parsed.error.issues[0];

          setError(firstIssue?.path[0] === "name" ? "name" : "email", {
            message: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.",
          });
          return;
        }

        try {
          const session = await loginSomaPortal(parsed.data);

          setSession(session);
          toast.success("SomaBiseo에 로그인했어요.");
          router.push(routes.dashboard);
        } catch (error) {
          setError("root", {
            message:
              error instanceof Error
                ? error.message
                : "로그인하지 못했습니다. 입력값을 확인해 주세요.",
          });
        }
      })}
    >
      <div>
        <label className="text-[15px] font-bold leading-[22px]" htmlFor="email">
          이메일
        </label>
        <input
          className="sb-field"
          id="email"
          autoComplete="email"
          placeholder="you@example.com"
          type="email"
          {...register("email")}
        />
        {errors.email ? (
          <p className="mt-2 text-[14px] font-semibold leading-[21px] text-destructive">
            {errors.email.message}
          </p>
        ) : null}
      </div>
      <div>
        <label className="text-[15px] font-bold leading-[22px]" htmlFor="name">
          이름
        </label>
        <input
          className="sb-field"
          id="name"
          autoComplete="name"
          placeholder="소마비서"
          type="text"
          {...register("name")}
        />
        {errors.name ? (
          <p className="mt-2 text-[14px] font-semibold leading-[21px] text-destructive">
            {errors.name.message}
          </p>
        ) : null}
      </div>
      {errors.root ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-[14px] font-semibold leading-[21px] text-destructive">
          {errors.root.message}
        </p>
      ) : null}
      <Button className="mt-5 h-[52px] w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "로그인 중" : "SomaBiseo 시작하기"}
      </Button>
      <p className="mt-3 text-[13px] font-medium leading-[20px] text-muted-foreground">
        SOMA 포털 아이디와 비밀번호는 받지 않습니다.
      </p>
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
          toast.success("로그아웃했어요.");
        }}
      >
        <LogOut aria-hidden="true" />
        로그아웃
      </Button>
    </div>
  );
}
