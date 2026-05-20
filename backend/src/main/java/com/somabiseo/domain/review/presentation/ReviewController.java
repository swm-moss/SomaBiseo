package com.somabiseo.domain.review.presentation;

import com.somabiseo.domain.review.application.RecentEndedEventQueryService;
import com.somabiseo.domain.review.application.ReviewFeedQueryService;
import com.somabiseo.domain.review.application.ReviewService;
import com.somabiseo.domain.review.application.ReviewSummaryQueryService;
import com.somabiseo.domain.review.domain.RecentEndedEventResponse;
import com.somabiseo.domain.review.domain.ReviewResponse;
import com.somabiseo.domain.review.domain.ReviewSummaryResponse;
import com.somabiseo.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ReviewController {
    private final ReviewService reviewService;
    private final RecentEndedEventQueryService recentEndedEventQueryService;
    private final ReviewSummaryQueryService reviewSummaryQueryService;
    private final ReviewFeedQueryService reviewFeedQueryService;

    public ReviewController(
            ReviewService reviewService,
            RecentEndedEventQueryService recentEndedEventQueryService,
            ReviewSummaryQueryService reviewSummaryQueryService,
            ReviewFeedQueryService reviewFeedQueryService
    ) {
        this.reviewService = reviewService;
        this.recentEndedEventQueryService = recentEndedEventQueryService;
        this.reviewSummaryQueryService = reviewSummaryQueryService;
        this.reviewFeedQueryService = reviewFeedQueryService;
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

    @GetMapping("/api/reviews/recent-events")
    ApiResponse<List<RecentEndedEventResponse>> getRecentEvents(
            @RequestParam(defaultValue = "3") int limit
    ) {
        return ApiResponse.ok(recentEndedEventQueryService.findRecent(limit));
    }

    @GetMapping("/api/reviews/summaries")
    ApiResponse<List<ReviewSummaryResponse>> getSummaries(@RequestParam List<String> eventIds) {
        return ApiResponse.ok(reviewSummaryQueryService.findSummaries(eventIds));
    }

    @GetMapping("/api/events/{eventId}/reviews")
    ApiResponse<ReviewPageResponse> getReviews(
            @PathVariable String eventId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ReviewResponse> result = reviewService.findReviews(eventId, page, size);

        return ApiResponse.ok(new ReviewPageResponse(
                result.getContent(),
                result.getNumber() + 1,
                result.getSize(),
                result.getTotalPages(),
                result.getTotalElements()
        ));
    }

    @PostMapping("/api/events/{eventId}/reviews")
    ApiResponse<ReviewResponse> createReview(
            @PathVariable String eventId,
            @Valid @RequestBody ReviewCreateRequest request,
            HttpServletRequest httpServletRequest
    ) {
        return ApiResponse.ok(reviewService.create(
                eventId,
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
}
