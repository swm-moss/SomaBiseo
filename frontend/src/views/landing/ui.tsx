import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
} from "lucide-react";

import { NON_OFFICIAL_NOTICE, PRODUCT_NAME } from "@/shared/constants/product";
import { routes } from "@/shared/config/routes";

const heroPins = [
  {
    eyebrow: "새 공지",
    title: "마감 전 확인할 공지가 있어요",
    detail: "오늘 09:12",
    tone: "text-blue-700 bg-blue-50",
  },
  {
    eyebrow: "추천 AI",
    title: "CI/CD와 자동화 개선 루프",
    detail: "오승근 · 오프라인",
    tone: "text-indigo-700 bg-indigo-50",
  },
  {
    eyebrow: "캘린더",
    title: "팀 회의와 겹치지 않아요",
    detail: "충돌 없음",
    tone: "text-emerald-700 bg-emerald-50",
  },
  {
    eyebrow: "요약",
    title: "이 특강에서 얻는 것 3줄",
    detail: "캐시됨",
    tone: "text-orange-700 bg-orange-50",
  },
] as const;

const features = [
  {
    icon: Bell,
    title: "공지 놓치지 않기",
    description: "새 공지, 중요 공지, 읽음 상태를 한 화면에서 정리합니다.",
  },
  {
    icon: CalendarDays,
    title: "특강과 멘토링 모아보기",
    description: "멘토명, 시간, 장소, 신청 인원을 목록에서 바로 확인합니다.",
  },
  {
    icon: CalendarCheck2,
    title: "캘린더 충돌 확인",
    description: "Google Calendar 일정과 겹치는 시간을 먼저 알려줍니다.",
  },
  {
    icon: Sparkles,
    title: "관심사 기반 추천",
    description: "AI, 프론트, 백엔드처럼 설정한 관심사에 맞는 일정을 먼저 보여줍니다.",
  },
] as const;

