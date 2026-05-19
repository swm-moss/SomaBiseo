package com.somabiseo.domain.portal.domain;

public record SomaPortalEventApplicantResponse(
        String no,
        String traineeName,
        String appliedAt,
        String canceledAt,
        String status
) {
}
