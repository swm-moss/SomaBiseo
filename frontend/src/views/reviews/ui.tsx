import { WriteReviewDialog } from "@/features/write-review/ui";
import { ReviewList } from "@/widgets/review-list/ui";
import { AppShell } from "@/widgets/app-shell/ui";
import { PageHeader } from "@/shared/ui/page-header";

export function ReviewsPage() {
  return (
    <AppShell>
      <main className="sb-page">
        <PageHeader
          title="후기"
          description="멘토특강과 자유멘토링을 들은 연수생들의 후기를 모았어요."
          action={<WriteReviewDialog />}
        />
        <ReviewList />
      </main>
    </AppShell>
  );
}
