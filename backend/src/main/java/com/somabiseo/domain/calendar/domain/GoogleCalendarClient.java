package com.somabiseo.domain.calendar.domain;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface GoogleCalendarClient {
    String buildAuthorizationUrl(String sessionId);

    void exchangeAuthorizationCode(String sessionId, String code, String state);

    boolean isConnected(String sessionId);

    String googleAccountEmail(String sessionId);

    String calendarId();

    void disconnect(String sessionId);

    List<GoogleCalendarEventResponse> findEvents(String sessionId, OffsetDateTime from, OffsetDateTime to);

    Optional<GoogleCalendarEventResponse> findEvent(String sessionId, String googleEventId);

    GoogleCalendarEventResponse insertEvent(
            String sessionId,
            String title,
            String description,
            String location,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    );
}
