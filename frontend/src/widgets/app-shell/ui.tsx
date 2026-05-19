import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

import { BottomNavigation } from "@/widgets/bottom-navigation/ui";
import { PortalSessionStatus } from "@/features/auth/ui";
import { NON_OFFICIAL_NOTICE, PRODUCT_NAME } from "@/shared/constants/product";
import { routes } from "@/shared/config/routes";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-white/95 backdrop-blur">
        <div className="mx-auto grid h-16 w-full max-w-[1120px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 sm:px-6 lg:gap-5 lg:px-8">
          <Link
            aria-label={`${PRODUCT_NAME} 대시보드로 이동`}
            className="flex w-10 shrink-0 items-center gap-2 xl:w-[138px]"
            href={routes.dashboard}
          >
            <Image
              alt=""
              aria-hidden="true"
              className="size-10 shrink-0 rounded-lg"
              height={32}
              src="/brand/somabiseo-icon-64.png"
              unoptimized
              width={32}
            />
            <Image
              alt={PRODUCT_NAME}
              className="hidden h-auto w-[90px] shrink-0 object-contain xl:block"
              height={240}
              priority
              src="/brand/somabiseo-logo.png"
              unoptimized
              width={720}
            />
          </Link>
          <nav className="hidden min-w-0 items-center justify-center gap-4 text-[15px] font-semibold text-muted-foreground lg:flex xl:gap-7">
            <Link className="shrink-0 hover:text-foreground" href={routes.dashboard}>
              대시보드
            </Link>
            <Link className="shrink-0 hover:text-foreground" href={routes.notices}>
              공지
            </Link>
            <Link className="shrink-0 hover:text-foreground" href={routes.events}>
              일정
            </Link>
            <Link className="shrink-0 hover:text-foreground" href={routes.settings}>
              설정
            </Link>
          </nav>
          <div className="min-w-0 justify-self-end">
            <PortalSessionStatus />
          </div>
        </div>
      </header>
      <div className="border-b border-border/70 bg-[#eaf3ff] px-5 py-2 text-center text-[12px] font-semibold leading-[18px] text-primary">
        {NON_OFFICIAL_NOTICE}
      </div>
      {children}
      <BottomNavigation />
    </div>
  );
}
