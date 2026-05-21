package com.somabiseo.domain.portal.application;

import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.portal.infrastructure.SomaPortalClient;
import com.somabiseo.domain.portal.infrastructure.SomaPortalHtmlParser;
import com.somabiseo.domain.portal.infrastructure.SomaPortalProperties;
import com.somabiseo.domain.somaevent.domain.EventType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Clock;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SomaPortalDeadlineSoonTest {
    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-05-21T10:00:00+09:00");

    private SomaPortalCacheService cacheService;
    private SomaPortalService service;

    @BeforeEach
    void setUp() {
        SomaPortalClient portalClient = mock(SomaPortalClient.class);
        SomaPortalHtmlParser htmlParser = mock(SomaPortalHtmlParser.class);
        SomaPortalSessionStore sessionStore = mock(SomaPortalSessionStore.class);
        cacheService = mock(SomaPortalCacheService.class);
        SomaPortalProperties properties = new SomaPortalProperties(
                "https://example.com",
                "/login",
                "/login-check",
                "/login-submit",
                "/notices",
                "/events",
                "/mento-lec",
                "/mento-lec/apply",
                "/mento-lec/cancel",
                "user",
                "pw",
                60,
                10,
                5
        );
        Clock clock = Clock.fixed(NOW.toInstant(), ZoneId.of("Asia/Seoul"));

        service = new SomaPortalService(portalClient, htmlParser, sessionStore, properties, cacheService, clock);

        when(cacheService.eventsFresh(any())).thenReturn(true);
    }

    @Test
    void getDeadlineSoonEvents는_지금부터_7일_윈도우와_3개_제한으로_캐시를_조회한다() {
        SomaPortalEventResponse expected = sampleEvent();
        when(cacheService.findDeadlineSoonEvents(any(), any(), anyInt()))
                .thenReturn(List.of(expected));

        List<SomaPortalEventResponse> result = service.getDeadlineSoonEvents();

        assertThat(result).containsExactly(expected);

        ArgumentCaptor<OffsetDateTime> fromCaptor = ArgumentCaptor.forClass(OffsetDateTime.class);
        ArgumentCaptor<OffsetDateTime> toCaptor = ArgumentCaptor.forClass(OffsetDateTime.class);
        verify(cacheService).findDeadlineSoonEvents(fromCaptor.capture(), toCaptor.capture(), eq(3));

        assertThat(fromCaptor.getValue()).isEqualTo(NOW);
        assertThat(toCaptor.getValue()).isEqualTo(NOW.plus(Duration.ofDays(7)));
    }

    private SomaPortalEventResponse sampleEvent() {
        return new SomaPortalEventResponse(
                "soma-event-1",
                EventType.LECTURE,
                "title",
                "mentor",
                "topic",
                "location",
                NOW.plusDays(3),
                NOW.plusDays(3).plusHours(2),
                NOW.minusDays(1),
                NOW.plusDays(2),
                30,
                10,
                "OPEN",
                null,
                "온라인",
                null,
                NOW.minusDays(2),
                "https://example.com/event/1",
                List.of(),
                "",
                List.of(),
                ""
        );
    }
}
