package com.somabiseo.domain.portal.domain;

import com.somabiseo.domain.somaevent.domain.EventType;

import java.time.OffsetDateTime;

public record SomaPortalEventResponse(
        String sourceId,
        EventType type,
        String title,
        String mentorName,
        String topic,
        String location,
        OffsetDateTime startAt,
        OffsetDateTime endAt,
        String status,
        String sourceUrl,
        String rawText
) {
}
