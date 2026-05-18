package com.somabiseo.domain.portal.domain;

import java.time.Instant;

public record SomaPortalLoginResponse(
        String sessionId,
        String username,
        Instant expiresAt
) {
}
