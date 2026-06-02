package com.somabiseo.domain.notice.presentation;

import com.somabiseo.domain.auth.application.GoogleAuthService;
import com.somabiseo.domain.auth.application.GoogleAuthSessionStore;
import com.somabiseo.domain.auth.presentation.GoogleAuthController;
import com.somabiseo.domain.notice.application.NoticeService;
import com.somabiseo.domain.notice.domain.NoticeResponse;
import com.somabiseo.domain.preference.application.UserPreferenceService;
import com.somabiseo.global.response.ApiResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
public class NoticeController {
    private final NoticeService noticeService;
    private final UserPreferenceService userPreferenceService;
    private final GoogleAuthService googleAuthService;

    public NoticeController(
            NoticeService noticeService,
            UserPreferenceService userPreferenceService,
            GoogleAuthService googleAuthService
    ) {
        this.noticeService = noticeService;
        this.userPreferenceService = userPreferenceService;
        this.googleAuthService = googleAuthService;
    }

    @GetMapping("/api/notices")
    ApiResponse<List<NoticeResponse>> getNotices(@RequestParam(required = false) Boolean important) {
        return ApiResponse.ok(noticeService.findAll(important));
    }

    @GetMapping("/api/notices/{noticeId}")
    ApiResponse<NoticeResponse> getNotice(@PathVariable String noticeId) {
        return ApiResponse.ok(noticeService.findById(noticeId));
    }

    @PostMapping("/api/notices/{noticeId}/read")
    ApiResponse<Void> markRead(@PathVariable String noticeId) {
        noticeService.findById(noticeId);
        return ApiResponse.ok(null);
    }

    @PostMapping("/api/notices/{noticeId}/bookmark")
    ApiResponse<Void> bookmark(@PathVariable String noticeId, HttpServletRequest request) {
        noticeService.findById(noticeId);
        userPreferenceService.bookmarkNotice(requireUserId(request), noticeId);
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/api/notices/{noticeId}/bookmark")
    ApiResponse<Void> unbookmark(@PathVariable String noticeId, HttpServletRequest request) {
        noticeService.findById(noticeId);
        userPreferenceService.unbookmarkNotice(requireUserId(request), noticeId);
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
