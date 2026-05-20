package com.somabiseo.domain.calendar.infrastructure;

import com.somabiseo.domain.calendar.domain.GoogleCalendarClient;
import com.somabiseo.domain.calendar.domain.GoogleCalendarConnectionException;
import com.somabiseo.domain.calendar.domain.GoogleCalendarEventResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;

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
                    "Google Meet",
                    null
            ),
            new GoogleCalendarEventResponse(
                    "google-event-project-review",
                    "프로젝트 리뷰",
                    OffsetDateTime.parse("2026-05-21T19:00:00+09:00"),
                    OffsetDateTime.parse("2026-05-21T20:00:00+09:00"),
                    "primary",
                    "온라인",
                    null
            ),
            new GoogleCalendarEventResponse(
                    "google-event-study",
                    "알고리즘 스터디",
                    OffsetDateTime.parse("2026-05-22T20:00:00+09:00"),
                    OffsetDateTime.parse("2026-05-22T22:00:00+09:00"),
                    "primary",
                    "부산센터",
                    null
            )
    );
    private final Set<String> connectedSessionIds = ConcurrentHashMap.newKeySet();
    private final Set<String> states = ConcurrentHashMap.newKeySet();
    private final Map<String, GoogleCalendarEventResponse> insertedEvents = new ConcurrentHashMap<>();

    @Override
    public String buildAuthorizationUrl(String sessionId) {
        String state = UUID.randomUUID().toString();
        states.add(sessionId + ":" + state);

        return "/api/calendar/oauth/google/callback?mock=true&state=" + state;
    }

    @Override
    public void exchangeAuthorizationCode(String sessionId, String code, String state) {
        if (!states.remove(sessionId + ":" + state)) {
            throw new GoogleCalendarConnectionException("Google Calendar OAuth state가 올바르지 않습니다.");
        }

        connectedSessionIds.add(sessionId);
    }

    @Override
    public boolean isConnected(String sessionId) {
        return connectedSessionIds.contains(sessionId);
    }

    @Override
    public String googleAccountEmail(String sessionId) {
        return isConnected(sessionId) ? "trainee@gmail.com" : null;
    }

    @Override
    public String calendarId() {
        return "primary";
    }

    @Override
    public void disconnect(String sessionId) {
        connectedSessionIds.remove(sessionId);
    }

    @Override
    public List<GoogleCalendarEventResponse> findEvents(String sessionId, OffsetDateTime from, OffsetDateTime to) {
        if (!isConnected(sessionId)) {
            return List.of();
        }

        return allEvents(sessionId).stream()
                .filter(event -> event.startAt().isBefore(to) && from.isBefore(event.endAt()))
                .toList();
    }

    @Override
    public Optional<GoogleCalendarEventResponse> findEvent(String sessionId, String googleEventId) {
        if (!isConnected(sessionId)) {
            return Optional.empty();
        }

        return allEvents(sessionId).stream()
                .filter((event) -> googleEventId.equals(event.id()))
                .findFirst();
    }

    @Override
    public GoogleCalendarEventResponse insertEvent(
            String sessionId,
            String title,
            String description,
            String location,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {
        GoogleCalendarEventResponse event = new GoogleCalendarEventResponse(
                "mock-google-event-" + Math.abs(title.hashCode()),
                title,
                startAt,
                endAt,
                calendarId(),
                location,
                description
        );
        insertedEvents.put(sessionId + ":" + event.id(), event);

        return event;
    }

    private List<GoogleCalendarEventResponse> allEvents(String sessionId) {
        List<GoogleCalendarEventResponse> sessionEvents = insertedEvents.entrySet().stream()
                .filter((entry) -> entry.getKey().startsWith(sessionId + ":"))
                .map(Map.Entry::getValue)
                .toList();

        return java.util.stream.Stream.concat(events.stream(), sessionEvents.stream())
                .toList();
    }
}
