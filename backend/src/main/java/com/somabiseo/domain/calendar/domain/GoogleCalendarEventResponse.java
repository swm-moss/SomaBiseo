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
        String somaBiseoEventId,
        String somaBiseoEventType
) {
}
