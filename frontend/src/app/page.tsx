import type { Metadata } from "next";

import { LandingPage } from "@/views/landing/ui";

export const metadata: Metadata = {
  title: "소마 일정 비서",
  description: "소마 공지, 특강, 멘토링, 캘린더 충돌을 한눈에 정리하는 비공식 일정 비서",
};

export default function Page() {
  return <LandingPage />;
}