const timelineItems = [
  "SOMA 포털 로그인",
  "공지와 일정 동기화",
  "관심사 추천",
  "캘린더에 저장",
] as const;

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-foreground">
      <section className="relative isolate min-h-[88svh] overflow-hidden bg-[#f7f8fa]">
        <div aria-hidden="true" className="absolute inset-0">
          <Image
            alt=""
            aria-hidden="true"
            className="absolute left-1/2 top-20 h-auto w-[880px] max-w-none -translate-x-1/2 opacity-[0.035]"
            height={240}
            priority
            src="/brand/somabiseo-logo.png"
            unoptimized
            width={720}
          />
          <div className="absolute inset-x-0 bottom-[-12%] top-20 mx-auto hidden max-w-[1180px] lg:block">
            <div className="sb-landing-pin sb-landing-pin-a absolute right-8 top-0 w-[330px] rotate-[-5deg]">
              <LandingPin pin={heroPins[0]} />
            </div>
            <div className="sb-landing-pin sb-landing-pin-b absolute right-[310px] top-32 w-[360px] rotate-[4deg]">
              <LandingPin pin={heroPins[1]} />
            </div>
            <div className="sb-landing-pin sb-landing-pin-c absolute right-0 top-[310px] w-[300px] rotate-[3deg]">
              <LandingPin pin={heroPins[2]} />
            </div>
            <div className="sb-landing-pin sb-landing-pin-d absolute right-[360px] top-[430px] w-[320px] rotate-[-3deg]">
              <LandingPin pin={heroPins[3]} />
            </div>
          </div>
          <div className="sb-landing-mobile-pins absolute inset-x-5 bottom-5 grid grid-cols-2 gap-3 lg:hidden">
            <LandingMiniPin pin={heroPins[0]} />
            <LandingMiniPin pin={heroPins[1]} />
          </div>
        </div>

        <header className="relative z-10 mx-auto flex h-[72px] w-full max-w-[1120px] items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link aria-label={`${PRODUCT_NAME} 홈`} className="flex items-center gap-2" href={routes.home}>
            <Image
              alt=""
              aria-hidden="true"
              className="size-9 rounded-lg"
              height={64}
              src="/brand/somabiseo-icon-64.png"
              unoptimized
              width={64}
            />
            <Image
              alt={PRODUCT_NAME}
              className="h-auto w-[108px] object-contain"
              height={240}
              priority
              src="/brand/somabiseo-logo.png"
              unoptimized
              width={720}
            />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              className="hidden h-11 items-center px-3 text-[15px] font-semibold text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              href="#features"
            >
              기능
            </Link>
            <Link
              className="inline-flex h-11 items-center rounded-lg bg-foreground px-4 text-[15px] font-bold text-white transition-transform hover:translate-y-[-1px]"
              href={routes.login}
            >
              시작하기
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(88svh-72px)] w-full max-w-[1120px] items-center px-5 pb-14 pt-12 sm:px-6 lg:px-8">
          <div className="max-w-[720px]">
            <p className="sb-landing-rise text-[15px] font-bold leading-[22px] text-primary">
              소프트웨어마에스트로 비공식 일정 비서
            </p>
            <h1 className="sb-landing-rise mt-4 text-[56px] font-black leading-[0.95] tracking-normal text-foreground sm:text-[76px] lg:text-[104px]">
              SomaBiseo
            </h1>
            <p className="sb-landing-rise mt-6 max-w-[560px] text-[20px] font-semibold leading-[30px] text-[#4e5968] sm:text-[24px] sm:leading-[36px]">
              소마 웹을 매번 뒤지지 않아도 오늘 봐야 할 공지, 특강, 멘토링을 먼저 정리합니다.
            </p>
            <div className="sb-landing-rise mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex h-14 items-center justify-center rounded-lg bg-primary px-6 text-[17px] font-bold text-white shadow-[0_12px_30px_rgb(49_130_246/22%)] transition-transform hover:translate-y-[-1px]"
                href={routes.login}
              >
                SOMA 로그인으로 시작
                <ArrowRight aria-hidden="true" className="ml-2 size-5" />
              </Link>
              <Link
                className="inline-flex h-14 items-center justify-center rounded-lg bg-white px-6 text-[17px] font-bold text-foreground shadow-[0_8px_24px_rgb(25_31_40/8%)] transition-transform hover:translate-y-[-1px]"
                href="#features"
              >
                기능 보기
              </Link>
            </div>
            <p className="sb-landing-rise mt-5 max-w-[520px] text-[13px] font-medium leading-[20px] text-muted-foreground">
              {NON_OFFICIAL_NOTICE}
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[1120px]">
          <div className="max-w-[720px]">
            <p className="text-[15px] font-bold leading-[22px] text-primary">한 번에 정리되는 흐름</p>
            <h2 className="mt-3 text-[36px] font-black leading-[44px] sm:text-[52px] sm:leading-[60px]">
              공지에서 캘린더까지 한 화면의 리듬으로.
            </h2>
          </div>

          <div className="mt-12 divide-y divide-border/80 border-y border-border/80">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="grid gap-5 py-7 sm:grid-cols-[220px_1fr] sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-lg bg-blue-50 text-primary">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <h3 className="text-[19px] font-bold leading-[28px]">{feature.title}</h3>
                  </div>
                  <p className="text-[17px] font-medium leading-[27px] text-[#4e5968]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-[15px] font-bold leading-[22px] text-primary">사용 전후가 달라지는 지점</p>
            <h2 className="mt-3 text-[34px] font-black leading-[43px] sm:text-[48px] sm:leading-[58px]">
              흩어진 정보를 일정 판단으로 바꿉니다.
            </h2>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-[0_18px_60px_rgb(25_31_40/9%)]">
            <div className="rounded-lg border border-border/80 bg-[#fbfcfd] p-5">
              <div className="flex items-center justify-between border-b border-border/80 pb-4">
                <div>
                  <p className="text-[13px] font-bold leading-[20px] text-primary">오늘의 추천</p>
                  <p className="mt-1 text-[18px] font-bold leading-[27px]">AI 서비스 운영 특강</p>
                </div>
                <Sparkles aria-hidden="true" className="size-5 text-primary" />
              </div>
              <div className="mt-5 grid gap-3">
                <LandingSignal icon={Clock3} label="시간" value="5월 31일 오전 09:00" />
                <LandingSignal icon={CheckCircle2} label="충돌" value="기존 일정과 겹치지 않음" />
                <LandingSignal icon={Bell} label="상태" value="접수 마감 전 확인 필요" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#101828] px-5 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[15px] font-bold leading-[22px] text-[#8ec5ff]">MVP 기준</p>
            <h2 className="mt-3 text-[30px] font-black leading-[39px] sm:text-[42px] sm:leading-[52px]">
              필요한 것만 빠르게 확인하세요.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[520px]">
            {timelineItems.map((item, index) => (
              <div key={item} className="flex items-center gap-3 border-t border-white/15 py-4">
                <span className="text-[13px] font-bold text-[#8ec5ff]">0{index + 1}</span>
                <span className="text-[16px] font-semibold leading-[24px]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function LandingPin({ pin }: { pin: (typeof heroPins)[number] }) {
  return (
    <div className="rounded-lg border border-border/80 bg-white p-5 shadow-[0_18px_50px_rgb(25_31_40/10%)]">
      <span className={`inline-flex rounded-md px-2.5 py-1 text-[13px] font-bold ${pin.tone}`}>
        {pin.eyebrow}
      </span>
      <p className="mt-4 text-[20px] font-bold leading-[29px] text-foreground">{pin.title}</p>
      <p className="mt-2 text-[15px] font-semibold leading-[22px] text-muted-foreground">{pin.detail}</p>
    </div>
  );
}

function LandingMiniPin({ pin }: { pin: (typeof heroPins)[number] }) {
  return (
    <div className="rounded-lg border border-border/80 bg-white/95 p-3 shadow-[0_12px_34px_rgb(25_31_40/10%)] backdrop-blur">
      <span className={`inline-flex rounded-md px-2 py-0.5 text-[12px] font-bold ${pin.tone}`}>
        {pin.eyebrow}
      </span>
      <p className="mt-2 line-clamp-2 text-[14px] font-bold leading-[20px] text-foreground">{pin.title}</p>
    </div>
  );
}

function LandingSignal({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3">
      <Icon aria-hidden="true" className="size-5 text-primary" />
      <div>
        <p className="text-[13px] font-semibold leading-[19px] text-muted-foreground">{label}</p>
        <p className="text-[16px] font-bold leading-[24px]">{value}</p>
      </div>
    </div>
  );
}
