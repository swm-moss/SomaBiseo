import type { CalendarConflict } from "@/entities/calendar/model";
import type { SomaEvent } from "@/entities/soma-event/model";
import { apiClient, type ApiResponse, unwrapApiResponse } from "@/shared/api/client";

type GoogleConnectUrlResponse = {
  url: string;
};

function overlaps(event: SomaEvent, busy: { startAt: string; endAt: string }) {
  if (!event.startAt || !event.endAt) {
    return false;
  }

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

export async function getGoogleCalendarConnectUrl(returnTo: string) {
  return unwrapApiResponse(
    apiClient
      .get("calendar/google/connect-url", {
        searchParams: {
          returnTo,
        },
      })
      .json<ApiResponse<GoogleConnectUrlResponse>>(),
  );
}
