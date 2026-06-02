package com.somabiseo.domain.preference.presentation;

import java.util.List;

public record UserInterestPreferencesRequest(
        List<String> topicIds
) {
}
