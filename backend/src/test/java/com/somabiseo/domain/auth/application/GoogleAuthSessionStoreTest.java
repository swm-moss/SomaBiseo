package com.somabiseo.domain.auth.application;

import com.somabiseo.domain.auth.domain.GoogleAuthSessionEntity;
import com.somabiseo.domain.auth.infrastructure.GoogleAuthSessionRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class GoogleAuthSessionStoreTest {
    private final Instant now = Instant.parse("2026-05-20T12:00:00Z");
    private final GoogleAuthSessionRepository sessionRepository = mock(GoogleAuthSessionRepository.class);
    private final GoogleAuthSessionStore sessionStore = new GoogleAuthSessionStore(
            sessionRepository,
            Clock.fixed(now, ZoneOffset.UTC)
    );

    @Test
    void savePersistsSessionInRepository() {
        when(sessionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = sessionStore.save(
                1L,
                "google-subject",
                "zun@example.com",
                "주인님",
                "https://example.com/profile.png",
                "access-token",
                "refresh-token",
                now.plusSeconds(3600),
                now.plusSeconds(86400),
                true
        );

        ArgumentCaptor<GoogleAuthSessionEntity> captor = ArgumentCaptor.forClass(GoogleAuthSessionEntity.class);
        verify(sessionRepository).save(captor.capture());

        assertThat(response.sessionId()).isNotBlank();
        assertThat(captor.getValue().getSessionId()).isEqualTo(response.sessionId());
        assertThat(captor.getValue().getUserId()).isEqualTo(1L);
        assertThat(captor.getValue().getAccessToken()).isEqualTo("access-token");
    }

    @Test
    void findDeletesExpiredSession() {
        GoogleAuthSessionEntity expired = new GoogleAuthSessionEntity(
                "session-id",
                1L,
                "google-subject",
                "zun@example.com",
                "주인님",
                null,
                "access-token",
                "refresh-token",
                now.minusSeconds(10),
                now.minusSeconds(1),
                true,
                now.minusSeconds(3600)
        );
        when(sessionRepository.findById("session-id")).thenReturn(Optional.of(expired));

        Optional<GoogleAuthSessionStore.GoogleAuthSession> session = sessionStore.find("session-id");

        assertThat(session).isEmpty();
        verify(sessionRepository).deleteById("session-id");
    }
}
