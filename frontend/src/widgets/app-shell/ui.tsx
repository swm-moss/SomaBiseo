import Link from "next/link";
import type { ReactNode } from "react";

import { BottomNavigation } from "@/widgets/bottom-navigation/ui";
import { NON_OFFICIAL_NOTICE, PRODUCT_NAME } from "@/shared/constants/product";
import { routes } from "@/shared/config/routes";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link className="text-base font-black" href={routes.dashboard}>
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
        </div>
      </header>
      <div className="border-b bg-blue-50 px-5 py-2 text-center text-xs font-medium text-blue-800">
        {NON_OFFICIAL_NOTICE}
      </div>
      {children}
      <BottomNavigation />
    </div>
  );
}
