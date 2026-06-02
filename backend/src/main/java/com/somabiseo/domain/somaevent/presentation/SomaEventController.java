package com.somabiseo.domain.somaevent.presentation;

import com.somabiseo.domain.auth.application.GoogleAuthService;
import com.somabiseo.domain.auth.application.GoogleAuthSessionStore;
import com.somabiseo.domain.auth.presentation.GoogleAuthController;
import com.somabiseo.domain.preference.application.UserPreferenceService;
import com.somabiseo.domain.somaevent.application.SomaEventService;
import com.somabiseo.domain.somaevent.domain.EventType;
import com.somabiseo.domain.somaevent.domain.SomaEventResponse;
import com.somabiseo.global.response.ApiResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
public class SomaEventController {
    private final SomaEventService somaEventService;
    private final UserPreferenceService userPreferenceService;
    private final GoogleAuthService googleAuthService;

    public SomaEventController(
            SomaEventService somaEventService,
            UserPreferenceService userPreferenceService,
            GoogleAuthService googleAuthService
    ) {
        this.somaEventService = somaEventService;
        this.userPreferenceService = userPreferenceService;
        this.googleAuthService = googleAuthService;
    }

    @GetMapping("/api/events")
    ApiResponse<List<SomaEventResponse>> getEvents(@RequestParam(required = false) EventType type) {
        return ApiResponse.ok(somaEventService.findAll(type));
    }

    @GetMapping("/api/events/{eventId}")
    ApiResponse<SomaEventResponse> getEvent(@PathVariable String eventId) {
        return ApiResponse.ok(somaEventService.findById(eventId));
    }

    @PostMapping("/api/events/{eventId}/favorite")
    ApiResponse<Void> favorite(@PathVariable String eventId, HttpServletRequest request) {
        somaEventService.findById(eventId);
        userPreferenceService.favoriteEvent(requireUserId(request), eventId);
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/api/events/{eventId}/favorite")
    ApiResponse<Void> unfavorite(@PathVariable String eventId, HttpServletRequest request) {
        somaEventService.findById(eventId);
        userPreferenceService.unfavoriteEvent(requireUserId(request), eventId);
        return ApiResponse.ok(null);
    }

    private Long requireUserId(HttpServletRequest request) {
        GoogleAuthSessionStore.GoogleAuthSession session = googleAuthService.requireVerifiedAuthor(
                request.getHeader("Authorization"),
                authSessionCookie(request)
        );

        return session.userId();
    }

    private String authSessionCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }

        return Arrays.stream(request.getCookies())
                .filter((cookie) -> GoogleAuthController.AUTH_SESSION_COOKIE.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter((value) -> value != null && !value.isBlank())
                .findFirst()
                .orElse(null);
    }
}
