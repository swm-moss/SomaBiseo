package com.somabiseo.domain.calendar.infrastructure;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "somabiseo.google-calendar")
public record GoogleCalendarProperties(
        String clientId,
        String clientSecret,
        String redirectUri,
        String frontendRedirectUri,
        boolean mockEnabled,
        String calendarId
) {
    public String calendarIdOrDefault() {
        return isBlank(calendarId) ? "primary" : calendarId;
    }

    public boolean isConfigured() {
        return !isBlank(clientId) && !isBlank(clientSecret) && !isBlank(redirectUri);
    }

    public String frontendRedirectUriOrDefault() {
        return isBlank(frontendRedirectUri) ? "http://localhost:3000/settings" : frontendRedirectUri;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
