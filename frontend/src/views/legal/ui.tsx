import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { routes } from "@/shared/config/routes";
import { NON_OFFICIAL_NOTICE, PRODUCT_NAME } from "@/shared/constants/product";

type LegalPageProps = {
  title: string;
  description: string;
  updatedAt: string;
  children: ReactNode;
};

export function LegalPage({ title, description, updatedAt, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-white">
        <div className="mx-auto flex max-w-[960px] items-center justify-between gap-4 px-5 py-5 sm:px-6">
          <Link aria-label={`${PRODUCT_NAME} 홈으로 이동`} className="flex items-center gap-2" href={routes.home}>
            <Image
              alt=""
              aria-hidden="true"
              className="size-8 rounded-md"
              height={64}
              src="/brand/somabiseo-icon-64.png"
              unoptimized
              width={64}
            />
            <Image
              alt={PRODUCT_NAME}
              className="h-auto w-[104px] object-contain"
              height={240}
              priority
              src="/brand/somabiseo-logo.png"
              unoptimized
              width={720}
            />
          </Link>
          <Link className="text-[14px] font-bold leading-[20px] text-muted-foreground hover:text-foreground" href={routes.login}>
            시작하기
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[960px] px-5 py-10 sm:px-6 sm:py-14">
        <div className="max-w-[760px]">
          <p className="text-[14px] font-bold leading-[20px] text-primary">{updatedAt}</p>
          <h1 className="mt-3 text-[34px] font-black leading-[42px] sm:text-[48px] sm:leading-[58px]">
            {title}
          </h1>
          <p className="mt-4 text-[17px] font-medium leading-[27px] text-[#4e5968]">
            {description}
          </p>
          <p className="mt-3 text-[14px] font-semibold leading-[22px] text-muted-foreground">
            {NON_OFFICIAL_NOTICE}
          </p>
          <p className="mt-2 text-[14px] font-semibold leading-[22px] text-muted-foreground">
            적용 서비스:{" "}
            <a className="font-bold text-primary underline-offset-4 hover:underline" href="https://somabiseo.com">
              https://somabiseo.com
            </a>
          </p>
        </div>

        <div className="mt-10 divide-y divide-border/80 border-y border-border/80">
          {children}
        </div>

        <footer className="flex flex-wrap gap-x-4 gap-y-2 py-8 text-[14px] font-semibold leading-[22px] text-muted-foreground">
          <Link className="hover:text-foreground" href={routes.home}>
            홈
          </Link>
          <Link className="hover:text-foreground" href={routes.privacy}>
            개인정보처리방침
          </Link>
          <Link className="hover:text-foreground" href={routes.terms}>
            이용약관
          </Link>
        </footer>
      </div>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 py-8 sm:grid-cols-[220px_1fr] sm:gap-8">
      <h2 className="text-[20px] font-extrabold leading-[29px]">{title}</h2>
      <div className="space-y-4 text-[16px] font-medium leading-[27px] text-[#4e5968]">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden="true" className="mt-[11px] size-1.5 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
