package com.somabiseo.domain.dashboard.presentation;

import com.somabiseo.domain.notice.application.NoticeService;
import com.somabiseo.domain.notice.domain.NoticeResponse;
import com.somabiseo.domain.somaevent.application.SomaEventService;
import com.somabiseo.domain.somaevent.domain.EventStatus;
import com.somabiseo.domain.somaevent.domain.SomaEventResponse;
import com.somabiseo.global.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Clock;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;

@RestController
public class DashboardController {
    private static final Duration DEADLINE_WINDOW = Duration.ofDays(7);
    private static final int DEADLINE_SOON_LIMIT = 3;

    private final SomaEventService somaEventService;
    private final NoticeService noticeService;
    private final Clock clock;

    public DashboardController(SomaEventService somaEventService, NoticeService noticeService, Clock clock) {
        this.somaEventService = somaEventService;
        this.noticeService = noticeService;
        this.clock = clock;
    }

    @GetMapping("/api/dashboard")
    ApiResponse<DashboardResponse> getDashboard() {
        List<SomaEventResponse> events = somaEventService.findAll(null);
        List<NoticeResponse> notices = noticeService.findAll(null);

        OffsetDateTime now = OffsetDateTime.now(clock);
        OffsetDateTime windowEnd = now.plus(DEADLINE_WINDOW);
        List<SomaEventResponse> activeEvents = events.stream()
                .filter((event) -> isActiveAt(event, now))
                .toList();
        List<SomaEventResponse> deadlineSoonEvents = events.stream()
                .filter(event -> event.status() == EventStatus.OPEN)
                .filter(event -> event.applicationEndAt() != null)
                .filter(event -> !event.applicationEndAt().isBefore(now))
                .filter(event -> !event.applicationEndAt().isAfter(windowEnd))
                .sorted(Comparator.comparing(SomaEventResponse::applicationEndAt))
                .limit(DEADLINE_SOON_LIMIT)
                .toList();

        return ApiResponse.ok(new DashboardResponse(
                List.of(),
                activeEvents.stream().limit(3).toList(),
                notices.stream().limit(3).toList(),
                deadlineSoonEvents,
                events.stream()
                        .filter(event -> event.conflict().hasConflict())
                        .toList()
        ));
    }

    private static boolean isActiveAt(SomaEventResponse event, OffsetDateTime now) {
        if (event.endAt() != null) {
            return !event.endAt().isBefore(now);
        }

        return event.startAt() != null && !event.startAt().isBefore(now);
    }

    record DashboardResponse(
            List<SomaEventResponse> todayEvents,
            List<SomaEventResponse> upcomingEvents,
            List<NoticeResponse> newNotices,
            List<SomaEventResponse> deadlineSoonEvents,
            List<SomaEventResponse> conflictedEvents
    ) {
    }
}
