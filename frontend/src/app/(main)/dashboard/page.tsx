import type { Metadata } from "next";

import { DashboardPage } from "@/views/dashboard/ui";

export const metadata: Metadata = {
  title: "대시보드",
};

export default function Page() {
  return <DashboardPage />;
}
