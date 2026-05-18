package com.somabiseo.domain.somaevent.domain;

import java.time.OffsetDateTime;

public record BusyBlockResponse(
        String id,
        String title,
        OffsetDateTime startAt,
        OffsetDateTime endAt
) {
}
