package com.somabiseo.domain.portal.domain;

import java.util.List;

public record SomaPortalPageResponse<T>(
        List<T> items,
        int page,
        int totalPages,
        boolean hasNextPage
) {
}
