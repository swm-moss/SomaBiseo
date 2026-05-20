package com.somabiseo.domain.calendar.domain;

public record CalendarConnectionResponse(
        boolean connected,
        String googleAccountEmail,
        String calendarId,
        String calendarName
) {
}
