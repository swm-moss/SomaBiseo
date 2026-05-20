package com.somabiseo.domain.somaevent.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "soma_events")
public class SomaEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_id", nullable = false, length = 255, unique = true)
    private String sourceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 40)
    private EventType type;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "mentor_name", length = 100)
    private String mentorName;

    @Column(name = "start_at", nullable = false)
    private OffsetDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private OffsetDateTime endAt;

    @Column(name = "source_url", nullable = false, columnDefinition = "text")
    private String sourceUrl;

    protected SomaEvent() {
    }

    public Long getId() {
        return id;
    }

    public String getSourceId() {
        return sourceId;
    }

    public EventType getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getMentorName() {
        return mentorName;
    }

    public OffsetDateTime getStartAt() {
        return startAt;
    }

    public OffsetDateTime getEndAt() {
        return endAt;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }
}
