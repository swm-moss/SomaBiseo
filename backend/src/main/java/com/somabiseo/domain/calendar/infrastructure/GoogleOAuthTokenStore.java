package com.somabiseo.domain.calendar.infrastructure;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

@Component
public class GoogleOAuthTokenStore {
    private GoogleOAuthToken token;

    public Optional<GoogleOAuthToken> find() {
        return Optional.ofNullable(token);
    }

    public void save(GoogleOAuthToken token) {
        this.token = token;
    }

    public void clear() {
        token = null;
    }

    public record GoogleOAuthToken(
            String accessToken,
            String refreshToken,
            Instant expiresAt,
            String googleAccountEmail
    ) {
        public boolean isExpired() {
            return expiresAt.minusSeconds(60).isBefore(Instant.now());
        }

        public GoogleOAuthToken refreshed(String newAccessToken, long expiresInSeconds) {
            return new GoogleOAuthToken(
                    newAccessToken,
                    refreshToken,
                    Instant.now().plusSeconds(expiresInSeconds),
                    googleAccountEmail
            );
        }
    }
}
