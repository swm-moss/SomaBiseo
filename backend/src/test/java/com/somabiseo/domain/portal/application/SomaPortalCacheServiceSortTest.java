package com.somabiseo.domain.portal.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.somabiseo.domain.portal.domain.SomaPortalEventSort;
import com.somabiseo.domain.portal.infrastructure.CachedPortalEventRepository;
import com.somabiseo.domain.portal.infrastructure.CachedPortalNoticeRepository;
import com.somabiseo.domain.portal.infrastructure.CachedPortalSyncLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SomaPortalCacheServiceSortTest {
    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-05-21T10:00:00+09:00");

    private CachedPortalEventRepository eventRepository;
    private SomaPortalCacheService cacheService;

    @BeforeEach
    void setUp() {
        CachedPortalNoticeRepository noticeRepository = mock(CachedPortalNoticeRepository.class);
        eventRepository = mock(CachedPortalEventRepository.class);
        CachedPortalSyncLogRepository syncLogRepository = mock(CachedPortalSyncLogRepository.class);
        Clock clock = Clock.fixed(NOW.toInstant(), ZoneId.of("Asia/Seoul"));

        Page<com.somabiseo.domain.portal.infrastructure.CachedPortalEvent> emptyPage =
                new PageImpl<>(List.of());
        when(eventRepository.findPageOrderByStartAtAsc(any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(emptyPage);
        when(eventRepository.findPageOrderByStartAtDesc(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(emptyPage);
        when(eventRepository.findPageOrderByRegisteredAtDesc(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(emptyPage);
        when(eventRepository.findPageOrderByRemainingSeatsAsc(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(emptyPage);

        cacheService = new SomaPortalCacheService(
                noticeRepository,
                eventRepository,
                syncLogRepository,
                new ObjectMapper(),
                clock
        );
    }

    @Test
    void LECTURE_DATE_ASC는_Clock_기반_now를_리포지토리에_전달한다() {
        cacheService.getEvents(1, 10, SomaPortalEventSort.LECTURE_DATE_ASC, null, null, null, null, null);

        ArgumentCaptor<OffsetDateTime> nowCaptor = ArgumentCaptor.forClass(OffsetDateTime.class);
        verify(eventRepository).findPageOrderByStartAtAsc(
                eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), nowCaptor.capture(), any(Pageable.class)
        );
        assertThat(nowCaptor.getValue()).isEqualTo(NOW);
    }

    @Test
    void REMAINING_SEATS_ASC는_findPageOrderByRemainingSeatsAsc를_호출한다() {
        cacheService.getEvents(1, 10, SomaPortalEventSort.REMAINING_SEATS_ASC, null, null, null, null, null);

        verify(eventRepository).findPageOrderByRemainingSeatsAsc(
                eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), any(Pageable.class)
        );
    }

    @Test
    void LECTURE_DATE_DESC는_now_없이_findPageOrderByStartAtDesc를_호출한다() {
        cacheService.getEvents(1, 10, SomaPortalEventSort.LECTURE_DATE_DESC, null, null, null, null, null);

        verify(eventRepository).findPageOrderByStartAtDesc(
                eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), any(Pageable.class)
        );
    }
}
