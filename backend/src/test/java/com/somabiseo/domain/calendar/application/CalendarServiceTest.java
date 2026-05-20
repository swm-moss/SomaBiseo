package com.somabiseo.domain.calendar.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.somabiseo.domain.calendar.domain.GoogleCalendarClient;
import com.somabiseo.domain.calendar.domain.GoogleCalendarEventResponse;
import com.somabiseo.domain.calendar.infrastructure.GoogleCalendarEventLinkRepository;
import com.somabiseo.domain.portal.infrastructure.CachedPortalEventRepository;
import com.somabiseo.domain.somaevent.application.SomaEventService;
import com.somabiseo.domain.somaevent.domain.BusyBlockResponse;
import com.somabiseo.domain.somaevent.domain.CalendarConflictResponse;
import com.somabiseo.domain.somaevent.domain.EventStatus;
import com.somabiseo.domain.somaevent.domain.EventType;
import com.somabiseo.domain.somaevent.domain.SomaEventResponse;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CalendarServiceTest {
    private static final String SESSION_ID = "session-1";
    private static final String EVENT_ID = "soma-event-1";
    private static final OffsetDateTime START_AT = OffsetDateTime.parse("2026-05-22T10:00:00+09:00");
    private static final OffsetDateTime END_AT = OffsetDateTime.parse("2026-05-22T12:00:00+09:00");

    private final SomaEventService somaEventService = mock(SomaEventService.class);
    private final GoogleCalendarClient googleCalendarClient = mock(GoogleCalendarClient.class);
    private final CachedPortalEventRepository cachedPortalEventRepository = mock(CachedPortalEventRepository.class);
    private final GoogleCalendarEventLinkRepository googleCalendarEventLinkRepository =
            mock(GoogleCalendarEventLinkRepository.class);
    private final CalendarService calendarService = new CalendarService(
            somaEventService,
            googleCalendarClient,
            cachedPortalEventRepository,
            googleCalendarEventLinkRepository,
            new ObjectMapper()
    );

    @Test
    void excludesAlreadyAddedSomaEventFromConflict() {
        givenEvent();
        when(googleCalendarClient.isConnected(SESSION_ID)).thenReturn(true);
        when(googleCalendarClient.findEvents(SESSION_ID, START_AT, END_AT)).thenReturn(List.of(
                googleEvent("google-self", "내 캘린더에 추가된 소마 일정", START_AT, END_AT, "SomaBiseo Event ID: " + EVENT_ID)
        ));

        CalendarConflictResponse conflict = calendarService.getConflict(SESSION_ID, EVENT_ID);

        assertThat(conflict.hasConflict()).isFalse();
        assertThat(conflict.busyBlocks()).isEmpty();
    }

    @Test
    void keepsOtherOverlappingEventsAsConflict() {
        givenEvent();
        when(googleCalendarClient.isConnected(SESSION_ID)).thenReturn(true);
        when(googleCalendarClient.findEvents(SESSION_ID, START_AT, END_AT)).thenReturn(List.of(
                googleEvent("google-self", "내 캘린더에 추가된 소마 일정", START_AT, END_AT, "SomaBiseo Event ID: " + EVENT_ID),
                googleEvent("busy-1", "개인 일정", START_AT.plusMinutes(30), START_AT.plusHours(1), null)
        ));

        CalendarConflictResponse conflict = calendarService.getConflict(SESSION_ID, EVENT_ID);

        assertThat(conflict.hasConflict()).isTrue();
        assertThat(conflict.busyBlocks())
                .extracting(BusyBlockResponse::id)
                .containsExactly("busy-1");
    }

    private void givenEvent() {
        when(cachedPortalEventRepository.findBySourceId(EVENT_ID)).thenReturn(Optional.empty());
        when(somaEventService.findById(EVENT_ID)).thenReturn(new SomaEventResponse(
                EVENT_ID,
                EVENT_ID,
                EventType.LECTURE,
                "소마 특강",
                "멘토",
                "Backend",
                "특강 설명",
                "부산센터",
                START_AT,
                END_AT,
                START_AT.minusDays(2),
                START_AT.minusDays(1),
                30,
                EventStatus.OPEN,
                "https://swmaestro.org",
                new CalendarConflictResponse(false, List.of())
        ));
    }

    private GoogleCalendarEventResponse googleEvent(
            String id,
            String title,
            OffsetDateTime startAt,
            OffsetDateTime endAt,
            String description
    ) {
        return new GoogleCalendarEventResponse(
                id,
                title,
                startAt,
                endAt,
                "primary",
                null,
                description
        );
    }
}
