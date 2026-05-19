package com.somabiseo.domain.review.application;

import com.somabiseo.domain.review.domain.ReviewSummaryResponse;
import com.somabiseo.domain.review.infrastructure.ReviewRepository;
import com.somabiseo.domain.review.infrastructure.ReviewSummaryRow;
import com.somabiseo.domain.somaevent.domain.SomaEvent;
import com.somabiseo.domain.somaevent.infrastructure.SomaEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewSummaryQueryService {
    private final SomaEventRepository somaEventRepository;
    private final ReviewRepository reviewRepository;

    public ReviewSummaryQueryService(SomaEventRepository somaEventRepository, ReviewRepository reviewRepository) {
        this.somaEventRepository = somaEventRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public List<ReviewSummaryResponse> findSummaries(List<String> eventIds) {
        if (eventIds == null || eventIds.isEmpty()) {
            return List.of();
        }

        Map<String, Long> eventIdToSomaEventId = new HashMap<>();
        Map<Long, String> somaEventIdToEventId = new HashMap<>();

        for (String eventId : eventIds) {
            somaEventRepository.findBySourceId(eventId).ifPresent(event -> {
                eventIdToSomaEventId.put(eventId, event.getId());
                somaEventIdToEventId.put(event.getId(), event.getSourceId());
            });
        }

        if (eventIdToSomaEventId.isEmpty()) {
            return eventIds.stream()
                    .map(id -> new ReviewSummaryResponse(id, 0L, null))
                    .toList();
        }

        Map<Long, ReviewSummaryRow> rowById = new HashMap<>();

        for (ReviewSummaryRow row : reviewRepository.findSummariesIn(eventIdToSomaEventId.values())) {
            rowById.put(row.somaEventId(), row);
        }

        return eventIds.stream()
                .map(eventId -> {
                    Long somaEventId = eventIdToSomaEventId.get(eventId);

                    if (somaEventId == null) {
                        return new ReviewSummaryResponse(eventId, 0L, null);
                    }

                    ReviewSummaryRow row = rowById.get(somaEventId);

                    if (row == null) {
                        return new ReviewSummaryResponse(eventId, 0L, null);
                    }

                    return new ReviewSummaryResponse(eventId, row.reviewCount(), row.lastCreatedAt());
                })
                .toList();
    }
}
