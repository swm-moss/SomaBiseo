package com.somabiseo.domain.eventsummary.infrastructure;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "somabiseo.openai")
public record OpenAiProperties(
        String apiKey,
        String baseUrl,
        String model,
        int maxInputCharacters,
        long timeoutSeconds
) {
    public boolean configured() {
        return apiKey != null && !apiKey.isBlank();
    }
}
