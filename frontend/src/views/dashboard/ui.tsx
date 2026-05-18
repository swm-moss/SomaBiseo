import { DashboardSummary } from "@/widgets/dashboard-summary/ui";
import { AppShell } from "@/widgets/app-shell/ui";
import { PageHeader } from "@/shared/ui/page-header";

export function DashboardPage() {
  return (
    <AppShell>
      <main className="sb-page">
        <PageHeader title="안녕하세요, 주인님" description="오늘 확인할 소마 일정이에요." />
        <DashboardSummary />
      </main>
    </AppShell>
  );
}
