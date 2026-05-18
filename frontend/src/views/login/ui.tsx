import { PortalLoginForm } from "@/features/auth/ui";
import { PRODUCT_NAME, PRODUCT_TAGLINE, NON_OFFICIAL_NOTICE } from "@/shared/constants/product";

export function LoginPage() {
  return (
    <main className="flex min-h-screen items-center bg-background px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <p className="text-sm font-bold text-primary">{PRODUCT_NAME}</p>
        <h1 className="mt-3 text-4xl font-black leading-tight">소마 생활을 정리해요.</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{PRODUCT_TAGLINE}</p>

        <div className="mt-8 rounded-lg border bg-white p-4">
          <PortalLoginForm />
        </div>

        <p className="mt-5 text-xs leading-5 text-muted-foreground">{NON_OFFICIAL_NOTICE}</p>
      </div>
    </main>
  );
}
