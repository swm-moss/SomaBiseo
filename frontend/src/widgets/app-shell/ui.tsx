import Link from "next/link";
import type { ReactNode } from "react";

import { BottomNavigation } from "@/widgets/bottom-navigation/ui";
import { PortalSessionStatus } from "@/features/auth/ui";
import { NON_OFFICIAL_NOTICE, PRODUCT_NAME } from "@/shared/constants/product";
import { routes } from "@/shared/config/routes";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] w-full max-w-[480px] items-center justify-between px-5 sm:px-6">
          <Link className="text-[17px] font-black" href={routes.dashboard}>
            {PRODUCT_NAME}
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-semibold text-muted-foreground lg:flex">
            <Link className="hover:text-foreground" href={routes.dashboard}>
              대시보드
            </Link>
            <Link className="hover:text-foreground" href={routes.notices}>
              공지
            </Link>
            <Link className="hover:text-foreground" href={routes.events}>
              일정
            </Link>
            <Link className="hover:text-foreground" href={routes.settings}>
              설정
            </Link>
          </nav>
          <PortalSessionStatus />
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
