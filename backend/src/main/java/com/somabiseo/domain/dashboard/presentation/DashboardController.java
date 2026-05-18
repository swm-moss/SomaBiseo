package com.somabiseo.domain.dashboard.presentation;

import com.somabiseo.domain.notice.application.NoticeService;
import com.somabiseo.domain.notice.domain.NoticeResponse;
import com.somabiseo.domain.somaevent.application.SomaEventService;
import com.somabiseo.domain.somaevent.domain.SomaEventResponse;
import com.somabiseo.global.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
public class DashboardController {
    private static final OffsetDateTime DEADLINE_LIMIT = OffsetDateTime.parse("2026-05-21T23:59:59+09:00");

    private final SomaEventService somaEventService;
    private final NoticeService noticeService;

    public DashboardController(SomaEventService somaEventService, NoticeService noticeService) {
        this.somaEventService = somaEventService;
        this.noticeService = noticeService;
    }

    @GetMapping("/api/dashboard")
    ApiResponse<DashboardResponse> getDashboard() {
        List<SomaEventResponse> events = somaEventService.findAll(null);
        List<NoticeResponse> notices = noticeService.findAll(null);

        return ApiResponse.ok(new DashboardResponse(
                List.of(),
                events.stream().limit(3).toList(),
                notices.stream().limit(3).toList(),
                events.stream()
                        .filter(event -> event.applicationEndAt().isBefore(DEADLINE_LIMIT))
                        .toList(),
                events.stream()
                        .filter(event -> event.conflict().hasConflict())
                        .toList()
        ));
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
