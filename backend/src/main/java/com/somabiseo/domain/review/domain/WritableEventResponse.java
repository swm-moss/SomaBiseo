package com.somabiseo.domain.review.domain;

import com.somabiseo.domain.somaevent.domain.EventType;

import java.time.OffsetDateTime;
import java.util.List;

public record WritableEventResponse(
        String eventId,
        EventType type,
        String title,
        String mentorName,
        OffsetDateTime endAt,
        List<String> applicants
) {
}
