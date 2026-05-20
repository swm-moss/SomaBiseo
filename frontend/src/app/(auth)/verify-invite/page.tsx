import type { Metadata } from "next";

import { InviteVerifyPage } from "@/views/invite-verify/ui";

export const metadata: Metadata = {
  title: "초대 코드 인증",
};

export default function Page() {
  return <InviteVerifyPage />;
}
