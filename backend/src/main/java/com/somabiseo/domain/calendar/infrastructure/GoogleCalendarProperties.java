package com.somabiseo.domain.calendar.infrastructure;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "somabiseo.google-calendar")
public record GoogleCalendarProperties(
        boolean mockEnabled,
        String calendarId
) {
    public String calendarIdOrDefault() {
        return isBlank(calendarId) ? "primary" : calendarId;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
