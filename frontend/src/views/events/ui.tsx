import { EventList } from "@/widgets/event-list/ui";
import { AppShell } from "@/widgets/app-shell/ui";
import { PageHeader } from "@/shared/ui/page-header";

export function EventsPage() {
  return (
    <AppShell>
      <main className="sb-page">
        <PageHeader title="특강 / 멘토링" description="최신 강의부터 보고, 필요한 기준으로 정렬합니다." />
        <EventList />
      </main>
    </AppShell>
  );
}
