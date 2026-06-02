import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

import { BottomNavigation } from "@/widgets/bottom-navigation/ui";
import { MainNavigation } from "@/widgets/app-shell/main-navigation";
import { InviteVerificationGate, PortalSessionStatus } from "@/features/auth/ui";
import { InterestOnboardingDialog } from "@/features/user-interests/ui";
import { NON_OFFICIAL_NOTICE, PRODUCT_NAME } from "@/shared/constants/product";
import { routes } from "@/shared/config/routes";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <InviteVerificationGate>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center gap-5 px-5 sm:px-6 lg:px-8">
            <Link
              aria-label={`${PRODUCT_NAME} 랜딩페이지로 이동`}
              className="flex min-w-0 shrink-0 items-center gap-2"
              href={routes.home}
            >
              <Image
                alt=""
                aria-hidden="true"
                className="size-8 shrink-0 rounded-md"
                height={32}
                src="/brand/somabiseo-icon-64.png"
                unoptimized
                width={32}
              />
              <Image
                alt={PRODUCT_NAME}
                className="h-auto w-[86px] object-contain sm:w-[96px]"
                height={240}
                priority
                src="/brand/somabiseo-logo.png"
                unoptimized
                width={720}
              />
            </Link>
            <MainNavigation />
            <div className="ml-auto flex shrink-0 items-center">
              <PortalSessionStatus />
            </div>
          </div>
        </header>
        <div className="border-b border-border/70 bg-[#eaf3ff] px-5 py-2 text-center text-[12px] font-semibold leading-[18px] text-primary">
          {NON_OFFICIAL_NOTICE}
        </div>
        {children}
        <InterestOnboardingDialog />
        <BottomNavigation />
      </div>
    </InviteVerificationGate>
  );
}
