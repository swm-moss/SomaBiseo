"use client";

import Link from "next/link";

import { usePrefetchMainRouteData } from "@/widgets/app-shell/use-prefetch-main-route-data";
import { routes } from "@/shared/config/routes";

const navItems = [
  { href: routes.dashboard, label: "대시보드" },
  { href: routes.notices, label: "공지" },
  { href: routes.events, label: "일정" },
  { href: routes.reviews, label: "후기" },
  { href: routes.settings, label: "설정" },
];

export function MainNavigation() {
  const prefetchRouteData = usePrefetchMainRouteData();

  return (
    <nav className="hidden min-w-0 flex-1 items-center gap-6 text-[15px] font-bold text-muted-foreground lg:flex">
      {navItems.map((item) => (
        <Link
          key={item.href}
          className="hover:text-foreground"
          href={item.href}
          onFocus={() => prefetchRouteData(item.href)}
          onMouseEnter={() => prefetchRouteData(item.href)}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
