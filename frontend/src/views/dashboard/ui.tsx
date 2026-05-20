import { DashboardSummary } from "@/widgets/dashboard-summary/ui";
import { DashboardReviewPrompt } from "@/widgets/dashboard-review-prompt/ui";
import { AppShell } from "@/widgets/app-shell/ui";
import { DashboardGreeting } from "@/features/auth/ui";
import { PageHeader } from "@/shared/ui/page-header";

export function DashboardPage() {
  return (
    <AppShell>
      <main className="sb-page">
        <PageHeader title={<DashboardGreeting />} description="오늘 확인할 소마 일정이에요." />
        <DashboardSummary />
        <DashboardReviewPrompt />
      </main>
    </AppShell>
  );
}
