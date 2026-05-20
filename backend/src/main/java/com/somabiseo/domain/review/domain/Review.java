package com.somabiseo.domain.review.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(
        name = "reviews",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_review_event_user",
                columnNames = {"soma_event_id", "author_user_id"}
        )
)
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "soma_event_id", nullable = false)
    private Long somaEventId;

    @Column(name = "author_user_id", nullable = false)
    private Long authorUserId;

    @Column(name = "author_name", nullable = false, length = 100)
    private String authorName;

    @Column(name = "content", nullable = false, length = 500)
    private String content;

    @Column(name = "author_ip", length = 45)
    private String authorIp;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Review() {
    }

    private Review(Long somaEventId, Long authorUserId, String authorName, String content, String authorIp) {
        this.somaEventId = somaEventId;
        this.authorUserId = authorUserId;
        this.authorName = authorName;
        this.content = content;
        this.authorIp = authorIp;
    }

    public static Review create(
            Long somaEventId,
            Long authorUserId,
            String authorName,
            String content,
            String authorIp
    ) {
        return new Review(somaEventId, authorUserId, authorName, content, authorIp);
    }

    public void updateContent(String content) {
        this.content = content;
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

    public Long getSomaEventId() {
        return somaEventId;
    }

    public Long getAuthorUserId() {
        return authorUserId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public String getContent() {
        return content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
