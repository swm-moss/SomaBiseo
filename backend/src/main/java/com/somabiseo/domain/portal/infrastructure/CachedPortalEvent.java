package com.somabiseo.domain.portal.infrastructure;

import com.somabiseo.domain.portal.domain.SomaPortalEventApplicantResponse;
import com.somabiseo.domain.portal.domain.SomaPortalEventDetailItem;
import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.portal.domain.SomaPortalException;
import com.somabiseo.domain.somaevent.domain.EventType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "soma_events")
public class CachedPortalEvent {
    private static final TypeReference<List<SomaPortalEventDetailItem>> DETAIL_ITEMS_TYPE = new TypeReference<>() {
    };
    private static final TypeReference<List<SomaPortalEventApplicantResponse>> APPLICANTS_TYPE = new TypeReference<>() {
    };

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_id", nullable = false, unique = true, length = 255)
    private String sourceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 40)
    private EventType type;

    @Column(name = "title", nullable = false, columnDefinition = "text")
    private String title;

    @Column(name = "mentor_name", columnDefinition = "text")
    private String mentorName;

    @Column(name = "topic", columnDefinition = "text")
    private String topic;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "location", columnDefinition = "text")
    private String location;

    @Column(name = "start_at")
    private OffsetDateTime startAt;

    @Column(name = "end_at")
    private OffsetDateTime endAt;

    @Column(name = "application_start_at")
    private OffsetDateTime applicationStartAt;

    @Column(name = "application_end_at")
    private OffsetDateTime applicationEndAt;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "applicant_count")
    private Integer applicantCount;

    @Column(name = "status", nullable = false, length = 40)
    private String status;

    @Column(name = "approval_status", length = 80)
    private String approvalStatus;

    @Column(name = "operation_type", length = 80)
    private String operationType;

    @Column(name = "author", columnDefinition = "text")
    private String author;

    @Column(name = "registered_at")
    private OffsetDateTime registeredAt;

    @Column(name = "source_url", nullable = false, columnDefinition = "text")
    private String sourceUrl;

    @Column(name = "detail_items_json", nullable = false, columnDefinition = "text")
    private String detailItemsJson = "[]";

    @Column(name = "content_text", columnDefinition = "text")
    private String contentText;

    @Column(name = "applicants_json", nullable = false, columnDefinition = "text")
    private String applicantsJson = "[]";

    @Column(name = "detail_synced_at")
    private Instant detailSyncedAt;

    @Column(name = "raw_text", nullable = false, columnDefinition = "text")
    private String rawText = "";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected CachedPortalEvent() {
    }

    public CachedPortalEvent(SomaPortalEventResponse response, ObjectMapper objectMapper) {
        this(response, objectMapper, false);
    }

    public CachedPortalEvent(SomaPortalEventResponse response, ObjectMapper objectMapper, boolean detailFetched) {
        this.sourceId = response.sourceId();
        update(response, objectMapper, detailFetched);
    }

    public void update(SomaPortalEventResponse response, ObjectMapper objectMapper) {
        update(response, objectMapper, false);
    }

    public void update(SomaPortalEventResponse response, ObjectMapper objectMapper, boolean detailFetched) {
        this.type = response.type();
        this.title = response.title();
        this.mentorName = response.mentorName();
        this.topic = response.topic();
        this.description = response.rawText();
        this.location = response.location();
        this.startAt = response.startAt();
        this.endAt = response.endAt();
        this.applicationStartAt = response.applicationStartAt();
        this.applicationEndAt = response.applicationEndAt();
        this.capacity = response.capacity();
        this.applicantCount = response.applicantCount();
        this.status = response.status() == null ? "UNKNOWN" : response.status();
        this.approvalStatus = response.approvalStatus();
        this.operationType = response.operationType();
        this.author = response.author();
        this.registeredAt = response.registeredAt();
        this.sourceUrl = response.sourceUrl();
        this.rawText = response.rawText() == null ? "" : response.rawText();

        if (detailFetched) {
            this.detailItemsJson = writeJson(objectMapper, response.detailItems() == null ? List.of() : response.detailItems());
            this.contentText = response.contentText() == null || response.contentText().isBlank()
                    ? null
                    : response.contentText();
            this.applicantsJson = writeJson(objectMapper, response.applicants() == null ? List.of() : response.applicants());
            this.detailSyncedAt = Instant.now();
        } else if (response.detailItems() != null && !response.detailItems().isEmpty()) {
            this.detailItemsJson = writeJson(objectMapper, response.detailItems());
            this.contentText = response.contentText();
            this.applicantsJson = writeJson(objectMapper, response.applicants() == null ? List.of() : response.applicants());
            this.detailSyncedAt = response.detailSyncedAt() == null ? Instant.now() : response.detailSyncedAt();
        }
    }

    public SomaPortalEventResponse toResponse(ObjectMapper objectMapper) {
        return new SomaPortalEventResponse(
                sourceId,
                type,
                title,
                mentorName,
                topic,
                location,
                startAt,
                endAt,
                applicationStartAt,
                applicationEndAt,
                capacity,
                applicantCount,
                status,
                approvalStatus,
                operationType,
                author,
                registeredAt,
                sourceUrl,
                readJson(objectMapper, detailItemsJson, DETAIL_ITEMS_TYPE),
                contentText,
                readJson(objectMapper, applicantsJson, APPLICANTS_TYPE),
                detailSyncedAt,
                rawText
        );
    }

    public boolean hasDetail() {
        return (contentText != null && !contentText.isBlank())
                || (detailItemsJson != null && !"[]".equals(detailItemsJson))
                || (applicantsJson != null && !"[]".equals(applicantsJson));
    }

    public Instant updatedAt() {
        return updatedAt;
    }

    public boolean detailFresh(Duration ttl, Instant now) {
        return hasDetail()
                && detailSyncedAt != null
                && detailSyncedAt.isAfter(now.minus(ttl));
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

    private static String writeJson(ObjectMapper objectMapper, Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new SomaPortalException("포털 캐시 JSON 저장에 실패했습니다.", exception);
        }
    }

    private static <T> T readJson(ObjectMapper objectMapper, String value, TypeReference<T> typeReference) {
        try {
            return objectMapper.readValue(value == null || value.isBlank() ? "[]" : value, typeReference);
        } catch (JsonProcessingException exception) {
            throw new SomaPortalException("포털 캐시 JSON 읽기에 실패했습니다.", exception);
        }
    }
}
