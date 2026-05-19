package com.somabiseo.domain.review.domain;

import java.time.Instant;

public record ReviewResponse(
        Long id,
        String eventId,
        String authorName,
        String content,
        Instant createdAt
) {
}
