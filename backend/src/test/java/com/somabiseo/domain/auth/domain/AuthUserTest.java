package com.somabiseo.domain.auth.domain;

import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class AuthUserTest {
    @Test
    void recordInviteFailureLocksUserAtMaxAttempts() {
        AuthUser user = AuthUser.google("zun_e@kakao.com", "zun", null, "google-subject");
        Instant now = Instant.parse("2026-05-20T08:00:00Z");

        assertThat(user.recordInviteFailure(now, 5, Duration.ofMinutes(10))).isEqualTo(4);
        assertThat(user.recordInviteFailure(now, 5, Duration.ofMinutes(10))).isEqualTo(3);
        assertThat(user.recordInviteFailure(now, 5, Duration.ofMinutes(10))).isEqualTo(2);
        assertThat(user.recordInviteFailure(now, 5, Duration.ofMinutes(10))).isEqualTo(1);
        assertThat(user.isInviteLocked(now)).isFalse();

        assertThat(user.recordInviteFailure(now, 5, Duration.ofMinutes(10))).isZero();

        assertThat(user.isInviteLocked(now.plusSeconds(1))).isTrue();
    }

    @Test
    void verifyInviteClearsFailureState() {
        AuthUser user = AuthUser.google("zun_e@kakao.com", "zun", null, "google-subject");
        Instant now = Instant.parse("2026-05-20T08:00:00Z");

        user.recordInviteFailure(now, 5, Duration.ofMinutes(10));
        user.verifyInvite(now.plusSeconds(30));

        assertThat(user.isInviteVerified()).isTrue();
        assertThat(user.isInviteLocked(now.plusSeconds(31))).isFalse();
    }
}
