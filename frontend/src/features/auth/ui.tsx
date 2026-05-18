"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

const loginSchema = z.object({
  email: z.string().email("이메일 형식을 확인해 주세요."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function EmailLoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
    },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit((values) => {
        const parsed = loginSchema.safeParse(values);

        if (!parsed.success) {
          setError("email", {
            message: parsed.error.issues[0]?.message ?? "이메일을 확인해 주세요.",
          });
          return;
        }

        toast.success("로그인 mock이 완료됐어요.");
        router.push(routes.dashboard);
      })}
    >
      <div>
        <label className="text-sm font-semibold" htmlFor="email">
          이메일
        </label>
        <input
          className="mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/20"
          id="email"
          placeholder="you@example.com"
          type="email"
          {...register("email")}
        />
        {errors.email ? (
          <p className="mt-2 text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>
      <Button className="h-11 w-full" disabled={isSubmitting} type="submit">
        이메일로 시작하기
      </Button>
    </form>
  );
}
