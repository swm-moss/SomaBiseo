package com.somabiseo.domain.calendar.infrastructure;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GoogleOAuthTokenStore {
    private final Map<String, GoogleOAuthToken> tokens = new ConcurrentHashMap<>();
    private final Map<String, String> states = new ConcurrentHashMap<>();

    public Optional<GoogleOAuthToken> find(String sessionId) {
        return Optional.ofNullable(tokens.get(sessionId));
    }

    public void save(String sessionId, GoogleOAuthToken token) {
        tokens.put(sessionId, token);
    }

    public void clear(String sessionId) {
        tokens.remove(sessionId);
        states.remove(sessionId);
    }

    public void saveState(String sessionId, String state) {
        states.put(sessionId, state);
    }

    public boolean consumeState(String sessionId, String state) {
        String expectedState = states.remove(sessionId);

        return expectedState != null && expectedState.equals(state);
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
