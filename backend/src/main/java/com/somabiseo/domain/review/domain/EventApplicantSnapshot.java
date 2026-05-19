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
        name = "event_applicants",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_event_applicant",
                columnNames = {"soma_event_id", "applicant_no"}
        )
)
public class EventApplicantSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "soma_event_id", nullable = false)
    private Long somaEventId;

    @Column(name = "applicant_no", nullable = false, length = 40)
    private String applicantNo;

    @Column(name = "trainee_name", nullable = false, length = 100)
    private String traineeName;

    @Column(name = "applied_at")
    private Instant appliedAt;

    @Column(name = "canceled_at")
    private Instant canceledAt;

    @Column(name = "status", nullable = false, length = 40)
    private String status;

    @Column(name = "snapshot_at", nullable = false)
    private Instant snapshotAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected EventApplicantSnapshot() {
    }

    private EventApplicantSnapshot(
            Long somaEventId,
            String applicantNo,
            String traineeName,
            Instant appliedAt,
            Instant canceledAt,
            String status,
            Instant snapshotAt
    ) {
        this.somaEventId = somaEventId;
        this.applicantNo = applicantNo;
        this.traineeName = traineeName;
        this.appliedAt = appliedAt;
        this.canceledAt = canceledAt;
        this.status = status;
        this.snapshotAt = snapshotAt;
    }

    public static EventApplicantSnapshot create(
            Long somaEventId,
            String applicantNo,
            String traineeName,
            Instant appliedAt,
            Instant canceledAt,
            String status,
            Instant snapshotAt
    ) {
        return new EventApplicantSnapshot(
                somaEventId,
                applicantNo,
                traineeName,
                appliedAt,
                canceledAt,
                status,
                snapshotAt
        );
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

    public String getTraineeName() {
        return traineeName;
    }
}
