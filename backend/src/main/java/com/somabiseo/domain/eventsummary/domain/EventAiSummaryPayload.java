package com.somabiseo.domain.eventsummary.domain;

import java.util.List;

public record EventAiSummaryPayload(
        String oneLine,
        List<String> summaryBullets,
        List<String> targetAudience,
        List<String> keyTopics,
        List<String> takeaways,
        String difficulty,
        Integer inputTokens,
        Integer outputTokens
) {
}
