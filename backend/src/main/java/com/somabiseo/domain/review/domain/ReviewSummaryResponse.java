package com.somabiseo.domain.review.domain;

import java.time.Instant;

public record ReviewSummaryResponse(
        String eventId,
        long reviewCount,
        Instant lastCreatedAt
) {
}
