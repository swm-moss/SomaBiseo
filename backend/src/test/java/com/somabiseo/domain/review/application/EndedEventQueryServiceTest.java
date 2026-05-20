package com.somabiseo.domain.review.application;

import com.somabiseo.domain.review.domain.EndedEventResponse;
import com.somabiseo.domain.review.infrastructure.ReviewRepository;
import com.somabiseo.domain.review.infrastructure.ReviewSummaryRow;
import com.somabiseo.domain.review.presentation.EndedEventPageResponse;
import com.somabiseo.domain.somaevent.domain.EventType;
import com.somabiseo.domain.somaevent.domain.SomaEvent;
import com.somabiseo.domain.somaevent.infrastructure.SomaEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.lang.reflect.Field;
import java.time.Clock;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EndedEventQueryServiceTest {
    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-05-22T10:00:00+09:00");

    private SomaEventRepository somaEventRepository;
    private ReviewRepository reviewRepository;
    private EndedEventQueryService service;

    @BeforeEach
    void setUp() {
        somaEventRepository = mock(SomaEventRepository.class);
        reviewRepository = mock(ReviewRepository.class);
        Clock clock = Clock.fixed(NOW.toInstant(), ZoneId.of("Asia/Seoul"));

        service = new EndedEventQueryService(somaEventRepository, reviewRepository, clock);
    }

    @Test
    void find_type가_null이면_null로_전달되고_q는_정규화된다() {
        when(somaEventRepository.findEndedEvents(any(), any(), any(), any(), any(), any())).thenReturn(Page.empty());

        service.find(null, "  AI  ", null, 1, 10);

        ArgumentCaptor<String> typeCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> qCaptor = ArgumentCaptor.forClass(String.class);
        verify(somaEventRepository).findEndedEvents(eq(NOW), typeCaptor.capture(), qCaptor.capture(), any(), any(), any());
        assertThat(typeCaptor.getValue()).isNull();
        assertThat(qCaptor.getValue()).isEqualTo("AI");
    }

    @Test
    void find_빈문자열_q는_null로_전달되고_type은_enum_name으로_변환() {
        when(somaEventRepository.findEndedEvents(any(), any(), any(), any(), any(), any())).thenReturn(Page.empty());

        service.find(EventType.LECTURE, "   ", null, 1, 10);

        verify(somaEventRepository).findEndedEvents(any(), eq("LECTURE"), eq(null), any(), any(), any());
    }

    @Test
    void find_pageable은_1_기반을_0_기반으로_변환하고_startAt_desc_정렬을_전달() {
        when(somaEventRepository.findEndedEvents(any(), any(), any(), any(), any(), any())).thenReturn(Page.empty());

        service.find(null, null, null, 3, 25);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(somaEventRepository).findEndedEvents(any(), any(), any(), any(), any(), captor.capture());
        Pageable pageable = captor.getValue();
        assertThat(pageable.getPageNumber()).isEqualTo(2);
        assertThat(pageable.getPageSize()).isEqualTo(25);
        Sort.Order startOrder = pageable.getSort().getOrderFor("startAt");
        assertThat(startOrder).isNotNull();
        assertThat(startOrder.getDirection()).isEqualTo(Sort.Direction.DESC);
        Sort.Order idOrder = pageable.getSort().getOrderFor("id");
        assertThat(idOrder).isNotNull();
        assertThat(idOrder.getDirection()).isEqualTo(Sort.Direction.DESC);
    }

    @Test
    void find_size는_1_이상_100_이하로_clamp() {
        when(somaEventRepository.findEndedEvents(any(), any(), any(), any(), any(), any())).thenReturn(Page.empty());

        service.find(null, null, null, 1, 0);
        service.find(null, null, null, 1, 999);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(somaEventRepository, org.mockito.Mockito.times(2))
                .findEndedEvents(any(), any(), any(), any(), any(), captor.capture());
        assertThat(captor.getAllValues().get(0).getPageSize()).isEqualTo(1);
        assertThat(captor.getAllValues().get(1).getPageSize()).isEqualTo(100);
    }

    @Test
    void find_date가_주어지면_그날_KST_경계로_dayStart와_dayEnd가_전달() {
        when(somaEventRepository.findEndedEvents(any(), any(), any(), any(), any(), any())).thenReturn(Page.empty());

        service.find(null, null, LocalDate.of(2026, 5, 20), 1, 10);

        ArgumentCaptor<OffsetDateTime> startCaptor = ArgumentCaptor.forClass(OffsetDateTime.class);
        ArgumentCaptor<OffsetDateTime> endCaptor = ArgumentCaptor.forClass(OffsetDateTime.class);
        verify(somaEventRepository).findEndedEvents(
                any(), any(), any(), startCaptor.capture(), endCaptor.capture(), any());
        assertThat(startCaptor.getValue()).isEqualTo(OffsetDateTime.parse("2026-05-20T00:00:00+09:00"));
        assertThat(endCaptor.getValue()).isEqualTo(OffsetDateTime.parse("2026-05-21T00:00:00+09:00"));
    }

    @Test
    void find_date가_null이면_매우_넓은_경계로_dayStart와_dayEnd가_전달() {
        when(somaEventRepository.findEndedEvents(any(), any(), any(), any(), any(), any())).thenReturn(Page.empty());

        service.find(null, null, null, 1, 10);

        ArgumentCaptor<OffsetDateTime> startCaptor = ArgumentCaptor.forClass(OffsetDateTime.class);
        ArgumentCaptor<OffsetDateTime> endCaptor = ArgumentCaptor.forClass(OffsetDateTime.class);
        verify(somaEventRepository).findEndedEvents(
                any(), any(), any(), startCaptor.capture(), endCaptor.capture(), any());
        assertThat(startCaptor.getValue().getYear()).isEqualTo(1970);
        assertThat(endCaptor.getValue().getYear()).isEqualTo(9999);
    }

    @Test
    void find_각_이벤트의_reviewCount가_매핑되고_없는_경우_0() {
        SomaEvent eventA = somaEventWith(11L, "soma-a", "AI 입문", "정멘토",
                OffsetDateTime.parse("2026-05-20T15:00:00+09:00"),
                OffsetDateTime.parse("2026-05-20T17:00:00+09:00"));
        SomaEvent eventB = somaEventWith(22L, "soma-b", "백엔드 멘토링", null,
                OffsetDateTime.parse("2026-05-19T10:00:00+09:00"),
                OffsetDateTime.parse("2026-05-19T12:00:00+09:00"));
        Page<SomaEvent> page = new PageImpl<>(List.of(eventA, eventB), PageRequest.of(0, 10), 2);
        when(somaEventRepository.findEndedEvents(any(), any(), any(), any(), any(), any())).thenReturn(page);
        when(reviewRepository.findSummariesIn(List.of(11L, 22L)))
                .thenReturn(List.of(new ReviewSummaryRow(11L, 4L, null)));

        EndedEventPageResponse response = service.find(null, null, null, 1, 10);

        assertThat(response.items()).hasSize(2);
        EndedEventResponse first = response.items().get(0);
        assertThat(first.eventId()).isEqualTo("soma-a");
        assertThat(first.startAt()).isEqualTo(OffsetDateTime.parse("2026-05-20T15:00:00+09:00"));
        assertThat(first.endAt()).isEqualTo(OffsetDateTime.parse("2026-05-20T17:00:00+09:00"));
        assertThat(first.reviewCount()).isEqualTo(4L);
        EndedEventResponse second = response.items().get(1);
        assertThat(second.eventId()).isEqualTo("soma-b");
        assertThat(second.mentorName()).isNull();
        assertThat(second.reviewCount()).isEqualTo(0L);
        assertThat(response.page()).isEqualTo(1);
        assertThat(response.totalElements()).isEqualTo(2);
    }

    private SomaEvent somaEventWith(
            Long id,
            String sourceId,
            String title,
            String mentorName,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {
        try {
            java.lang.reflect.Constructor<SomaEvent> constructor = SomaEvent.class.getDeclaredConstructor();
            constructor.setAccessible(true);
            SomaEvent event = constructor.newInstance();
            setField(event, "id", id);
            setField(event, "sourceId", sourceId);
            setField(event, "type", EventType.LECTURE);
            setField(event, "title", title);
            setField(event, "mentorName", mentorName);
            setField(event, "startAt", startAt);
            setField(event, "endAt", endAt);
            setField(event, "sourceUrl", "https://swmaestro.org");

            return event;
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }

    private static void setField(Object target, String name, Object value) {
        try {
            Field field = findField(target.getClass(), name);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }

    private static Field findField(Class<?> type, String name) throws NoSuchFieldException {
        Class<?> current = type;

        while (current != null) {
            try {
                return current.getDeclaredField(name);
            } catch (NoSuchFieldException ignored) {
                current = current.getSuperclass();
            }
        }

        throw new NoSuchFieldException(name);
    }
}
