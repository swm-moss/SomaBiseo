import type {
  CalendarConnection,
  CalendarConflict,
  GoogleCalendarEvent,
} from "@/entities/calendar/model";
import type { SomaEvent } from "@/entities/soma-event/model";
import { apiClient, type ApiResponse, unwrapApiResponse } from "@/shared/api/client";

export type CalendarEventLink = {
  eventId: string;
  googleEventId: string | null;
  calendarId: string;
  alreadyAdded: boolean;
};

export async function getConflictForEvent(event: SomaEvent): Promise<CalendarConflict> {
  return unwrapApiResponse(
    apiClient
      .get("calendar/conflicts", {
        searchParams: {
          eventId: event.id,
        },
      })
      .json<ApiResponse<CalendarConflict>>(),
  );
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

export async function addEventToGoogleCalendar(event: SomaEvent) {
  return unwrapApiResponse(
    apiClient
      .post(`calendar/events/${event.id}`)
      .json<ApiResponse<CalendarEventLink>>(),
  );
}

export async function getGoogleCalendarEventLink(event: SomaEvent) {
  return unwrapApiResponse(
    apiClient
      .get(`calendar/events/${event.id}/link`)
      .json<ApiResponse<CalendarEventLink>>(),
  );
}
