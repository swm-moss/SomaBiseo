package com.somabiseo.domain.review.presentation;

import com.somabiseo.domain.review.domain.ReviewFeedItem;

import java.util.List;

public record ReviewFeedPageResponse(
        List<ReviewFeedItem> items,
        int page,
        int size,
        int totalPages,
        long totalElements
) {
}
