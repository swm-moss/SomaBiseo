package com.somabiseo.domain.review.domain;

import com.somabiseo.domain.somaevent.domain.EventType;

import java.time.OffsetDateTime;

public record EndedEventResponse(
        String eventId,
        EventType type,
        String topic,
        String mentorName,
        OffsetDateTime startAt,
        OffsetDateTime endAt,
        long reviewCount
) {
}
