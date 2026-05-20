package com.somabiseo.domain.review.domain;

import com.somabiseo.domain.somaevent.domain.EventType;

import java.time.Instant;

public record ReviewFeedItem(
        Long id,
        String eventId,
        String eventTitle,
        String eventTopic,
        EventType eventType,
        String mentorName,
        String content,
        String authorName,
        boolean isAuthor,
        Instant createdAt
) {
}
