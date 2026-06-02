package com.somabiseo.domain.preference.presentation;

import java.util.List;

public record UserPreferencesMergeRequest(
        List<String> noticeBookmarkIds,
        List<String> eventFavoriteIds,
        List<String> interestTopicIds
) {
}
