package com.somabiseo.domain.portal.application;

import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.portal.domain.SomaPortalEventSort;
import com.somabiseo.domain.portal.domain.SomaPortalPageResponse;
import com.somabiseo.domain.portal.infrastructure.SomaPortalClient;
import com.somabiseo.domain.portal.infrastructure.SomaPortalHtmlParser;
import com.somabiseo.domain.portal.infrastructure.SomaPortalProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.net.CookieManager;
import java.net.http.HttpClient;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SomaPortalEventSwrTest {
    private SomaPortalClient portalClient;
    private SomaPortalHtmlParser htmlParser;
    private SomaPortalCacheService cacheService;
    private SomaPortalService service;

    @BeforeEach
    void setUp() {
        portalClient = mock(SomaPortalClient.class);
        htmlParser = mock(SomaPortalHtmlParser.class);
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

        when(cacheService.getEvents(anyInt(), anyInt(), any(), any(), any(), any(), any(), any()))
                .thenReturn(emptyPage());
        when(cacheService.findDisplayDetailHydrationCandidates(anyInt())).thenReturn(List.of());
    }

    @Test
    void 캐시가_신선하면_동기_sync_없이_즉시_반환하고_refreshing은_false다() {
        when(cacheService.hasEvents()).thenReturn(true);
        when(cacheService.eventsFresh(any())).thenReturn(true);

        SomaPortalPageResponse<SomaPortalEventResponse> response = getPublicEvents();

        assertThat(response.refreshing()).isFalse();
        verify(portalClient, never()).login(any(), any());
    }

    @Test
    void 캐시가_stale면_요청_스레드에서_동기로_sync하지_않고_refreshing_true로_즉시_반환한다() {
        when(cacheService.hasEvents()).thenReturn(true);
        when(cacheService.eventsFresh(any())).thenReturn(false);

        SomaPortalPageResponse<SomaPortalEventResponse> response = getPublicEvents();

        assertThat(response.refreshing()).isTrue();
        // 동기화는 백그라운드 스레드에서만 일어나므로 요청 반환 시점에는 캐시 페이지가 즉시 반환된다.
        verify(cacheService).getEvents(anyInt(), anyInt(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void 캐시가_비어있는_콜드스타트는_요청_스레드에서_동기로_로그인_후_sync를_수행한다() {
        when(cacheService.hasEvents()).thenReturn(false);
        when(cacheService.eventsFresh(any())).thenReturn(false);
        when(portalClient.login("user", "pw"))
                .thenReturn(new SomaPortalClient.LoginResult(new CookieManager(), HttpClient.newHttpClient()));
        when(portalClient.getEventsHtml(any(), anyInt())).thenReturn("<html></html>");
        when(htmlParser.parseEvents(any(), any())).thenReturn(List.of());
        when(htmlParser.parseTotalPages(any(), anyInt())).thenReturn(1);

        getPublicEvents();

        // 콜드 스타트에서는 요청 스레드가 직접 오퍼레이터 로그인 후 동기화를 마치고 성공을 기록한다.
        verify(portalClient, Mockito.atLeastOnce()).login("user", "pw");
        verify(cacheService).markEventSyncSuccess(eq(1));
    }

    private SomaPortalPageResponse<SomaPortalEventResponse> getPublicEvents() {
        return service.getPublicEvents(1, SomaPortalEventSort.LECTURE_DATE_DESC, null, null, null, null, null);
    }

    private static SomaPortalPageResponse<SomaPortalEventResponse> emptyPage() {
        return new SomaPortalPageResponse<>(List.of(), 1, 1, false);
    }
}
