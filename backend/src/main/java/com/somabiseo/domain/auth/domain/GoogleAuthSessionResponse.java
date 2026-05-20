package com.somabiseo.domain.auth.domain;

import java.time.Instant;

public record GoogleAuthSessionResponse(
        String sessionId,
        String username,
        String email,
        Instant expiresAt
) {
}
