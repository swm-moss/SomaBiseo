package com.somabiseo.domain.calendar.presentation;

import com.somabiseo.domain.calendar.application.CalendarService;
import com.somabiseo.domain.calendar.domain.CalendarConnectionResponse;
import com.somabiseo.domain.calendar.domain.CalendarEventLinkResponse;
import com.somabiseo.domain.calendar.domain.GoogleCalendarEventResponse;
import com.somabiseo.domain.calendar.infrastructure.GoogleCalendarProperties;
import com.somabiseo.domain.somaevent.domain.CalendarConflictResponse;
import com.somabiseo.global.response.ApiResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
public class CalendarController {
    private static final String CALENDAR_SESSION_COOKIE = "somabiseo_calendar_session";

    private final CalendarService calendarService;
    private final GoogleCalendarProperties googleCalendarProperties;

    public CalendarController(CalendarService calendarService, GoogleCalendarProperties googleCalendarProperties) {
        this.calendarService = calendarService;
        this.googleCalendarProperties = googleCalendarProperties;
    }

    @GetMapping("/api/calendar/google/connect-url")
    ApiResponse<ConnectUrlResponse> getConnectUrl(HttpServletRequest request, HttpServletResponse response) {
        String calendarSessionId = calendarSessionId(request, response);

        return ApiResponse.ok(new ConnectUrlResponse(calendarService.getConnectUrl(calendarSessionId)));
    }

    @GetMapping("/api/calendar/google/callback")
    RedirectView callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(defaultValue = "false") boolean mock,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        if (!mock && (code == null || code.isBlank())) {
            return new RedirectView(googleCalendarProperties.frontendRedirectUriOrDefault());
        }

        String calendarSessionId = calendarSessionId(request, response);
        calendarService.connect(calendarSessionId, mock ? "mock" : code, state);

        return new RedirectView(googleCalendarProperties.frontendRedirectUriOrDefault());
    }

    @GetMapping("/api/calendar/google/status")
    ApiResponse<CalendarConnectionResponse> getConnection(HttpServletRequest request, HttpServletResponse response) {
        return ApiResponse.ok(calendarService.getConnection(calendarSessionId(request, response)));
    }

    @DeleteMapping("/api/calendar/google/connection")
    ApiResponse<CalendarConnectionResponse> disconnect(HttpServletRequest request, HttpServletResponse response) {
        return ApiResponse.ok(calendarService.disconnect(calendarSessionId(request, response)));
    }

    @GetMapping("/api/calendar/google/events")
    ApiResponse<List<GoogleCalendarEventResponse>> getGoogleEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return ApiResponse.ok(calendarService.getGoogleEvents(calendarSessionId(request, response), from, to));
    }

    @GetMapping("/api/calendar/conflicts")
    ApiResponse<CalendarConflictResponse> getConflict(
            @RequestParam String eventId,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return ApiResponse.ok(calendarService.getConflict(calendarSessionId(request, response), eventId));
    }

    @PostMapping("/api/calendar/events/{eventId}")
    ApiResponse<CalendarEventLinkResponse> addEvent(
            @PathVariable String eventId,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return ApiResponse.ok(calendarService.addEvent(calendarSessionId(request, response), eventId));
    }

    @GetMapping("/api/calendar/events/{eventId}/link")
    ApiResponse<CalendarEventLinkResponse> getEventLink(
            @PathVariable String eventId,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return ApiResponse.ok(calendarService.getEventLink(calendarSessionId(request, response), eventId));
    }

    record ConnectUrlResponse(String url) {
    }

    private String calendarSessionId(HttpServletRequest request, HttpServletResponse response) {
        String existingSessionId = request.getCookies() == null
                ? null
                : Arrays.stream(request.getCookies())
                .filter((cookie) -> CALENDAR_SESSION_COOKIE.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter((value) -> value != null && !value.isBlank())
                .findFirst()
                .orElse(null);

        if (existingSessionId != null) {
            return existingSessionId;
        }

        String sessionId = UUID.randomUUID().toString();
        boolean secureRequest = isSecureRequest(request);
        ResponseCookie cookie = ResponseCookie.from(CALENDAR_SESSION_COOKIE, sessionId)
                .httpOnly(true)
                .secure(secureRequest)
                .sameSite(secureRequest ? "None" : "Lax")
                .path("/")
                .maxAge(60L * 60 * 24 * 30)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        return sessionId;
    }

    private boolean isSecureRequest(HttpServletRequest request) {
        String forwardedProto = request.getHeader("X-Forwarded-Proto");

        return request.isSecure() || "https".equalsIgnoreCase(forwardedProto);
    }
}
