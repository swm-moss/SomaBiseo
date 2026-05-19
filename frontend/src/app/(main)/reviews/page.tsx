import type { Metadata } from "next";

import { ReviewsPage } from "@/views/reviews/ui";

export const metadata: Metadata = {
  title: "후기",
};

export default function Page() {
  return <ReviewsPage />;
}
