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
        name = "user_notice_bookmark_preferences",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_user_notice_bookmark_preference",
                columnNames = {"user_id", "notice_source_id"}
        )
)
public class UserNoticeBookmarkPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "notice_source_id", nullable = false, length = 255)
    private String noticeSourceId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected UserNoticeBookmarkPreference() {
    }

    public UserNoticeBookmarkPreference(Long userId, String noticeSourceId) {
        this.userId = userId;
        this.noticeSourceId = noticeSourceId;
    }

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }

    public String getNoticeSourceId() {
        return noticeSourceId;
    }
}
