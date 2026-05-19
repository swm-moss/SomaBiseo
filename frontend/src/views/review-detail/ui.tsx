import { ReviewDetailList } from "@/widgets/review-detail-list/ui";
import { AppShell } from "@/widgets/app-shell/ui";

export function ReviewDetailPage({ eventId }: { eventId: string }) {
  return (
    <AppShell>
      <main className="sb-page">
        <ReviewDetailList eventId={eventId} />
      </main>
    </AppShell>
  );
}
