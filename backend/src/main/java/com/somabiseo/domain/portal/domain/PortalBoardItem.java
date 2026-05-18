package com.somabiseo.domain.portal.domain;

import java.time.OffsetDateTime;

public record PortalBoardItem(
        String sourceId,
        String title,
        String sourceUrl,
        OffsetDateTime date,
        String rawText
) {
}
