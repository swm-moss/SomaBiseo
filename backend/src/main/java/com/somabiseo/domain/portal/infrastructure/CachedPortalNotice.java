package com.somabiseo.domain.portal.infrastructure;

import com.somabiseo.domain.notice.domain.NoticeCategory;
import com.somabiseo.domain.portal.domain.SomaPortalNoticeResponse;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.OffsetDateTime;

@Entity
@Table(name = "notices")
public class CachedPortalNotice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_id", nullable = false, unique = true, length = 255)
    private String sourceId;

    @Column(name = "title", nullable = false, columnDefinition = "text")
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "text")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 40)
    private NoticeCategory category;

    @Column(name = "source_url", nullable = false, columnDefinition = "text")
    private String sourceUrl;

    @Column(name = "is_important", nullable = false)
    private boolean important;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected CachedPortalNotice() {
    }

    public CachedPortalNotice(SomaPortalNoticeResponse response) {
        this.sourceId = response.sourceId();
        update(response);
    }

    public void update(SomaPortalNoticeResponse response) {
        this.title = response.title();
        this.content = response.rawText() == null ? "" : response.rawText();
        this.category = inferCategory(response);
        this.sourceUrl = response.sourceUrl();
        this.important = title.contains("필수") || title.contains("중요");
        this.publishedAt = response.publishedAt();
    }

    public SomaPortalNoticeResponse toResponse() {
        return new SomaPortalNoticeResponse(
                sourceId,
                title,
                sourceUrl,
                publishedAt,
                content
        );
    }

    public Instant updatedAt() {
        return updatedAt;
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

    private static NoticeCategory inferCategory(SomaPortalNoticeResponse response) {
        String text = response.title() + " " + response.rawText();

        if (text.contains("멘토링")) {
            return NoticeCategory.MENTORING;
        }

        if (text.contains("특강")) {
            return NoticeCategory.LECTURE;
        }

        if (text.contains("필수") || text.contains("센터") || text.contains("팀")) {
            return NoticeCategory.ADMIN;
        }

        return NoticeCategory.GENERAL;
    }
}
