package com.somabiseo.domain.eventsummary.domain;

import java.time.Instant;
import java.util.List;

public record EventAiSummaryResponse(
        String sourceId,
        String contentHash,
        String model,
        boolean cached,
        String oneLine,
        List<String> summaryBullets,
        List<String> targetAudience,
        List<String> keyTopics,
        List<String> takeaways,
        String difficulty,
        Integer inputTokens,
        Integer outputTokens,
        Instant generatedAt
) {
}
