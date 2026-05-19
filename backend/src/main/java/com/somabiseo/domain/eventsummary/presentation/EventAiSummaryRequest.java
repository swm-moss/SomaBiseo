package com.somabiseo.domain.eventsummary.presentation;

import jakarta.validation.constraints.NotBlank;

public record EventAiSummaryRequest(
        @NotBlank String sourceUrl
) {
}
