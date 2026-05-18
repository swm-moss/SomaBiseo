package com.somabiseo.domain.source.domain;

import java.time.OffsetDateTime;

public record NoticeSourceItem(
        String sourceId,
        String title,
        String content,
        String sourceUrl,
        boolean important,
        OffsetDateTime publishedAt
) {
}
