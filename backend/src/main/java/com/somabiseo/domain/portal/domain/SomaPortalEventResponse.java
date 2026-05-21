package com.somabiseo.domain.portal.domain;

import com.somabiseo.domain.somaevent.domain.EventType;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

public record SomaPortalEventResponse(
        String sourceId,
        EventType type,
        String title,
        String mentorName,
        String topic,
        String location,
        OffsetDateTime startAt,
        OffsetDateTime endAt,
        OffsetDateTime applicationStartAt,
        OffsetDateTime applicationEndAt,
        Integer capacity,
        Integer applicantCount,
        String status,
        String approvalStatus,
        String operationType,
        String author,
        OffsetDateTime registeredAt,
        String sourceUrl,
        List<SomaPortalEventDetailItem> detailItems,
        String contentText,
        List<SomaPortalEventApplicantResponse> applicants,
        Instant detailSyncedAt,
        String rawText
) {
}
