package com.somabiseo.domain.calendar.presentation;

import com.somabiseo.domain.calendar.application.CalendarService;
import com.somabiseo.domain.calendar.domain.CalendarConnectionResponse;
import com.somabiseo.domain.calendar.domain.CalendarEventLinkResponse;
import com.somabiseo.domain.calendar.domain.GoogleCalendarEventResponse;
import com.somabiseo.domain.calendar.infrastructure.GoogleCalendarProperties;
import com.somabiseo.domain.somaevent.domain.CalendarConflictResponse;
import com.somabiseo.global.response.ApiResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
public class CalendarController {
    private final CalendarService calendarService;
    private final GoogleCalendarProperties googleCalendarProperties;

    public CalendarController(CalendarService calendarService, GoogleCalendarProperties googleCalendarProperties) {
        this.calendarService = calendarService;
        this.googleCalendarProperties = googleCalendarProperties;
    }

    @GetMapping("/api/calendar/google/connect-url")
    ApiResponse<ConnectUrlResponse> getConnectUrl() {
        return ApiResponse.ok(new ConnectUrlResponse(calendarService.getConnectUrl()));
    }

    @GetMapping("/api/calendar/google/callback")
    RedirectView callback(
            @RequestParam(required = false) String code,
            @RequestParam(defaultValue = "false") boolean mock
    ) {
        if (!mock && (code == null || code.isBlank())) {
            return new RedirectView(googleCalendarProperties.frontendRedirectUriOrDefault());
        }

        calendarService.connect(mock ? "mock" : code);

        return new RedirectView(googleCalendarProperties.frontendRedirectUriOrDefault());
    }

    @GetMapping("/api/calendar/google/status")
    ApiResponse<CalendarConnectionResponse> getConnection() {
        return ApiResponse.ok(calendarService.getConnection());
    }

    @DeleteMapping("/api/calendar/google/connection")
    ApiResponse<CalendarConnectionResponse> disconnect() {
        return ApiResponse.ok(calendarService.disconnect());
    }

    @GetMapping("/api/calendar/google/events")
    ApiResponse<List<GoogleCalendarEventResponse>> getGoogleEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to
    ) {
        return ApiResponse.ok(calendarService.getGoogleEvents(from, to));
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
