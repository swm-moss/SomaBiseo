import { ConnectGoogleCalendarPanel } from "@/features/connect-google-calendar/ui";
import { InterestPreferencePanel } from "@/features/user-interests/ui";
import { AppShell } from "@/widgets/app-shell/ui";
import { MVP_GUARDRAILS } from "@/shared/constants/product";
import { PageHeader } from "@/shared/ui/page-header";

export function SettingsPage() {
  return (
    <AppShell>
      <main className="sb-page">
        <PageHeader title="설정" description="캘린더 연결과 비공식 서비스 범위를 확인합니다." />
        <section className="sb-section">
          <InterestPreferencePanel />
        </section>
        <section className="sb-section">
          <ConnectGoogleCalendarPanel />
        </section>
        <section className="sb-section">
          <h2 className="sb-section-title">MVP 가드레일</h2>
          <ul className="mt-3 space-y-2 rounded-lg bg-white p-4 text-sm leading-6 text-muted-foreground">
            {MVP_GUARDRAILS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </main>
    </AppShell>
  );
}
