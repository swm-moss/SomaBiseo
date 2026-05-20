package com.somabiseo.domain.auth.application;

import com.somabiseo.domain.auth.domain.GoogleAuthSessionResponse;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class GoogleAuthSessionStore {
    private final ConcurrentMap<String, GoogleAuthSession> sessions = new ConcurrentHashMap<>();

    public GoogleAuthSessionResponse save(
            String googleSubject,
            String email,
            String name,
            String accessToken,
            String refreshToken,
            Instant tokenExpiresAt,
            Instant sessionExpiresAt
    ) {
        String sessionId = UUID.randomUUID().toString();
        GoogleAuthSession session = new GoogleAuthSession(
                sessionId,
                googleSubject,
                email,
                name,
                accessToken,
                refreshToken,
                tokenExpiresAt,
                sessionExpiresAt
        );

        sessions.put(sessionId, session);

        return session.toResponse();
    }

    public Optional<GoogleAuthSession> find(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return Optional.empty();
        }

        GoogleAuthSession session = sessions.get(sessionId);

        if (session == null) {
            return Optional.empty();
        }

        if (session.isExpired()) {
            sessions.remove(sessionId);

            return Optional.empty();
        }

        return Optional.of(session);
    }

    public void remove(String sessionId) {
        sessions.remove(sessionId);
    }

    public record GoogleAuthSession(
            String sessionId,
            String googleSubject,
            String email,
            String name,
            String accessToken,
            String refreshToken,
            Instant tokenExpiresAt,
            Instant sessionExpiresAt
    ) {
        boolean isExpired() {
            return sessionExpiresAt.isBefore(Instant.now());
        }

        GoogleAuthSessionResponse toResponse() {
            return new GoogleAuthSessionResponse(sessionId, name, email, sessionExpiresAt);
        }
    }
}
