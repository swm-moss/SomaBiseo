import type { Metadata } from "next";

import { EventsPage } from "@/views/events/ui";

export const metadata: Metadata = {
  title: "특강 / 멘토링",
};

export default function Page() {
  return <EventsPage />;
}
