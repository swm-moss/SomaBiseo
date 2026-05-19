package com.somabiseo.domain.calendar.application;

import com.somabiseo.domain.calendar.domain.CalendarConnectionResponse;
import com.somabiseo.domain.calendar.domain.CalendarEventLinkResponse;
import com.somabiseo.domain.calendar.domain.GoogleCalendarClient;
import com.somabiseo.domain.calendar.domain.GoogleCalendarEventResponse;
import com.somabiseo.domain.somaevent.application.SomaEventService;
import com.somabiseo.domain.somaevent.domain.CalendarConflictResponse;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class CalendarService {
    private static final CalendarConnectionResponse DISCONNECTED =
            new CalendarConnectionResponse(false, null, null, null);

    private final SomaEventService somaEventService;
    private final GoogleCalendarClient googleCalendarClient;
    private final Set<String> addedEventIds = new HashSet<>();

    public CalendarService(SomaEventService somaEventService, GoogleCalendarClient googleCalendarClient) {
        this.somaEventService = somaEventService;
        this.googleCalendarClient = googleCalendarClient;
    }

    public String getConnectUrl() {
        return googleCalendarClient.buildAuthorizationUrl();
    }

    public CalendarConnectionResponse connect(String code) {
        googleCalendarClient.exchangeAuthorizationCode(code);

        return getConnection();
    }

    public CalendarConnectionResponse getConnection() {
        if (!googleCalendarClient.isConnected()) {
            return DISCONNECTED;
        }

        return new CalendarConnectionResponse(
                true,
                googleCalendarClient.googleAccountEmail(),
                googleCalendarClient.calendarId(),
                "기본 캘린더"
        );
    }

    public List<GoogleCalendarEventResponse> getGoogleEvents(OffsetDateTime from, OffsetDateTime to) {
        if (!googleCalendarClient.isConnected()) {
            return List.of();
        }

        return googleCalendarClient.findEvents(from, to);
    }

    public CalendarConnectionResponse disconnect() {
        googleCalendarClient.disconnect();
        addedEventIds.clear();

        return DISCONNECTED;
    }

    public CalendarConflictResponse getConflict(String eventId) {
        return somaEventService.findById(eventId).conflict();
    }

    public CalendarEventLinkResponse addEvent(String eventId) {
        somaEventService.findById(eventId);
        boolean alreadyAdded = !addedEventIds.add(eventId);

        return new CalendarEventLinkResponse(
                eventId,
                "mock-google-event-" + eventId,
                "primary",
                alreadyAdded
        );
    }
}
