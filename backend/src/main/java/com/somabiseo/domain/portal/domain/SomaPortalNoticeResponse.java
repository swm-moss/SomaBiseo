package com.somabiseo.domain.portal.domain;

import java.time.OffsetDateTime;

public record SomaPortalNoticeResponse(
        String sourceId,
        String title,
        String sourceUrl,
        OffsetDateTime publishedAt,
        String rawText
) {
}
