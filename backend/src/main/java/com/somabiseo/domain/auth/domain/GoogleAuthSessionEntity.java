package com.somabiseo.domain.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "google_auth_sessions")
public class GoogleAuthSessionEntity {
    @Id
    @Column(name = "session_id", nullable = false, length = 80)
    private String sessionId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "google_subject", nullable = false, length = 255)
    private String googleSubject;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "profile_image_url", columnDefinition = "text")
    private String profileImageUrl;

    @Column(name = "access_token", nullable = false, columnDefinition = "text")
    private String accessToken;

    @Column(name = "refresh_token", columnDefinition = "text")
    private String refreshToken;

    @Column(name = "token_expires_at", nullable = false)
    private Instant tokenExpiresAt;

    @Column(name = "session_expires_at", nullable = false)
    private Instant sessionExpiresAt;

    @Column(name = "invite_verified", nullable = false)
    private boolean inviteVerified;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected GoogleAuthSessionEntity() {
    }

    public GoogleAuthSessionEntity(
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
            boolean inviteVerified,
            Instant now
    ) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.googleSubject = googleSubject;
        this.email = email;
        this.name = name;
        this.profileImageUrl = profileImageUrl;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiresAt = tokenExpiresAt;
        this.sessionExpiresAt = sessionExpiresAt;
        this.inviteVerified = inviteVerified;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public boolean isExpired(Instant now) {
        return sessionExpiresAt.isBefore(now);
    }

    public void updateToken(String accessToken, Instant tokenExpiresAt, Instant now) {
        this.accessToken = accessToken;
        this.tokenExpiresAt = tokenExpiresAt;
        this.updatedAt = now;
    }

    public String getSessionId() {
        return sessionId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getGoogleSubject() {
        return googleSubject;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public Instant getTokenExpiresAt() {
        return tokenExpiresAt;
    }

    public Instant getSessionExpiresAt() {
        return sessionExpiresAt;
    }

    public boolean isInviteVerified() {
        return inviteVerified;
    }
}
