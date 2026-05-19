package com.somabiseo.domain.eventsummary.application;

import com.somabiseo.domain.eventsummary.domain.EventAiSummary;
import com.somabiseo.domain.eventsummary.domain.EventAiSummaryException;
import com.somabiseo.domain.eventsummary.domain.EventAiSummaryPayload;
import com.somabiseo.domain.eventsummary.domain.EventAiSummaryResponse;
import com.somabiseo.domain.eventsummary.infrastructure.EventAiSummaryRepository;
import com.somabiseo.domain.eventsummary.infrastructure.OpenAiSummaryClient;
import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class EventAiSummaryService {
    private static final String PROMPT_VERSION = "soma-event-summary-v2";

    private final EventAiSummaryRepository summaryRepository;
    private final OpenAiSummaryClient openAiSummaryClient;

    public EventAiSummaryService(
            EventAiSummaryRepository summaryRepository,
            OpenAiSummaryClient openAiSummaryClient
    ) {
        this.summaryRepository = summaryRepository;
        this.openAiSummaryClient = openAiSummaryClient;
    }

    @Transactional
    public EventAiSummaryResponse getOrCreate(SomaPortalEventResponse event) {
        if (event.contentText() == null || event.contentText().isBlank()) {
            throw new EventAiSummaryException("요약할 멘토링 본문이 없습니다.");
        }

        String contentHash = contentHash(event);

        return summaryRepository.findBySourceIdAndContentHash(event.sourceId(), contentHash)
                .map(summary -> summary.toResponse(true))
                .orElseGet(() -> createSummary(event, contentHash));
    }

    public String contentHash(SomaPortalEventResponse event) {
        return sha256(String.join("\n",
                PROMPT_VERSION,
                value(event.sourceId()),
                value(event.title()),
                value(event.mentorName()),
                value(event.topic()),
                value(event.location()),
                value(event.startAt()),
                value(event.endAt()),
                value(event.contentText())
        ));
    }

    private EventAiSummaryResponse createSummary(SomaPortalEventResponse event, String contentHash) {
        EventAiSummaryPayload payload = openAiSummaryClient.summarize(event);
        EventAiSummary summary = EventAiSummary.create(
                event.sourceId(),
                event.sourceUrl(),
                contentHash,
                openAiSummaryClient.model(),
                payload
        );

        return summaryRepository.save(summary).toResponse(false);
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();

            for (byte item : hashed) {
                builder.append(String.format("%02x", item));
            }

            return builder.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 알고리즘을 사용할 수 없습니다.", exception);
        }
    }

    private String value(Object value) {
        return value == null ? "" : value.toString().trim();
    }
}
