import { EventList } from "@/widgets/event-list/ui";
import { AppShell } from "@/widgets/app-shell/ui";
import { PageHeader } from "@/shared/ui/page-header";

export function EventsPage() {
  return (
    <AppShell>
      <main className="sb-page">
        <PageHeader title="특강 / 멘토링" description="멘토특강과 자유멘토링을 시간순으로 봅니다." />
        <EventList />
      </main>
    </AppShell>
  );
}
