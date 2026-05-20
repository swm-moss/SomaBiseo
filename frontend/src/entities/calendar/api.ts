import type {
  CalendarConnection,
  CalendarConflict,
  GoogleCalendarEvent,
} from "@/entities/calendar/model";
import type { SomaEvent } from "@/entities/soma-event/model";
import { useAuthStore } from "@/features/auth/model";
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
        headers: authHeaders(),
        searchParams: {
          eventId: event.id,
        },
      })
      .json<ApiResponse<CalendarConflict>>(),
  );
}

export async function getGoogleCalendarConnection() {
  return unwrapApiResponse(
    apiClient
      .get("calendar/google/status", {
        headers: authHeaders(),
      })
      .json<ApiResponse<CalendarConnection>>(),
  );
}

export async function getGoogleCalendarConnectUrl(returnTo?: string) {
  return unwrapApiResponse(
    apiClient
      .get("calendar/oauth/google/connect-url", {
        searchParams: returnTo
          ? {
              returnTo,
            }
          : undefined,
      })
      .json<ApiResponse<{ url: string }>>(),
  );
}

export async function disconnectGoogleCalendar() {
  return unwrapApiResponse(
    apiClient
      .delete("calendar/google/connection", {
        headers: authHeaders(),
      })
      .json<ApiResponse<CalendarConnection>>(),
  );
}

export async function getGoogleCalendarEvents(from: string, to: string) {
  return unwrapApiResponse(
    apiClient
      .get("calendar/google/events", {
        headers: authHeaders(),
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
      .post(`calendar/events/${event.id}`, {
        headers: authHeaders(),
      })
      .json<ApiResponse<CalendarEventLink>>(),
  );
}

export async function getGoogleCalendarEventLink(event: SomaEvent) {
  return unwrapApiResponse(
    apiClient
      .get(`calendar/events/${event.id}/link`, {
        headers: authHeaders(),
      })
      .json<ApiResponse<CalendarEventLink>>(),
  );
}

function authHeaders() {
  const sessionId = useAuthStore.getState().sessionId;

  return sessionId
    ? {
        Authorization: `Bearer ${sessionId}`,
      }
    : undefined;
}
