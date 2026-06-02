package com.somabiseo.domain.preference.domain;

import java.util.List;

public record UserPreferencesResponse(
        List<String> noticeBookmarkIds,
        List<String> eventFavoriteIds,
        List<String> interestTopicIds
) {
}
