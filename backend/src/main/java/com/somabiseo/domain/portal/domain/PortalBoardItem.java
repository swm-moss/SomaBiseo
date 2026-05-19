package com.somabiseo.domain.portal.domain;

import java.time.OffsetDateTime;
import java.util.List;

public record PortalBoardItem(
        String sourceId,
        String title,
        String sourceUrl,
        OffsetDateTime date,
        String rawText,
        List<String> cells
) {
    public PortalBoardItem(String sourceId, String title, String sourceUrl, OffsetDateTime date, String rawText) {
        this(sourceId, title, sourceUrl, date, rawText, List.of());
    }
}
