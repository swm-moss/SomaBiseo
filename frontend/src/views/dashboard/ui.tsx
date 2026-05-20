import { DashboardSummary } from "@/widgets/dashboard-summary/ui";
import { DashboardReviewPrompt } from "@/widgets/dashboard-review-prompt/ui";
import { AppShell } from "@/widgets/app-shell/ui";
import { PageHeader } from "@/shared/ui/page-header";

export function DashboardPage() {
  return (
    <AppShell>
      <main className="sb-page">
        <PageHeader
          title="소마 브리핑"
          description="공지, 특강, 멘토링을 최신 포털 데이터 기준으로 정리했어요."
        />
        <DashboardSummary />
        <DashboardReviewPrompt />
      </main>
    </AppShell>
  );
}
