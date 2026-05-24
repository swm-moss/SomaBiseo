package com.somabiseo.domain.calendar.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.somabiseo.domain.calendar.domain.CalendarConflictStatusResponse;
import com.somabiseo.domain.calendar.domain.GoogleCalendarClient;
import com.somabiseo.domain.calendar.domain.GoogleCalendarEventLink;
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
import static org.mockito.Mockito.verify;
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
                somaBiseoGoogleEvent("google-self", "내 캘린더에 추가된 소마 일정", START_AT, END_AT, EVENT_ID),
                googleEvent("busy-1", "개인 일정", START_AT.plusMinutes(30), START_AT.plusHours(1), null)
        ));

        CalendarConflictResponse conflict = calendarService.getConflict(SESSION_ID, EVENT_ID);

        assertThat(conflict.hasConflict()).isTrue();
        assertThat(conflict.busyBlocks())
                .extracting(BusyBlockResponse::id)
                .containsExactly("busy-1");
    }

    @Test
    void doesNotTreatPrefixMatchedEventIdMarkerAsAlreadyAdded() {
        String prefixEventId = "qustnrSn-1";
        givenEvent(prefixEventId, START_AT, END_AT);
        when(googleCalendarClient.isConnected(SESSION_ID)).thenReturn(true);
        when(googleCalendarClient.findEvents(SESSION_ID, START_AT, END_AT)).thenReturn(List.of(
                googleEvent(
                        "google-other-soma",
                        "다른 소마 일정",
                        START_AT,
                        END_AT,
                        "SomaBiseo Event ID: qustnrSn-123"
                )
        ));

        CalendarConflictResponse conflict = calendarService.getConflict(SESSION_ID, prefixEventId);

        assertThat(conflict.hasConflict()).isTrue();
        assertThat(conflict.busyBlocks())
                .extracting(BusyBlockResponse::id)
                .containsExactly("google-other-soma");
    }

    @Test
    void checksConflictStatusesForCurrentPageEventsAtOnce() {
        String secondEventId = "soma-event-2";
        OffsetDateTime secondStartAt = START_AT.plusDays(1);
        OffsetDateTime secondEndAt = END_AT.plusDays(1);
        givenEvent();
        givenEvent(secondEventId, secondStartAt, secondEndAt);
        GoogleCalendarEventLink addedLink = GoogleCalendarEventLink.pending(SESSION_ID, EVENT_ID, "primary");
        addedLink.markCreated("google-self");
        when(googleCalendarClient.isConnected(SESSION_ID)).thenReturn(true);
        when(googleCalendarClient.calendarId()).thenReturn("primary");
        when(googleCalendarEventLinkRepository.findByCalendarSessionIdAndSourceIdInAndCalendarId(
                SESSION_ID,
                List.of(EVENT_ID, secondEventId),
                "primary"
        )).thenReturn(List.of(addedLink));
        when(googleCalendarClient.findEvents(SESSION_ID, START_AT, secondEndAt)).thenReturn(List.of(
                somaBiseoGoogleEvent("google-self", "내 캘린더에 추가된 소마 일정", START_AT, END_AT, EVENT_ID),
                googleEvent("busy-1", "개인 일정", secondStartAt.plusMinutes(30), secondStartAt.plusHours(1), null)
        ));

        List<CalendarConflictStatusResponse> statuses = calendarService.getConflictStatuses(
                SESSION_ID,
                List.of(EVENT_ID, secondEventId)
        );

        assertThat(statuses).hasSize(2);
        assertThat(statuses.get(0).eventId()).isEqualTo(EVENT_ID);
        assertThat(statuses.get(0).alreadyAdded()).isTrue();
        assertThat(statuses.get(0).hasConflict()).isFalse();
        assertThat(statuses.get(1).eventId()).isEqualTo(secondEventId);
        assertThat(statuses.get(1).alreadyAdded()).isFalse();
        assertThat(statuses.get(1).hasConflict()).isTrue();
        assertThat(statuses.get(1).busyBlocks())
                .extracting(BusyBlockResponse::id)
                .containsExactly("busy-1");
        verify(googleCalendarClient).findEvents(SESSION_ID, START_AT, secondEndAt);
    }

    @Test
    void addsCalendarEventWithPrivatePropertiesAndVisibleDescriptionOnly() {
        givenEvent();
        GoogleCalendarEventLink pendingLink = GoogleCalendarEventLink.pending(SESSION_ID, EVENT_ID, "primary");
        when(googleCalendarClient.calendarId()).thenReturn("primary");
        when(googleCalendarClient.isConnected(SESSION_ID)).thenReturn(true);
        when(googleCalendarEventLinkRepository.findByCalendarSessionIdAndSourceIdAndCalendarId(
                SESSION_ID,
                EVENT_ID,
                "primary"
        )).thenReturn(Optional.empty(), Optional.of(pendingLink));
        when(googleCalendarEventLinkRepository.insertPending(SESSION_ID, EVENT_ID, "primary")).thenReturn(1);
        when(googleCalendarClient.insertEvent(
                SESSION_ID,
                "Backend",
                "특강 설명",
                EVENT_ID,
                "LECTURE",
                "부산센터",
                START_AT,
                END_AT
        )).thenReturn(somaBiseoGoogleEvent("google-event-1", "Backend", START_AT, END_AT, EVENT_ID));

        var response = calendarService.addEvent(SESSION_ID, EVENT_ID);

        assertThat(response.googleEventId()).isEqualTo("google-event-1");
        verify(googleCalendarClient).insertEvent(
                SESSION_ID,
                "Backend",
                "특강 설명",
                EVENT_ID,
                "LECTURE",
                "부산센터",
                START_AT,
                END_AT
        );
    }

    private void givenEvent() {
        givenEvent(EVENT_ID, START_AT, END_AT);
    }

    private void givenEvent(String eventId, OffsetDateTime startAt, OffsetDateTime endAt) {
        when(cachedPortalEventRepository.findBySourceId(eventId)).thenReturn(Optional.empty());
        when(somaEventService.findById(eventId)).thenReturn(new SomaEventResponse(
                eventId,
                eventId,
                EventType.LECTURE,
                "소마 특강",
                "멘토",
                "Backend",
                "특강 설명",
                "부산센터",
                startAt,
                endAt,
                startAt.minusDays(2),
                startAt.minusDays(1),
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
                description,
                null,
                null
        );
    }

    private GoogleCalendarEventResponse somaBiseoGoogleEvent(
            String id,
            String title,
            OffsetDateTime startAt,
            OffsetDateTime endAt,
            String somaBiseoEventId
    ) {
        return new GoogleCalendarEventResponse(
                id,
                title,
                startAt,
                endAt,
                "primary",
                null,
                null,
                somaBiseoEventId,
                "LECTURE"
        );
    }
}
