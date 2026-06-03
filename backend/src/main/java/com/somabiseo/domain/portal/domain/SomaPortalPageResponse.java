package com.somabiseo.domain.portal.domain;

import java.util.List;

public record SomaPortalPageResponse<T>(
        List<T> items,
        int page,
        int totalPages,
        boolean hasNextPage,
        boolean refreshing
) {
    public SomaPortalPageResponse(List<T> items, int page, int totalPages, boolean hasNextPage) {
        this(items, page, totalPages, hasNextPage, false);
    }

    public SomaPortalPageResponse<T> withRefreshing(boolean refreshing) {
        return new SomaPortalPageResponse<>(items, page, totalPages, hasNextPage, refreshing);
    }
}
