package com.somabiseo.domain.review.domain;

import com.somabiseo.domain.somaevent.domain.EventType;

import java.time.OffsetDateTime;

public record RecentEndedEventResponse(
        String eventId,
        EventType type,
        String title,
        String mentorName,
        OffsetDateTime endAt,
        long reviewCount
) {
}
