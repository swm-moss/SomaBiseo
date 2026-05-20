import { Suspense } from "react";

import { WriteReviewDialog } from "@/features/write-review/ui";
import { ReviewFeed } from "@/widgets/review-feed/ui";
import { AppShell } from "@/widgets/app-shell/ui";
import { PageHeader } from "@/shared/ui/page-header";
import { LoadingState } from "@/shared/ui/loading-state";

export function ReviewsPage() {
  return (
    <AppShell>
      <main className="sb-page">
        <PageHeader title="후기" action={<WriteReviewDialog />} />
        <Suspense fallback={<LoadingState />}>
          <ReviewFeed />
        </Suspense>
      </main>
    </AppShell>
  );
}
