package com.somabiseo.domain.calendar.domain;

import java.time.OffsetDateTime;

public record GoogleCalendarEventResponse(
        String id,
        String title,
        OffsetDateTime startAt,
        OffsetDateTime endAt,
        String calendarId,
        String location,
        String description,
        String htmlLink,
        String status,
        String somaBiseoEventId,
        String somaBiseoEventType
) {
    private static final String CANCELLED_STATUS = "cancelled";

    public boolean isCancelled() {
        return CANCELLED_STATUS.equals(status);
    }
}
