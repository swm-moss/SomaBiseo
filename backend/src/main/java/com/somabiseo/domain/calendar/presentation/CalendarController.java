package com.somabiseo.domain.calendar.presentation;

import com.somabiseo.domain.calendar.application.CalendarService;
import com.somabiseo.domain.calendar.domain.CalendarEventLinkResponse;
import com.somabiseo.domain.somaevent.domain.CalendarConflictResponse;
import com.somabiseo.global.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CalendarController {
    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping("/api/calendar/google/connect-url")
    ApiResponse<ConnectUrlResponse> getConnectUrl() {
        return ApiResponse.ok(new ConnectUrlResponse("/api/calendar/google/callback?mock=true"));
    }

    @GetMapping("/api/calendar/conflicts")
    ApiResponse<CalendarConflictResponse> getConflict(@RequestParam String eventId) {
        return ApiResponse.ok(calendarService.getConflict(eventId));
    }

    @PostMapping("/api/calendar/events/{eventId}")
    ApiResponse<CalendarEventLinkResponse> addEvent(@PathVariable String eventId) {
        return ApiResponse.ok(calendarService.addEvent(eventId));
    }

    record ConnectUrlResponse(String url) {
    }
}
