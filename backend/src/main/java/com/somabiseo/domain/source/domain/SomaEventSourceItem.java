package com.somabiseo.domain.source.domain;

import java.time.OffsetDateTime;

public record SomaEventSourceItem(
        String sourceId,
        String type,
        String title,
        String mentorName,
        String location,
        OffsetDateTime startAt,
        OffsetDateTime endAt,
        String sourceUrl
) {
}
