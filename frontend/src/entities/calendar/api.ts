import type { CalendarConflict } from "@/entities/calendar/model";
import type { SomaEvent } from "@/entities/soma-event/model";

function overlaps(event: SomaEvent, busy: { startAt: string; endAt: string }) {
  return (
    new Date(event.startAt).getTime() < new Date(busy.endAt).getTime() &&
    new Date(event.endAt).getTime() > new Date(busy.startAt).getTime()
  );
}

export async function getConflictForEvent(event: SomaEvent): Promise<CalendarConflict> {
  const busyBlocks = event.conflict.busyBlocks.filter((busy) => overlaps(event, busy));

  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          hasConflict: busyBlocks.length > 0,
          busyBlocks,
        }),
      220,
    );
  });
}
