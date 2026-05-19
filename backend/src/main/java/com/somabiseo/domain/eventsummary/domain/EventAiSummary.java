package com.somabiseo.domain.eventsummary.domain;

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
import java.util.Arrays;
import java.util.List;

@Entity
@Table(
        name = "event_ai_summaries",
        uniqueConstraints = @UniqueConstraint(name = "uk_event_ai_summary_source_hash", columnNames = {"source_id", "content_hash"})
)
public class EventAiSummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_id", nullable = false, length = 255)
    private String sourceId;

    @Column(name = "source_url", nullable = false, columnDefinition = "text")
    private String sourceUrl;

    @Column(name = "content_hash", nullable = false, length = 64)
    private String contentHash;

    @Column(name = "model", nullable = false, length = 80)
    private String model;

    @Column(name = "one_line", nullable = false, length = 500)
    private String oneLine;

    @Column(name = "summary_bullets", nullable = false, columnDefinition = "text")
    private String summaryBullets;

    @Column(name = "target_audience", nullable = false, columnDefinition = "text")
    private String targetAudience;

    @Column(name = "key_topics", nullable = false, columnDefinition = "text")
    private String keyTopics;

    @Column(name = "takeaways", nullable = false, columnDefinition = "text")
    private String takeaways;

    @Column(name = "difficulty", nullable = false, length = 20)
    private String difficulty;

    @Column(name = "input_tokens")
    private Integer inputTokens;

    @Column(name = "output_tokens")
    private Integer outputTokens;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected EventAiSummary() {
    }

    private EventAiSummary(
            String sourceId,
            String sourceUrl,
            String contentHash,
            String model,
            String oneLine,
            String summaryBullets,
            String targetAudience,
            String keyTopics,
            String takeaways,
            String difficulty,
            Integer inputTokens,
            Integer outputTokens
    ) {
        this.sourceId = sourceId;
        this.sourceUrl = sourceUrl;
        this.contentHash = contentHash;
        this.model = model;
        this.oneLine = oneLine;
        this.summaryBullets = summaryBullets;
        this.targetAudience = targetAudience;
        this.keyTopics = keyTopics;
        this.takeaways = takeaways;
        this.difficulty = difficulty;
        this.inputTokens = inputTokens;
        this.outputTokens = outputTokens;
    }

    public static EventAiSummary create(
            String sourceId,
            String sourceUrl,
            String contentHash,
            String model,
            EventAiSummaryPayload payload
    ) {
        return new EventAiSummary(
                sourceId,
                sourceUrl,
                contentHash,
                model,
                normalizeLine(payload.oneLine()),
                joinLines(payload.summaryBullets()),
                joinLines(payload.targetAudience()),
                joinLines(payload.keyTopics()),
                joinLines(payload.takeaways()),
                normalizeLine(payload.difficulty()),
                payload.inputTokens(),
                payload.outputTokens()
        );
    }

    public EventAiSummaryResponse toResponse(boolean cached) {
        return new EventAiSummaryResponse(
                sourceId,
                contentHash,
                model,
                cached,
                oneLine,
                splitLines(summaryBullets),
                splitLines(targetAudience),
                splitLines(keyTopics),
                splitLines(takeaways),
                difficulty,
                inputTokens,
                outputTokens,
                createdAt
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

    private static String joinLines(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "";
        }

        return values.stream()
                .flatMap(value -> Arrays.stream(value.replace('\uFFFC', '\n').split("\\R+")))
                .map(EventAiSummary::normalizeLine)
                .filter(value -> !value.isBlank())
                .reduce((left, right) -> left + "\n" + right)
                .orElse("");
    }

    private static List<String> splitLines(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }

        return value.lines()
                .map(EventAiSummary::normalizeLine)
                .filter(line -> !line.isBlank())
                .toList();
    }

    private static String normalizeLine(String value) {
        return value == null ? "" : value.replaceAll("\\s+", " ").trim();
    }
}
