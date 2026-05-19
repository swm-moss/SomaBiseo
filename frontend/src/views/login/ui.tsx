import Image from "next/image";

import { PortalLoginForm } from "@/features/auth/ui";
import { PRODUCT_NAME, PRODUCT_TAGLINE, NON_OFFICIAL_NOTICE } from "@/shared/constants/product";

export function LoginPage() {
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
        <h1 className="mt-3 text-[30px] font-bold leading-[40px]">소마 생활을 정리해요.</h1>
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
