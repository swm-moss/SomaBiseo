import type { Metadata } from "next";

import { LoginPage } from "@/views/login/ui";

export const metadata: Metadata = {
  title: "로그인",
};

export default function Page() {
  return <LoginPage />;
}
