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
        name = "user_interest_topic_preferences",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_user_interest_topic_preference",
                columnNames = {"user_id", "topic_id"}
        )
)
public class UserInterestTopicPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "topic_id", nullable = false, length = 40)
    private String topicId;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected UserInterestTopicPreference() {
    }

    public UserInterestTopicPreference(Long userId, String topicId, int displayOrder) {
        this.userId = userId;
        this.topicId = topicId;
        this.displayOrder = displayOrder;
    }

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }

    public String getTopicId() {
        return topicId;
    }
}
