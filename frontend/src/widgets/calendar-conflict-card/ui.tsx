import { AlertTriangle, CheckCircle2 } from "lucide-react";

import type { SomaEvent } from "@/entities/soma-event/model";
import { formatTimeRange } from "@/shared/lib/date";

export function CalendarConflictCard({ event }: { event: SomaEvent }) {
  if (!event.conflict.hasConflict) {
    return (
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 aria-hidden="true" className="size-5" />
          <p className="font-semibold">충돌 없음</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 text-amber-800">
        <AlertTriangle aria-hidden="true" className="size-5" />
        <p className="font-semibold">기존 일정과 겹쳐요</p>
      </div>
      <div className="mt-3 space-y-2">
        {event.conflict.busyBlocks.map((busy) => (
          <p key={busy.id} className="text-sm text-amber-900">
            {formatTimeRange(busy.startAt, busy.endAt)} {busy.title}
          </p>
        ))}
      </div>
    </div>
  );
}
