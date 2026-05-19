package com.somabiseo.domain.portal.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "source_sync_logs")
public class CachedPortalSyncLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_type", nullable = false, length = 40)
    private String sourceType;

    @Column(name = "status", nullable = false, length = 40)
    private String status;

    @Column(name = "message", columnDefinition = "text")
    private String message;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "finished_at")
    private Instant finishedAt;

    protected CachedPortalSyncLog() {
    }

    private CachedPortalSyncLog(String sourceType, String status, String message, Instant startedAt, Instant finishedAt) {
        this.sourceType = sourceType;
        this.status = status;
        this.message = message;
        this.startedAt = startedAt;
        this.finishedAt = finishedAt;
    }

    public static CachedPortalSyncLog success(String sourceType, String message) {
        Instant now = Instant.now();

        return new CachedPortalSyncLog(sourceType, "SUCCESS", message, now, now);
    }
}
