package com.somabiseo.domain.calendar.domain;

import java.time.OffsetDateTime;
import java.util.List;

public interface GoogleCalendarClient {
    String buildAuthorizationUrl();

    void exchangeAuthorizationCode(String code);

    boolean isConnected();

    String googleAccountEmail();

    String calendarId();

    void disconnect();

    List<GoogleCalendarEventResponse> findEvents(OffsetDateTime from, OffsetDateTime to);
}
