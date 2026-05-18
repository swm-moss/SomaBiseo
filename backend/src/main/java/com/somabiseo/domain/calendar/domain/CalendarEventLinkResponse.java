package com.somabiseo.domain.calendar.domain;

public record CalendarEventLinkResponse(
        String eventId,
        String googleEventId,
        String calendarId,
        boolean alreadyAdded
) {
}
