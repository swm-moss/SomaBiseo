package com.somabiseo.domain.auth.infrastructure;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "somabiseo.invite")
public record InviteCodeProperties(
        String code,
        int maxFailedAttempts,
        long lockMinutes
) {
    public String requiredCode() {
        if (code == null || code.isBlank()) {
            throw new IllegalStateException("SOMABISEO_INVITE_CODE must be configured.");
        }

        return code.trim();
    }

    public int maxFailedAttemptsOrDefault() {
        return maxFailedAttempts <= 0 ? 5 : maxFailedAttempts;
    }

    public Duration lockDurationOrDefault() {
        return Duration.ofMinutes(lockMinutes <= 0 ? 10 : lockMinutes);
    }
}
