package com.somabiseo.domain.notice.domain;

import java.time.OffsetDateTime;

public record NoticeResponse(
        String id,
        String sourceId,
        String title,
        String content,
        NoticeCategory category,
        String sourceUrl,
        boolean important,
        OffsetDateTime publishedAt,
        OffsetDateTime deadlineAt
) {
}
