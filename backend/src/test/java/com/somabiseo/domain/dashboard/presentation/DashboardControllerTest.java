package com.somabiseo.domain.dashboard.presentation;

import com.somabiseo.domain.notice.application.NoticeService;
import com.somabiseo.domain.somaevent.application.SomaEventService;
import com.somabiseo.domain.somaevent.domain.CalendarConflictResponse;
import com.somabiseo.domain.somaevent.domain.EventStatus;
import com.somabiseo.domain.somaevent.domain.EventType;
import com.somabiseo.domain.somaevent.domain.SomaEventResponse;
import com.somabiseo.global.response.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DashboardControllerTest {
    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-05-21T10:00:00+09:00");
    private static final CalendarConflictResponse NO_CONFLICT = new CalendarConflictResponse(false, List.of());

    private SomaEventService somaEventService;
    private NoticeService noticeService;
    private DashboardController controller;

    @BeforeEach
    void setUp() {
        somaEventService = mock(SomaEventService.class);
        noticeService = mock(NoticeService.class);
        Clock clock = Clock.fixed(NOW.toInstant(), ZoneId.of("Asia/Seoul"));

        controller = new DashboardController(somaEventService, noticeService, clock);
        when(noticeService.findAll(any())).thenReturn(List.of());
    }

    @Test
    void deadlineSoonEvents는_지금부터_7일이내_OPEN_이벤트만_마감일_오름차순으로_반환한다() {
        SomaEventResponse closedSoon = event("closed", EventStatus.CLOSED, NOW.plusHours(1));
        SomaEventResponse openInWindow1 = event("open-1", EventStatus.OPEN, NOW.plusDays(2));
        SomaEventResponse openInWindow2 = event("open-2", EventStatus.OPEN, NOW.plusDays(6));
        SomaEventResponse openInWindowEarliest = event("open-0", EventStatus.OPEN, NOW.plusHours(3));
        SomaEventResponse openOutsideWindow = event("open-out", EventStatus.OPEN, NOW.plusDays(8));
        SomaEventResponse openAlreadyPassed = event("open-past", EventStatus.OPEN, NOW.minusHours(1));
        when(somaEventService.findAll(null)).thenReturn(List.of(
                closedSoon,
                openInWindow1,
                openInWindow2,
                openInWindowEarliest,
                openOutsideWindow,
                openAlreadyPassed
        ));

        ApiResponse<DashboardController.DashboardResponse> response = controller.getDashboard();

        assertThat(response.data().deadlineSoonEvents())
                .extracting(SomaEventResponse::id)
                .containsExactly("open-0", "open-1", "open-2");
    }

    @Test
    void deadlineSoonEvents는_최대_3개로_제한된다() {
        List<SomaEventResponse> manyOpen = List.of(
                event("o1", EventStatus.OPEN, NOW.plusHours(1)),
                event("o2", EventStatus.OPEN, NOW.plusHours(2)),
                event("o3", EventStatus.OPEN, NOW.plusHours(3)),
                event("o4", EventStatus.OPEN, NOW.plusHours(4)),
                event("o5", EventStatus.OPEN, NOW.plusHours(5))
        );
        when(somaEventService.findAll(null)).thenReturn(manyOpen);

        ApiResponse<DashboardController.DashboardResponse> response = controller.getDashboard();

        assertThat(response.data().deadlineSoonEvents()).hasSize(3);
    }

    @Test
    void applicationEndAt이_null이면_deadlineSoonEvents에서_제외된다() {
        SomaEventResponse openWithoutEnd = event("no-end", EventStatus.OPEN, null);
        SomaEventResponse openInWindow = event("in", EventStatus.OPEN, NOW.plusDays(1));
        when(somaEventService.findAll(null)).thenReturn(List.of(openWithoutEnd, openInWindow));

        ApiResponse<DashboardController.DashboardResponse> response = controller.getDashboard();

        assertThat(response.data().deadlineSoonEvents())
                .extracting(SomaEventResponse::id)
                .containsExactly("in");
    }

    @Test
    void upcomingEvents는_종료되지_않은_이벤트만_반환한다() {
        SomaEventResponse ended = event(
                "ended",
                EventStatus.OPEN,
                NOW.plusDays(1),
                NOW.minusDays(1),
                NOW.minusHours(1)
        );
        SomaEventResponse ongoing = event(
                "ongoing",
                EventStatus.OPEN,
                NOW.plusDays(1),
                NOW.minusHours(1),
                NOW.plusHours(1)
        );
        SomaEventResponse future = event(
                "future",
                EventStatus.OPEN,
                NOW.plusDays(1),
                NOW.plusDays(2),
                NOW.plusDays(2).plusHours(1)
        );
        when(somaEventService.findAll(null)).thenReturn(List.of(ended, ongoing, future));

        ApiResponse<DashboardController.DashboardResponse> response = controller.getDashboard();

        assertThat(response.data().upcomingEvents())
                .extracting(SomaEventResponse::id)
                .containsExactly("ongoing", "future");
    }

    private SomaEventResponse event(String id, EventStatus status, OffsetDateTime applicationEndAt) {
        return event(id, status, applicationEndAt, NOW.plusDays(10), NOW.plusDays(10).plusHours(1));
    }

    private SomaEventResponse event(
            String id,
            EventStatus status,
            OffsetDateTime applicationEndAt,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {
        return new SomaEventResponse(
                id,
                "source-" + id,
                EventType.LECTURE,
                "title",
                "mentor",
                "topic",
                "description",
                "location",
                startAt,
                endAt,
                NOW.minusDays(1),
                applicationEndAt,
                10,
                status,
                "https://example.com",
                NO_CONFLICT
        );
    }
}
