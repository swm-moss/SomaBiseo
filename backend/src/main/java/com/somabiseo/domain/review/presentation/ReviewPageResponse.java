package com.somabiseo.domain.review.presentation;

import com.somabiseo.domain.review.domain.ReviewResponse;

import java.util.List;

public record ReviewPageResponse(
        List<ReviewResponse> items,
        int page,
        int size,
        int totalPages,
        long totalElements
) {
}
