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
  "SOMA 포털 로그인",
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
            <p className="sb-landing-rise text-[13px] font-semibold uppercase leading-[20px] text-white/80">
              Hi, I&apos;m
            </p>
            <h1 className="sb-landing-rise text-[38px] font-black leading-[44px] sm:text-[64px] sm:leading-[70px]">
              SomaBiseo
            </h1>
            <p className="sb-landing-rise mx-auto mt-2 max-w-[520px] text-[13px] font-medium leading-[20px] text-white/75 sm:text-[15px] sm:leading-[23px]">
              소마 공지, 특강, 멘토링, 캘린더 충돌을 한 화면에서 정리합니다.
            </p>
          </div>

          <div aria-hidden="true" className="sb-landing-machine absolute left-1/2 top-[42%] z-10 w-[292px] sm:top-[44%] sm:w-[430px] lg:top-[45%] lg:w-[520px]">
            <div className="sb-monitor-stage relative aspect-[1.18]">
              <div className="sb-monitor-shadow absolute bottom-2 left-1/2 h-14 w-[88%] -translate-x-1/2 rounded-[999px]" />
              <div className="sb-monitor-mug absolute bottom-[16%] left-0 hidden h-[70px] w-[52px] rounded-[14px] bg-[#ff5d61] shadow-[0_18px_34px_rgb(25_31_40/24%)] sm:block">
                <span className="absolute left-3 top-4 size-2.5 rounded-full bg-white" />
                <span className="absolute right-3 top-4 size-2.5 rounded-full bg-white" />
                <span className="absolute -right-4 top-5 h-8 w-5 rounded-r-full border-[6px] border-[#ff8b8f]" />
              </div>
              <div className="absolute bottom-[11%] right-1 hidden size-[62px] rounded-full bg-[radial-gradient(circle_at_32%_28%,#eafffa,#6ee7b7_40%,#22c55e)] shadow-[0_18px_34px_rgb(25_31_40/16%)] sm:block" />
              <div className="absolute left-[8%] top-[10%] h-11 w-8 -rotate-[16deg] rounded-md bg-[#dffb75] shadow-[0_14px_24px_rgb(25_31_40/16%)]" />
              <div className="absolute right-[9%] top-[18%] h-12 w-9 rotate-[10deg] rounded-md bg-[#fff27a] shadow-[0_14px_24px_rgb(25_31_40/14%)]" />
              <span className="absolute left-[2%] top-[21%] text-[38px] font-black leading-none text-[#48f29b] drop-shadow-[0_8px_16px_rgb(25_31_40/18%)]">
                ✦
              </span>
              <span className="absolute right-[2%] top-[38%] text-[30px] font-black leading-none text-[#ff8abe] drop-shadow-[0_8px_16px_rgb(25_31_40/18%)]">
                ✦
              </span>

              <div className="sb-monitor-shell absolute left-1/2 top-[10%] w-[78%] -translate-x-1/2">
                <div className="sb-monitor-buttons absolute -right-8 top-[28%] hidden w-8 flex-col gap-4 sm:flex">
                  <span className="size-4 rounded-full bg-[#ff6b94] shadow-inner" />
                  <span className="size-5 rounded-full bg-[#f7c843] shadow-inner" />
                  <span className="size-4 rounded-full bg-[#8bd8ff] shadow-inner" />
                </div>
                <div className="sb-monitor-face relative rounded-[30px] p-5 sm:rounded-[42px] sm:p-7">
                  <div className="sb-monitor-screen relative overflow-hidden rounded-[18px] border-[7px] border-[#6a91bd] bg-[#dffaff] shadow-inner sm:rounded-[26px] sm:border-[10px]">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#5ce1ff_0%,#b6fbff_45%,#7bd760_100%)]" />
                    <div className="absolute inset-x-0 top-0 h-[34%] bg-[radial-gradient(circle_at_72%_52%,#fff_0_10%,transparent_11%),radial-gradient(circle_at_60%_62%,#fff_0_13%,transparent_14%)] opacity-90" />
                    <div className="absolute left-3 top-3 grid gap-2">
                      {["N", "AI", "7", "S"].map((item, index) => (
                        <span
                          key={item}
                          className="grid size-7 place-items-center rounded-md bg-white/82 text-[10px] font-black text-[#1f2937] shadow-[0_5px_10px_rgb(25_31_40/12%)]"
                          style={{ transform: `translateX(${index % 2 === 0 ? 0 : 6}px)` }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="absolute bottom-5 right-5 w-[62%] rounded-lg border border-[#a9b5c4] bg-white/94 shadow-[0_12px_26px_rgb(25_31_40/18%)]">
                      <div className="flex h-7 items-center gap-1.5 border-b border-border/80 px-2">
                        <span className="size-2 rounded-full bg-[#ff5d61]" />
                        <span className="size-2 rounded-full bg-[#ffd166]" />
                        <span className="size-2 rounded-full bg-[#22c55e]" />
                      </div>
                      <div className="p-3 text-center">
                        <p className="text-[10px] font-black text-primary sm:text-[12px]">추천 AI</p>
                        <p className="mt-1 text-[13px] font-black leading-[18px] text-foreground sm:text-[17px] sm:leading-[23px]">
                          오늘 볼 소마 일정
                        </p>
                        <p className="mt-1 text-[9px] font-bold text-muted-foreground sm:text-[11px]">
                          충돌 없음 · 오승근
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sb-monitor-neck absolute left-1/2 top-[66%] h-[58px] w-[70px] -translate-x-1/2 rounded-b-[18px] sm:h-[80px] sm:w-[100px]" />
              <div className="sb-monitor-base absolute bottom-[8%] left-1/2 h-[62px] w-[58%] -translate-x-1/2 rounded-[24px] sm:h-[78px]">
                <div className="absolute left-1/2 top-[42%] h-5 w-[62%] -translate-x-1/2 rounded-full bg-[#1479ff] shadow-inner sm:h-7" />
                <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-md bg-white/55 px-3 py-1 text-[9px] font-black uppercase text-[#4b7db2] sm:text-[10px]">
                  Soma Brief
                </span>
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
            SOMA 로그인
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
