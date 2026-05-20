package com.somabiseo.domain.auth.application;

import com.somabiseo.domain.auth.domain.GoogleAuthSessionEntity;
import com.somabiseo.domain.auth.domain.GoogleAuthSessionResponse;
import com.somabiseo.domain.auth.infrastructure.GoogleAuthSessionRepository;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Component
public class GoogleAuthSessionStore {
    private final GoogleAuthSessionRepository sessionRepository;
    private final Clock clock;

    public GoogleAuthSessionStore(GoogleAuthSessionRepository sessionRepository, Clock clock) {
        this.sessionRepository = sessionRepository;
        this.clock = clock;
    }

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
        Instant now = clock.instant();
        GoogleAuthSessionEntity session = new GoogleAuthSessionEntity(
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
                inviteVerified,
                now
        );

        sessionRepository.save(session);

        return toDomain(session).toResponse();
    }

    public Optional<GoogleAuthSession> find(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return Optional.empty();
        }

        Optional<GoogleAuthSessionEntity> session = sessionRepository.findById(sessionId);

        if (session.isEmpty()) {
            return Optional.empty();
        }

        GoogleAuthSessionEntity entity = session.get();

        if (entity.isExpired(clock.instant())) {
            sessionRepository.deleteById(sessionId);
            return Optional.empty();
        }

        return Optional.of(toDomain(entity));
    }

    public void remove(String sessionId) {
        if (sessionId != null && !sessionId.isBlank()) {
            sessionRepository.deleteById(sessionId);
        }
    }

    public void updateToken(String sessionId, String accessToken, Instant tokenExpiresAt) {
        sessionRepository.findById(sessionId).ifPresent((session) -> {
            session.updateToken(accessToken, tokenExpiresAt, clock.instant());
            sessionRepository.save(session);
        });
    }

    private GoogleAuthSession toDomain(GoogleAuthSessionEntity entity) {
        return new GoogleAuthSession(
                entity.getSessionId(),
                entity.getUserId(),
                entity.getGoogleSubject(),
                entity.getEmail(),
                entity.getName(),
                entity.getProfileImageUrl(),
                entity.getAccessToken(),
                entity.getRefreshToken(),
                entity.getTokenExpiresAt(),
                entity.getSessionExpiresAt(),
                entity.isInviteVerified()
        );
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
    }
}
