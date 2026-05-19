package com.somabiseo.domain.calendar.infrastructure;

import com.somabiseo.domain.calendar.domain.GoogleCalendarClient;
import com.somabiseo.domain.calendar.domain.GoogleCalendarEventResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

@Component
@ConditionalOnProperty(name = "somabiseo.google-calendar.mock-enabled", havingValue = "true")
public class MockGoogleCalendarClient implements GoogleCalendarClient {
    private final List<GoogleCalendarEventResponse> events = List.of(
            new GoogleCalendarEventResponse(
                    "google-event-team-meeting",
                    "팀 회의",
                    OffsetDateTime.parse("2026-05-20T15:00:00+09:00"),
                    OffsetDateTime.parse("2026-05-20T16:00:00+09:00"),
                    "primary",
                    "Google Meet"
            ),
            new GoogleCalendarEventResponse(
                    "google-event-project-review",
                    "프로젝트 리뷰",
                    OffsetDateTime.parse("2026-05-21T19:00:00+09:00"),
                    OffsetDateTime.parse("2026-05-21T20:00:00+09:00"),
                    "primary",
                    "온라인"
            ),
            new GoogleCalendarEventResponse(
                    "google-event-study",
                    "알고리즘 스터디",
                    OffsetDateTime.parse("2026-05-22T20:00:00+09:00"),
                    OffsetDateTime.parse("2026-05-22T22:00:00+09:00"),
                    "primary",
                    "부산센터"
            )
    );
    private boolean connected;

    @Override
    public String buildAuthorizationUrl() {
        return "/api/calendar/google/callback?mock=true";
    }

    @Override
    public void exchangeAuthorizationCode(String code) {
        connected = true;
    }

    @Override
    public boolean isConnected() {
        return connected;
    }

    @Override
    public String googleAccountEmail() {
        return connected ? "trainee@gmail.com" : null;
    }

    @Override
    public String calendarId() {
        return "primary";
    }

    @Override
    public void disconnect() {
        connected = false;
    }

    @Override
    public List<GoogleCalendarEventResponse> findEvents(OffsetDateTime from, OffsetDateTime to) {
        if (!connected) {
            return List.of();
        }

        return events.stream()
                .filter(event -> event.startAt().isBefore(to) && from.isBefore(event.endAt()))
                .toList();
    }
}
