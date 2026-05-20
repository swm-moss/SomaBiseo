package com.somabiseo.domain.review.presentation;

import com.somabiseo.domain.auth.application.GoogleAuthService;
import com.somabiseo.domain.auth.application.GoogleAuthSessionStore;
import com.somabiseo.domain.auth.presentation.GoogleAuthController;
import com.somabiseo.domain.review.application.EndedEventQueryService;
import com.somabiseo.domain.review.application.ReviewFeedQueryService;
import com.somabiseo.domain.review.application.ReviewService;
import com.somabiseo.domain.review.domain.ReviewResponse;
import com.somabiseo.domain.somaevent.domain.EventType;
import com.somabiseo.global.response.ApiResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Arrays;

@RestController
public class ReviewController {
    private final ReviewService reviewService;
    private final EndedEventQueryService endedEventQueryService;
    private final ReviewFeedQueryService reviewFeedQueryService;
    private final GoogleAuthService googleAuthService;

    public ReviewController(
            ReviewService reviewService,
            EndedEventQueryService endedEventQueryService,
            ReviewFeedQueryService reviewFeedQueryService,
            GoogleAuthService googleAuthService
    ) {
        this.reviewService = reviewService;
        this.endedEventQueryService = endedEventQueryService;
        this.reviewFeedQueryService = reviewFeedQueryService;
        this.googleAuthService = googleAuthService;
    }

    @GetMapping("/api/reviews")
    ApiResponse<ReviewFeedPageResponse> getFeed(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String eventId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.ok(reviewFeedQueryService.findFeed(q, eventId, page, size));
    }

    @GetMapping("/api/reviews/ended-events")
    ApiResponse<EndedEventPageResponse> getEndedEvents(
            @RequestParam(required = false) EventType type,
            @RequestParam(required = false) String q,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.ok(endedEventQueryService.find(type, q, date, page, size));
    }

    @PostMapping("/api/events/{eventId}/reviews")
    ApiResponse<ReviewResponse> createReview(
            @PathVariable String eventId,
            @Valid @RequestBody ReviewCreateRequest request,
            HttpServletRequest httpServletRequest
    ) {
        GoogleAuthSessionStore.GoogleAuthSession session = googleAuthService.requireVerifiedAuthor(
                httpServletRequest.getHeader("Authorization"),
                authSessionCookie(httpServletRequest)
        );

        return ApiResponse.ok(reviewService.create(
                eventId,
                session.userId(),
                request.authorName(),
                request.content(),
                resolveClientIp(httpServletRequest)
        ));
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");

        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }

        return request.getRemoteAddr();
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
