import { Suspense } from "react";

import { ReviewsContent } from "@/views/reviews/content";
import { AppShell } from "@/widgets/app-shell/ui";
import { PageHeader } from "@/shared/ui/page-header";
import { LoadingState } from "@/shared/ui/loading-state";

export function ReviewsPage() {
  return (
    <AppShell>
      <main className="sb-page">
        <PageHeader
          title="후기"
          description="끝난 강의를 확인하고 들었던 강의의 후기를 남겨보세요"
        />
        <Suspense fallback={<LoadingState />}>
          <ReviewsContent />
        </Suspense>
      </main>
    </AppShell>
  );
}
