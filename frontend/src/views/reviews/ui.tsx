import { Suspense } from "react";

import { ReviewsContent } from "@/views/reviews/content";
import { AppShell } from "@/widgets/app-shell/ui";
import { LoadingState } from "@/shared/ui/loading-state";

export function ReviewsPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-[480px] px-5 pb-28 pt-7 sm:px-6 lg:max-w-[1200px] lg:px-10 lg:pb-14 lg:pt-10">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[26px] font-black leading-[35px] text-foreground lg:text-[30px] lg:leading-[40px]">
              후기
            </h1>
            <p className="mt-2 text-[15px] leading-[22px] text-muted-foreground">
              끝난 강의를 확인하고 들었던 강의의 후기를 남겨보세요
            </p>
          </div>
        </header>
        <Suspense fallback={<LoadingState />}>
          <ReviewsContent />
        </Suspense>
      </main>
    </AppShell>
  );
}
