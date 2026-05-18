import type { Metadata } from "next";

import { NoticesPage } from "@/views/notices/ui";

export const metadata: Metadata = {
  title: "공지사항",
};

export default function Page() {
  return <NoticesPage />;
}
