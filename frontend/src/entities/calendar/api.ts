import type {
  CalendarConnection,
  CalendarConflict,
  GoogleCalendarEvent,
} from "@/entities/calendar/model";
import type { SomaEvent } from "@/entities/soma-event/model";
import { apiClient, type ApiResponse, unwrapApiResponse } from "@/shared/api/client";

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

export async function getGoogleCalendarConnection() {
  return unwrapApiResponse(
    apiClient.get("calendar/google/status").json<ApiResponse<CalendarConnection>>(),
  );
}

export async function getGoogleCalendarConnectUrl() {
  return unwrapApiResponse(
    apiClient.get("calendar/google/connect-url").json<ApiResponse<{ url: string }>>(),
  );
}

export async function disconnectGoogleCalendar() {
  return unwrapApiResponse(
    apiClient.delete("calendar/google/connection").json<ApiResponse<CalendarConnection>>(),
  );
}

export async function getGoogleCalendarEvents(from: string, to: string) {
  return unwrapApiResponse(
    apiClient
      .get("calendar/google/events", {
        searchParams: {
          from,
          to,
        },
      })
      .json<ApiResponse<GoogleCalendarEvent[]>>(),
  );
}
