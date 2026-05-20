package com.somabiseo.domain.review.presentation;

import com.somabiseo.domain.review.domain.EndedEventResponse;

import java.util.List;

public record EndedEventPageResponse(
        List<EndedEventResponse> items,
        int page,
        int size,
        int totalPages,
        long totalElements
) {
}
