import {
  Bell,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import { LandingHero } from "./hero";
import { LandingSnapController } from "./snap-controller";

const features = [
  {
    icon: Bell,
    title: "공지 놓치지 않기",
    description: "새 공지, 중요 공지, 읽음 상태를 한번에 정리해 드려요.",
  },
  {
    icon: CalendarDays,
    title: "특강 모아보기",
    description:
      "멘토명, 시간, 장소, 신청 인원을 목록에서 바로 확인할 수 있어요.",
  },
  {
    icon: CalendarCheck2,
    title: "캘린더 연동",
    description:
      "소마 일정을 간편하게 등록하고, 개인 일정과 겹치는 시간을 미리 알려드려요.",
  },
  {
    icon: Sparkles,
    title: "관심사 기반 추천",
    description: "사용자가 설정한 관심사에 맞는 일정을 AI가 추천해 드려요.",
  },
  {
    icon: Flame,
    title: "마감 임박 강의 보기",
    description: "잔여 자리가 적은 특강을 빠르게 보여드려요.",
  },
  {
    icon: MessageSquare,
    title: "후기 확인",
    description:
      "강의를 들은 사람들의 후기를 확인하고, 작성하며 서로의 인사이트를 공유할 수 있어요.",
  },
] as const;

const timelineItems = [
  "공지·특강 한눈에",
  "추천·마감 우선 확인",
  "후기 보고 결정",
  "캘린더에 등록",
] as const;

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f3f4f8] text-foreground">
      <LandingSnapController />
      <LandingHero />

      <section
        id="features"
        className="flex min-h-[100svh] snap-start flex-col justify-center bg-white px-5 py-12 sm:px-6 lg:px-8 lg:py-16"
      >
        <div className="mx-auto max-w-[1120px]">
          <div className="max-w-[720px]">
            <p className="text-[15px] font-bold leading-[22px] text-primary">
              한눈에 확인하는 소마 일정
            </p>
            <h2 className="mt-3 text-[36px] font-black leading-[44px] sm:text-[52px] sm:leading-[60px]">
              공지, 특강, 후기를 모두 한번에
            </h2>
          </div>

          <div className="mt-12 divide-y divide-border/80 border-y border-border/80">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="grid gap-5 py-5 sm:grid-cols-[220px_1fr] sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-lg bg-blue-50 text-primary">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <h3 className="text-[19px] font-bold leading-[28px]">
                      {feature.title}
                    </h3>
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

      <div className="flex min-h-[100svh] snap-start flex-col">
        <section className="flex flex-1 items-center px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto grid w-full max-w-[1120px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[15px] font-bold leading-[22px] text-primary">
                여러 탭 오가지 않고, 한 화면에서 결정까지
              </p>
              <h2 className="mt-3 text-[34px] font-black leading-[48px] sm:text-[48px] sm:leading-[64px]">
                사용 전후로 달라지는 소마 생활
              </h2>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-[0_18px_60px_rgb(25_31_40/9%)]">
              <div className="rounded-lg border border-border/80 bg-[#fbfcfd] p-5">
                <div className="border-b border-border/80 pb-4">
                  <p className="text-[13px] font-bold leading-[20px] text-primary">
                    오늘의 추천
                  </p>
                  <p className="mt-1 text-[18px] font-bold leading-[27px]">
                    AI 서비스 운영 특강
                  </p>
                </div>
                <div className="mt-5 grid gap-3">
                  <LandingSignal
                    icon={Clock3}
                    label="시간"
                    value="5월 31일 오전 09:00"
                  />
                  <LandingSignal
                    icon={Flame}
                    label="잔여 자리"
                    value="2석 남음 · 마감 임박"
                    tone="urgent"
                  />
                  <LandingSignal
                    icon={CheckCircle2}
                    label="충돌"
                    value="기존 일정과 겹치지 않음"
                  />
                  <LandingSignal
                    icon={MessageSquare}
                    label="후기"
                    value="“실무 사례가 많아요” 외 12개"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#101828] px-5 py-12 text-white sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1120px] flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="mt-3 text-[30px] font-black leading-[39px] sm:text-[42px] sm:leading-[52px]">
                필요한 것만 빠르게 확인하세요.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[520px]">
              {timelineItems.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 border-t border-white/15 py-4"
                >
                  <span className="text-[13px] font-bold text-[#8ec5ff]">
                    0{index + 1}
                  </span>
                  <span className="text-[16px] font-semibold leading-[24px]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function LandingSignal({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  tone?: "default" | "urgent";
}) {
  const iconColor = tone === "urgent" ? "text-red-500" : "text-primary";
  const valueColor = tone === "urgent" ? "text-red-600" : undefined;

  return (
    <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3">
      <Icon aria-hidden="true" className={`size-5 ${iconColor}`} />
      <div>
        <p className="text-[13px] font-semibold leading-[19px] text-muted-foreground">
          {label}
        </p>
        <p
          className={`text-[16px] font-bold leading-[24px] ${valueColor ?? ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
