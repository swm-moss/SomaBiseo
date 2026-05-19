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

const stageLinks = ["Notice", "Mentoring", "Calendar", "Summary"] as const;

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
  "읽기 전용 데이터 동기화",
  "공지와 일정 동기화",
  "관심사 추천",
  "캘린더에 저장",
] as const;

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f3f4f8] text-foreground">
      <section className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="sb-landing-stage relative isolate mx-auto min-h-[calc(92svh-24px)] max-w-[1440px] overflow-hidden rounded-lg">
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
              <Link key={item} className="transition-colors hover:text-white" href="#features">
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

          <div className="pointer-events-none absolute inset-x-[-28vw] top-[42%] z-0 -translate-y-1/2 whitespace-nowrap text-center text-[68px] font-black leading-none text-white/20 sm:text-[130px] lg:text-[190px]">
            NOTICES·MENTORING·CALENDAR
          </div>

          <div className="absolute inset-x-5 top-24 z-10 text-center text-white sm:top-10">
            <p className="sb-landing-rise text-[13px] font-semibold leading-[20px] text-white/80">
              비공식 소마 일정 비서
            </p>
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
            <p className="sb-landing-rise mx-auto mt-2 max-w-[520px] text-[13px] font-medium leading-[20px] text-white/75 sm:text-[15px] sm:leading-[23px]">
              소마 공지, 특강, 멘토링, 캘린더 충돌을 한 화면에서 정리합니다.
            </p>
          </div>

          <div aria-hidden="true" className="sb-landing-machine absolute left-1/2 top-[50%] z-10 w-[300px] sm:top-[52%] sm:w-[440px] lg:top-[53%] lg:w-[560px]">
            <div className="sb-monitor-stage relative aspect-[1.7]">
              <div className="sb-monitor-shadow absolute bottom-[-5%] left-1/2 h-12 w-[82%] -translate-x-1/2 rounded-[999px]" />
              <div className="sb-monitor-shell absolute left-1/2 top-[6%] w-full -translate-x-1/2">
                <div className="sb-monitor-face relative rounded-[30px] p-4 sm:rounded-[38px] sm:p-6">
                  <div className="sb-monitor-screen relative overflow-hidden rounded-[20px] bg-[#f9fbff] p-4 sm:rounded-[28px] sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-[#ff6b6b]" />
                        <span className="size-2.5 rounded-full bg-[#ffd166]" />
                        <span className="size-2.5 rounded-full bg-[#35d07f]" />
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-primary sm:text-[12px]">
                        추천 AI
                      </span>
                    </div>

                    <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-[1fr_0.84fr] sm:gap-4">
                      <div>
                        <p className="text-[12px] font-semibold text-muted-foreground sm:text-[14px]">
                          오늘 확인할 일정
                        </p>
                        <p className="mt-2 text-[22px] font-black leading-[29px] text-foreground sm:text-[34px] sm:leading-[42px]">
                          AI 운영 특강
                        </p>
                        <p className="mt-2 text-[13px] font-semibold leading-[20px] text-[#4e5968] sm:text-[16px] sm:leading-[24px]">
                          5월 31일 오전 09:00 · 오승근 멘토
                        </p>
                      </div>

                      <div className="grid gap-2 text-[12px] font-bold sm:text-[14px]">
                        <div className="flex items-center justify-between rounded-lg bg-[#eef6ff] px-3 py-2 text-primary">
                          <span>공지</span>
                          <span>3개</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-[#ecfdf3] px-3 py-2 text-[#0f8f4a]">
                          <span>충돌</span>
                          <span>없음</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-[#fff7ed] px-3 py-2 text-[#d75a00]">
                          <span>마감</span>
                          <span>오늘</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="absolute bottom-6 left-5 z-20 max-w-[260px] text-[11px] font-medium leading-[17px] text-white/65 sm:left-7 sm:max-w-[360px] sm:text-[12px]">
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
