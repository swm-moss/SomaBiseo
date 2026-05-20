package com.somabiseo.domain.calendar.domain;

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
        name = "calendar_session_event_links",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_calendar_session_event_link",
                columnNames = {"calendar_session_id", "source_id", "calendar_id"}
        )
)
public class GoogleCalendarEventLink {
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_CREATED = "CREATED";
    private static final long PENDING_STALE_SECONDS = 300;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "calendar_session_id", nullable = false, length = 80)
    private String calendarSessionId;

    @Column(name = "source_id", nullable = false, length = 255)
    private String sourceId;

    @Column(name = "google_event_id", length = 255)
    private String googleEventId;

    @Column(name = "calendar_id", nullable = false, length = 255)
    private String calendarId;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected GoogleCalendarEventLink() {
    }

    private GoogleCalendarEventLink(String calendarSessionId, String sourceId, String calendarId) {
        this.calendarSessionId = calendarSessionId;
        this.sourceId = sourceId;
        this.calendarId = calendarId;
        this.status = STATUS_PENDING;
    }

    public static GoogleCalendarEventLink pending(String calendarSessionId, String sourceId, String calendarId) {
        return new GoogleCalendarEventLink(calendarSessionId, sourceId, calendarId);
    }

    public void markCreated(String googleEventId) {
        this.googleEventId = googleEventId;
        this.status = STATUS_CREATED;
    }

    public boolean isCreated() {
        return STATUS_CREATED.equals(status);
    }

    public boolean isStalePending(Instant now) {
        return STATUS_PENDING.equals(status) && updatedAt.plusSeconds(PENDING_STALE_SECONDS).isBefore(now);
    }

    public Long getId() {
        return id;
    }

    public String getGoogleEventId() {
        return googleEventId;
    }

    public String getCalendarId() {
        return calendarId;
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
}
