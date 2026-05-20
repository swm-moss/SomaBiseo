package com.somabiseo.domain.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Duration;
import java.time.Instant;

@Entity
@Table(name = "users")
public class AuthUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "profile_image_url", columnDefinition = "text")
    private String profileImageUrl;

    @Column(nullable = false, length = 30)
    private String provider;

    @Column(name = "provider_id", length = 255)
    private String providerId;

    @Column(name = "invite_verified_at")
    private Instant inviteVerifiedAt;

    @Column(name = "invite_failed_attempts", nullable = false)
    private int inviteFailedAttempts;

    @Column(name = "invite_locked_until")
    private Instant inviteLockedUntil;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AuthUser() {
    }

    private AuthUser(String email, String name, String profileImageUrl, String provider, String providerId) {
        this.email = normalizeEmail(email);
        this.name = name;
        this.profileImageUrl = profileImageUrl;
        this.provider = provider;
        this.providerId = providerId;
    }

    public static AuthUser google(String email, String name, String profileImageUrl, String providerId) {
        return new AuthUser(email, name, profileImageUrl, "GOOGLE", providerId);
    }

    public void updateGoogleProfile(String email, String name, String profileImageUrl, String providerId) {
        this.email = normalizeEmail(email);
        this.name = name;
        this.profileImageUrl = profileImageUrl;
        this.provider = "GOOGLE";
        this.providerId = providerId;
    }

    public boolean isInviteVerified() {
        return inviteVerifiedAt != null;
    }

    public boolean isInviteLocked(Instant now) {
        return inviteLockedUntil != null && inviteLockedUntil.isAfter(now);
    }

    public void verifyInvite(Instant now) {
        inviteVerifiedAt = now;
        inviteFailedAttempts = 0;
        inviteLockedUntil = null;
    }

    public int recordInviteFailure(Instant now, int maxAttempts, Duration lockDuration) {
        inviteFailedAttempts += 1;

        if (inviteFailedAttempts >= maxAttempts) {
            inviteLockedUntil = now.plus(lockDuration);
        }

        return Math.max(maxAttempts - inviteFailedAttempts, 0);
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
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

    public Instant getInviteLockedUntil() {
        return inviteLockedUntil;
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
