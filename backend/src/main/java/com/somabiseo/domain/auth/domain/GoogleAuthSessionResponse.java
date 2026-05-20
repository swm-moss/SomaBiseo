package com.somabiseo.domain.auth.domain;

import java.time.Instant;

public record GoogleAuthSessionResponse(
        String sessionId,
        String username,
        String email,
        String profileImageUrl,
        String provider,
        Instant expiresAt,
        boolean inviteVerified
) {
}
