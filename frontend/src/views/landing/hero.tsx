"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Flame,
  MessageSquare,
  Star,
} from "lucide-react";

import { NON_OFFICIAL_NOTICE, PRODUCT_NAME } from "@/shared/constants/product";
import { routes } from "@/shared/config/routes";

const stageLinks = ["Notice", "Mentoring", "Calendar", "Summary"] as const;

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.12], [0.88, 1.12]);
  const y = useTransform(scrollYProgress, [0, 0.12], ["12vh", "-20vh"]);
  const innerY = useTransform(scrollYProgress, [0.16, 0.76], ["0%", "-60%"]);

  return (
    <section ref={sectionRef} className="relative h-[560svh]">
      <div className="sb-landing-stage sticky top-0 isolate h-svh w-full overflow-hidden">
        <div className="absolute left-5 top-5 z-20 flex items-center gap-2 sm:left-7 sm:top-7">
          <Image
            alt=""
            aria-hidden="true"
            className="size-9 rounded-lg shadow-[0_10px_24px_rgb(25_31_40/14%)]"
            height={64}
            priority
            src="/brand/somabiseo-icon-64.png"
            unoptimized
            width={64}
          />
          <Image
            alt={PRODUCT_NAME}
            className="hidden h-auto w-[112px] object-contain invert sm:block"
            height={240}
            priority
            src="/brand/somabiseo-logo.png"
            unoptimized
            width={720}
          />
        </div>

        <nav className="absolute left-7 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 text-[12px] font-semibold uppercase tracking-normal text-white/70 lg:flex">
          {stageLinks.map((item) => (
            <Link
              key={item}
              className="transition-colors hover:text-white"
              href="#features"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="absolute right-5 top-5 z-20 flex items-center gap-2 sm:right-7 sm:top-7">
          <Link
            className="hidden h-11 items-center rounded-lg bg-white/14 px-4 text-[14px] font-bold text-white backdrop-blur transition-colors hover:bg-white/20 sm:inline-flex"
            href="#features"
          >
            기능 보기
          </Link>
          <Link
            className="inline-flex h-11 items-center rounded-lg bg-white px-4 text-[14px] font-bold text-primary shadow-[0_12px_30px_rgb(25_31_40/18%)] transition-transform hover:translate-y-[-1px]"
            href={routes.login}
          >
            시작하기
          </Link>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[42%] z-0 -translate-y-1/2 overflow-hidden"
        >
          <div className="sb-landing-marquee flex w-max whitespace-nowrap text-[68px] font-black leading-none text-white/20 sm:text-[130px] lg:text-[190px]">
            <span className="px-8">
              NOTICE · MENTORING · CALENDAR · REVIEW ·
            </span>
            <span className="px-8">
              NOTICE · MENTORING · CALENDAR · REVIEW ·
            </span>
          </div>
        </div>

        <div className="absolute inset-x-5 top-24 z-10 text-center text-white sm:top-10">
          <h1 className="sr-only">{PRODUCT_NAME}</h1>
          <Image
            alt=""
            aria-hidden="true"
            className="sb-landing-rise mx-auto mt-3 h-auto w-[min(78vw,360px)] object-contain brightness-0 invert drop-shadow-[0_14px_28px_rgb(25_31_40/16%)] sm:w-[480px] lg:w-[560px]"
            height={240}
            priority
            src="/brand/somabiseo-logo.png"
            unoptimized
            width={720}
          />
          <p className="sb-landing-rise mx-auto mt-2 whitespace-nowrap text-[13px] font-medium leading-[20px] text-white/75 sm:text-[15px] sm:leading-[23px]">
            소마 공지, 특강, 멘토링, 개인 일정, 후기를 한눈에 확인해 보세요.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[65%] z-10 w-[min(95vw,420px)] -translate-x-1/2 sm:top-[58%] sm:w-[min(92vw,780px)] lg:top-[52%] lg:w-[min(86vw,1100px)]"
        >
          <motion.div
            className="sb-monitor-stage relative aspect-[4/3] will-change-transform"
            style={reduceMotion ? undefined : { scale, y }}
          >
            <div className="sb-monitor-shadow absolute bottom-[-5%] left-1/2 h-12 w-[82%] -translate-x-1/2 rounded-[999px]" />
            <div className="sb-monitor-shell absolute inset-0">
              <div className="sb-monitor-face relative flex h-full flex-col rounded-[28px] p-3 sm:rounded-[40px] sm:p-5 lg:p-6">
                <div className="sb-monitor-screen relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] bg-[#f3f4f8] p-3 sm:rounded-[30px] sm:p-5 lg:p-6">
                  <div className="flex shrink-0 items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#ff6b6b] sm:size-2.5" />
                      <span className="size-2 rounded-full bg-[#ffd166] sm:size-2.5" />
                      <span className="size-2 rounded-full bg-[#35d07f] sm:size-2.5" />
                    </div>
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-semibold text-muted-foreground sm:px-3 sm:py-1 sm:text-[11px]">
                      somabiseo.vercel.app/dashboard
                    </span>
                    <span className="size-2 sm:size-2.5" />
                  </div>

                  <div className="mt-3 min-h-0 flex-1 overflow-hidden sm:mt-4">
                    <motion.div
                      style={reduceMotion ? undefined : { y: innerY }}
                      className="will-change-transform"
                    >
                      <DashboardPreview />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <p className="absolute bottom-6 left-5 z-20 whitespace-nowrap text-[11px] font-medium leading-[17px] text-white/65 sm:left-7 sm:text-[12px]">
          {NON_OFFICIAL_NOTICE}
        </p>
        <Link
          className="absolute bottom-6 right-5 z-20 hidden h-12 items-center rounded-lg bg-white px-5 text-[15px] font-black text-primary shadow-[0_16px_34px_rgb(25_31_40/18%)] transition-transform hover:translate-y-[-1px] sm:inline-flex"
          href={routes.login}
        >
          시작하기
          <ArrowRight aria-hidden="true" className="ml-2 size-4" />
        </Link>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="grid gap-2 sm:gap-2.5 lg:gap-3 lg:pr-2">
      <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-white">
        <div className="flex items-center gap-2.5 border-r border-border/80 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:px-5 lg:py-4">
          <span className="grid size-7 place-items-center rounded-md bg-blue-50 text-primary sm:size-8 lg:size-10">
            <CalendarDays
              aria-hidden="true"
              className="size-3.5 sm:size-4 lg:size-5"
            />
          </span>
          <div>
            <p className="text-[10px] font-semibold leading-[14px] text-muted-foreground sm:text-[12px] sm:leading-[16px] lg:text-[13px] lg:leading-[18px]">
              이번주 일정
            </p>
            <p className="text-[16px] font-extrabold leading-[22px] text-foreground sm:text-[20px] sm:leading-[26px] lg:text-[24px] lg:leading-[30px]">
              5개
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:px-5 lg:py-4">
          <span className="grid size-7 place-items-center rounded-md bg-blue-50 text-primary sm:size-8 lg:size-10">
            <Bell aria-hidden="true" className="size-3.5 sm:size-4 lg:size-5" />
          </span>
          <div>
            <p className="text-[10px] font-semibold leading-[14px] text-muted-foreground sm:text-[12px] sm:leading-[16px] lg:text-[13px] lg:leading-[18px]">
              최근 공지
            </p>
            <p className="text-[16px] font-extrabold leading-[22px] text-foreground sm:text-[20px] sm:leading-[26px] lg:text-[24px] lg:leading-[30px]">
              3개
            </p>
          </div>
        </div>
      </div>

      <PreviewSection icon={Star} title="추천 특강">
        <PreviewListRow
          title="AI Agent 24시간 돌리는 방법"
          meta="박준이 멘토 · 6/3 (수) 19:00"
          tag="AI"
        />
        <PreviewListRow
          title="대규모 시스템 설계 1탄"
          meta="김동인 멘토 · 6/5 (금) 14:00"
          tag="UX"
        />
        <PreviewListRow
          title="주니어를 위한 오픈소스 특강"
          meta="김상호 멘토 · 6/7 (일) 10:00"
          tag="프론트"
        />
        <PreviewListRow
          title="프롬프트 엔지니어링 실전"
          meta="장유진 멘토 · 6/10 (수) 20:00"
          tag="AI"
        />
        <PreviewListRow
          title="Kubernetes 운영 입문"
          meta="한승호 멘토 · 6/12 (금) 19:30"
          tag="DevOps"
        />
      </PreviewSection>

      <PreviewSection icon={Flame} title="마감 임박">
        <PreviewListRow
          badge="멘토특강"
          title="AI 시대에 개발자가 갖춰야 할 역량"
          meta="김상호 멘토 · 5/31 (토) 09:00"
          trailing="남은 자리 2석"
          tone="urgent"
        />
        <PreviewListRow
          badge="자유멘토링"
          badgeTone="cyan"
          title="백엔드 1:1 멘토링"
          meta="이도현 멘토 · 6/2 (월) 14:00"
          trailing="남은 자리 1석"
          tone="urgent"
        />
        <PreviewListRow
          badge="멘토특강"
          title="데이터 파이프라인 설계"
          meta="박서연 멘토 · 6/4 (수) 15:00"
          trailing="남은 자리 3석"
          tone="urgent"
        />
      </PreviewSection>

      <PreviewSection icon={Bell} title="최근 공지">
        <PreviewListRow
          title="6월 운영 일정 안내"
          meta="2026-05-24"
          metaPosition="trailing"
        />
        <PreviewListRow
          title="후기 작성 이벤트 안내"
          meta="2026-05-22"
          metaPosition="trailing"
        />
        <PreviewListRow
          title="중간 평가 일정 안내"
          meta="2026-05-20"
          metaPosition="trailing"
        />
        <PreviewListRow
          title="네트워킹 데이 참가 신청"
          meta="2026-05-18"
          metaPosition="trailing"
        />
      </PreviewSection>

      <PreviewSection icon={MessageSquare} title="최근 후기" action="전체 보기">
        <PreviewReviewRow
          title="AI 운영 특강"
          author="연수생1"
          quote="실무 사례가 많아 바로 적용해볼 수 있었어요."
        />
        <PreviewReviewRow
          title="Spring Boot 운영 노하우"
          author="연수생2"
          quote="운영 관점 인사이트를 얻었습니다."
        />
        <PreviewReviewRow
          title="사용자 리서치 워크숍"
          author="연수생3"
          quote="실제 인터뷰 질문 설계가 가장 큰 수확이었어요."
        />
      </PreviewSection>
    </div>
  );
}

function PreviewSection({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: typeof Star;
  title: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-white">
      <div className="flex items-center justify-between gap-2 px-3 pb-1.5 pt-2.5 sm:px-4 sm:pb-2 sm:pt-3 lg:px-5 lg:pb-2.5 lg:pt-3.5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Icon
            aria-hidden="true"
            className="size-3.5 text-primary sm:size-4 lg:size-[18px]"
          />
          <p className="text-[12px] font-extrabold leading-[16px] text-foreground sm:text-[14px] sm:leading-[19px] lg:text-[16px] lg:leading-[22px]">
            {title}
          </p>
        </div>
        {action ? (
          <span className="text-[10px] font-bold leading-none text-primary sm:text-[12px] lg:text-[13px]">
            {action}
          </span>
        ) : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

type ListRowProps = {
  title: string;
  meta: string;
  tag?: string;
  badge?: string;
  badgeTone?: "blue" | "cyan";
  trailing?: string;
  tone?: "default" | "urgent";
  metaPosition?: "below" | "trailing";
  className?: string;
};

function PreviewListRow({
  title,
  meta,
  tag,
  badge,
  badgeTone = "blue",
  trailing,
  tone = "default",
  metaPosition = "below",
  className,
}: ListRowProps) {
  const badgeClass =
    badgeTone === "cyan"
      ? "bg-cyan-50 text-cyan-700"
      : "bg-blue-50 text-primary";
  const trailingClass =
    tone === "urgent" ? "text-red-600" : "text-muted-foreground";

  return (
    <div
      className={`flex items-center justify-between gap-3 border-t border-border/70 px-3 py-2 sm:px-4 sm:py-2.5 lg:px-5 lg:py-3 ${className ?? ""}`}
    >
      <div className="min-w-0 flex-1">
        {badge ? (
          <span
            className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold leading-none sm:text-[10px] lg:text-[11px] ${badgeClass}`}
          >
            {badge}
          </span>
        ) : null}
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-[12px] font-semibold leading-[16px] text-foreground sm:text-[13px] sm:leading-[18px] lg:text-[15px] lg:leading-[22px]">
            {title}
          </p>
          {tag ? (
            <span className="rounded bg-blue-50 px-1.5 py-px text-[9px] font-bold leading-[14px] text-blue-700 sm:text-[10px] sm:leading-[16px] lg:text-[11px]">
              {tag}
            </span>
          ) : null}
        </div>
        {metaPosition === "below" ? (
          <p className="mt-0.5 text-[10px] leading-[14px] text-muted-foreground sm:text-[11px] sm:leading-[15px] lg:text-[12px] lg:leading-[17px]">
            {meta}
          </p>
        ) : null}
      </div>
      {metaPosition === "trailing" ? (
        <p className="shrink-0 text-[10px] font-medium leading-[14px] text-muted-foreground sm:text-[11px] sm:leading-[15px] lg:text-[12px] lg:leading-[17px]">
          {meta}
        </p>
      ) : null}
      {trailing ? (
        <p
          className={`shrink-0 text-[10px] font-bold leading-[14px] sm:text-[11px] sm:leading-[15px] lg:text-[12px] lg:leading-[17px] ${trailingClass}`}
        >
          {trailing}
        </p>
      ) : null}
    </div>
  );
}

function PreviewReviewRow({
  title,
  author,
  quote,
  className,
}: {
  title: string;
  author: string;
  quote: string;
  className?: string;
}) {
  return (
    <div
      className={`border-t border-border/70 px-3 py-2 sm:px-4 sm:py-2.5 lg:px-5 lg:py-3 ${className ?? ""}`}
    >
      <p className="text-[12px] font-semibold leading-[16px] text-foreground sm:text-[13px] sm:leading-[18px] lg:text-[15px] lg:leading-[22px]">
        {title}
      </p>
      <p className="mt-0.5 text-[10px] leading-[14px] text-muted-foreground sm:text-[11px] sm:leading-[15px] lg:text-[12px] lg:leading-[17px]">
        {author}
      </p>
      <p className="mt-1 line-clamp-2 text-[10px] leading-[14px] text-muted-foreground sm:text-[11px] sm:leading-[15px] lg:text-[12px] lg:leading-[18px]">
        “{quote}”
      </p>
    </div>
  );
}
