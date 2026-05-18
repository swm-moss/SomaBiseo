import { PortalLoginForm } from "@/features/auth/ui";
import { PRODUCT_NAME, PRODUCT_TAGLINE, NON_OFFICIAL_NOTICE } from "@/shared/constants/product";

export function LoginPage() {
  return (
    <main className="flex min-h-screen items-center bg-background px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <p className="text-[15px] font-extrabold leading-[22px] text-primary">{PRODUCT_NAME}</p>
        <h1 className="mt-3 text-[30px] font-black leading-[40px]">소마 생활을 정리해요.</h1>
        <p className="mt-3 text-[17px] leading-[25.5px] text-muted-foreground">
          {PRODUCT_TAGLINE}
        </p>

        <div className="mt-8 rounded-lg bg-white p-5">
          <PortalLoginForm />
        </div>

        <p className="mt-5 text-[13px] leading-[19.5px] text-muted-foreground">
          {NON_OFFICIAL_NOTICE}
        </p>
      </div>
    </main>
  );
}
