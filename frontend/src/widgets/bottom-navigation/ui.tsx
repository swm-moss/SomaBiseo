"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, Home, MessageSquare, Settings } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils";

const navItems = [
  { href: routes.dashboard, label: "홈", Icon: Home },
  { href: routes.notices, label: "공지", Icon: Bell },
  { href: routes.events, label: "일정", Icon: CalendarDays },
  { href: routes.reviews, label: "후기", Icon: MessageSquare },
  { href: routes.settings, label: "설정", Icon: Settings },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-[480px] grid-cols-5 gap-1">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              className={cn(
                "flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-lg text-[12px] font-bold text-muted-foreground",
                isActive && "bg-[#eaf3ff] text-primary",
              )}
              href={href}
            >
              <Icon aria-hidden="true" className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
