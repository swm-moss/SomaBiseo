package com.somabiseo.domain.preference.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(
        name = "user_event_favorite_preferences",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_user_event_favorite_preference",
                columnNames = {"user_id", "event_source_id"}
        )
)
public class UserEventFavoritePreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "event_source_id", nullable = false, length = 255)
    private String eventSourceId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected UserEventFavoritePreference() {
    }

    public UserEventFavoritePreference(Long userId, String eventSourceId) {
        this.userId = userId;
        this.eventSourceId = eventSourceId;
    }

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }

    public String getEventSourceId() {
        return eventSourceId;
    }
}
