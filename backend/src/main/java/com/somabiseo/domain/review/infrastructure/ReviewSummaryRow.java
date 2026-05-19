package com.somabiseo.domain.review.infrastructure;

import java.time.Instant;

public record ReviewSummaryRow(
        Long somaEventId,
        long reviewCount,
        Instant lastCreatedAt
) {
}
