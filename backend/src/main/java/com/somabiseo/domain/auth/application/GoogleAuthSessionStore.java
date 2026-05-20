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
            Long userId,
            String googleSubject,
            String email,
            String name,
            String profileImageUrl,
            String accessToken,
            String refreshToken,
            Instant tokenExpiresAt,
            Instant sessionExpiresAt,
            boolean inviteVerified
    ) {
        String sessionId = UUID.randomUUID().toString();
        GoogleAuthSession session = new GoogleAuthSession(
                sessionId,
                userId,
                googleSubject,
                email,
                name,
                profileImageUrl,
                accessToken,
                refreshToken,
                tokenExpiresAt,
                sessionExpiresAt,
                inviteVerified
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

    public void updateToken(String sessionId, String accessToken, Instant tokenExpiresAt) {
        find(sessionId).ifPresent((session) -> sessions.put(
                sessionId,
                session.withToken(accessToken, tokenExpiresAt)
        ));
    }

    public record GoogleAuthSession(
            String sessionId,
            Long userId,
            String googleSubject,
            String email,
            String name,
            String profileImageUrl,
            String accessToken,
            String refreshToken,
            Instant tokenExpiresAt,
            Instant sessionExpiresAt,
            boolean inviteVerified
    ) {
        boolean isExpired() {
            return sessionExpiresAt.isBefore(Instant.now());
        }

        GoogleAuthSessionResponse toResponse() {
            return new GoogleAuthSessionResponse(
                    sessionId,
                    name,
                    email,
                    profileImageUrl,
                    "GOOGLE",
                    sessionExpiresAt,
                    inviteVerified
            );
        }

        GoogleAuthSession withToken(String newAccessToken, Instant newTokenExpiresAt) {
            return new GoogleAuthSession(
                    sessionId,
                    userId,
                    googleSubject,
                    email,
                    name,
                    profileImageUrl,
                    newAccessToken,
                    refreshToken,
                    newTokenExpiresAt,
                    sessionExpiresAt,
                    inviteVerified
            );
        }

        GoogleAuthSession withToken(String newAccessToken, Instant newTokenExpiresAt) {
            return new GoogleAuthSession(
                    sessionId,
                    googleSubject,
                    email,
                    name,
                    profileImageUrl,
                    newAccessToken,
                    refreshToken,
                    newTokenExpiresAt,
                    sessionExpiresAt
            );
        }
    }
}
