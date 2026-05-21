package com.somabiseo.domain.portal.application;

import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.portal.infrastructure.SomaPortalClient;
import com.somabiseo.domain.portal.infrastructure.SomaPortalHtmlParser;
import com.somabiseo.domain.portal.infrastructure.SomaPortalProperties;
import com.somabiseo.domain.somaevent.domain.EventType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SomaPortalAlmostFullTest {
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
                120,
                5
        );

        service = new SomaPortalService(portalClient, htmlParser, sessionStore, properties, cacheService);

        when(cacheService.eventsFresh(any())).thenReturn(true);
    }

    @Test
    void getAlmostFullEvents는_limit_3으로_캐시를_조회하고_결과를_그대로_반환한다() {
        SomaPortalEventResponse expected = sampleEvent("event-1", 30, 28);
        when(cacheService.findAlmostFullEvents(eq(3))).thenReturn(List.of(expected));

        List<SomaPortalEventResponse> result = service.getAlmostFullEvents();

        assertThat(result).containsExactly(expected);
        verify(cacheService).findAlmostFullEvents(3);
    }

    private SomaPortalEventResponse sampleEvent(String sourceId, Integer capacity, Integer applicantCount) {
        return new SomaPortalEventResponse(
                sourceId,
                EventType.LECTURE,
                "title",
                "mentor",
                "topic",
                "location",
                NOW.plusDays(3),
                NOW.plusDays(3).plusHours(2),
                NOW.minusDays(1),
                NOW.plusDays(2),
                capacity,
                applicantCount,
                "OPEN",
                null,
                "온라인",
                null,
                NOW.minusDays(2),
                "https://example.com/event/" + sourceId,
                List.of(),
                "",
                List.of(),
                Instant.parse("2026-05-21T01:00:00Z"),
                ""
        );
    }
}
