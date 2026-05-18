import { NoticeList } from "@/widgets/notice-list/ui";
import { AppShell } from "@/widgets/app-shell/ui";
import { PageHeader } from "@/shared/ui/page-header";

export function NoticesPage() {
  return (
    <AppShell>
      <main className="sb-page">
        <PageHeader title="공지사항" description="중요 공지와 새 글만 먼저 확인하세요." />
        <NoticeList />
      </main>
    </AppShell>
  );
}
