package com.somabiseo.domain.somaevent.domain;

import java.time.OffsetDateTime;

public record SomaEventResponse(
        String id,
        String sourceId,
        EventType type,
        String title,
        String mentorName,
        String topic,
        String description,
        String location,
        OffsetDateTime startAt,
        OffsetDateTime endAt,
        OffsetDateTime applicationStartAt,
        OffsetDateTime applicationEndAt,
        int capacity,
        EventStatus status,
        String sourceUrl,
        CalendarConflictResponse conflict
) {
}
