package com.somabiseo.domain.preference.presentation;

import com.somabiseo.domain.auth.application.GoogleAuthService;
import com.somabiseo.domain.auth.application.GoogleAuthSessionStore;
import com.somabiseo.domain.auth.presentation.GoogleAuthController;
import com.somabiseo.domain.preference.application.UserPreferenceService;
import com.somabiseo.domain.preference.domain.UserPreferencesResponse;
import com.somabiseo.global.response.ApiResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

@RestController
public class UserPreferenceController {
    private final UserPreferenceService userPreferenceService;
    private final GoogleAuthService googleAuthService;

    public UserPreferenceController(
            UserPreferenceService userPreferenceService,
            GoogleAuthService googleAuthService
    ) {
        this.userPreferenceService = userPreferenceService;
        this.googleAuthService = googleAuthService;
    }

    @GetMapping("/api/user/preferences")
    ApiResponse<UserPreferencesResponse> getPreferences(HttpServletRequest request) {
        return ApiResponse.ok(userPreferenceService.findByUser(requireUserId(request)));
    }

    @PutMapping("/api/user/preferences/interests")
    ApiResponse<UserPreferencesResponse> replaceInterestTopics(
            @RequestBody UserInterestPreferencesRequest body,
            HttpServletRequest request
    ) {
        return ApiResponse.ok(userPreferenceService.replaceInterestTopics(
                requireUserId(request),
                body == null ? null : body.topicIds()
        ));
    }

    @PostMapping("/api/user/preferences/migrate")
    ApiResponse<UserPreferencesResponse> mergeClientPreferences(
            @RequestBody UserPreferencesMergeRequest body,
            HttpServletRequest request
    ) {
        return ApiResponse.ok(userPreferenceService.mergeFromClient(
                requireUserId(request),
                body == null ? null : body.noticeBookmarkIds(),
                body == null ? null : body.eventFavoriteIds(),
                body == null ? null : body.interestTopicIds()
        ));
    }

    @PostMapping("/api/user/preferences/notice-bookmarks/{noticeId}")
    ApiResponse<UserPreferencesResponse> bookmarkNotice(
            @PathVariable String noticeId,
            HttpServletRequest request
    ) {
        return ApiResponse.ok(userPreferenceService.bookmarkNotice(requireUserId(request), noticeId));
    }

    @DeleteMapping("/api/user/preferences/notice-bookmarks/{noticeId}")
    ApiResponse<UserPreferencesResponse> unbookmarkNotice(
            @PathVariable String noticeId,
            HttpServletRequest request
    ) {
        return ApiResponse.ok(userPreferenceService.unbookmarkNotice(requireUserId(request), noticeId));
    }

    @PostMapping("/api/user/preferences/event-favorites/{eventId}")
    ApiResponse<UserPreferencesResponse> favoriteEvent(
            @PathVariable String eventId,
            HttpServletRequest request
    ) {
        return ApiResponse.ok(userPreferenceService.favoriteEvent(requireUserId(request), eventId));
    }

    @DeleteMapping("/api/user/preferences/event-favorites/{eventId}")
    ApiResponse<UserPreferencesResponse> unfavoriteEvent(
            @PathVariable String eventId,
            HttpServletRequest request
    ) {
        return ApiResponse.ok(userPreferenceService.unfavoriteEvent(requireUserId(request), eventId));
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
