package com.somabiseo.domain.review.application;

import com.somabiseo.domain.review.domain.EndedEventResponse;
import com.somabiseo.domain.review.infrastructure.ReviewRepository;
import com.somabiseo.domain.review.infrastructure.ReviewSummaryRow;
import com.somabiseo.domain.review.presentation.EndedEventPageResponse;
import com.somabiseo.domain.somaevent.domain.EventType;
import com.somabiseo.domain.somaevent.domain.SomaEvent;
import com.somabiseo.domain.somaevent.infrastructure.SomaEventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EndedEventQueryService {
    private static final int MAX_PAGE_SIZE = 100;

    private final SomaEventRepository somaEventRepository;
    private final ReviewRepository reviewRepository;
    private final Clock clock;

    public EndedEventQueryService(
            SomaEventRepository somaEventRepository,
            ReviewRepository reviewRepository,
            Clock clock
    ) {
        this.somaEventRepository = somaEventRepository;
        this.reviewRepository = reviewRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public EndedEventPageResponse find(EventType type, String q, int page, int size) {
        String normalizedType = type == null ? null : type.name();
        String normalizedQ = normalize(q);
        int safePage = Math.max(page - 1, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        PageRequest pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Order.desc("endAt"))
        );

        OffsetDateTime now = OffsetDateTime.now(clock.withZone(ZoneId.of("Asia/Seoul")));
        Page<SomaEvent> result = somaEventRepository.findEndedEvents(now, normalizedType, normalizedQ, pageable);

        Map<Long, Long> countById = loadReviewCounts(result.getContent());

        List<EndedEventResponse> items = result.getContent().stream()
                .map(event -> new EndedEventResponse(
                        event.getSourceId(),
                        event.getType(),
                        event.getTitle(),
                        event.getMentorName(),
                        event.getStartAt(),
                        event.getEndAt(),
                        countById.getOrDefault(event.getId(), 0L)
                ))
                .toList();

        return new EndedEventPageResponse(
                items,
                result.getNumber() + 1,
                result.getSize(),
                result.getTotalPages(),
                result.getTotalElements()
        );
    }

    private Map<Long, Long> loadReviewCounts(List<SomaEvent> events) {
        if (events.isEmpty()) {
            return Map.of();
        }

        List<Long> ids = events.stream().map(SomaEvent::getId).toList();
        Map<Long, Long> countById = new HashMap<>();

        for (ReviewSummaryRow row : reviewRepository.findSummariesIn(ids)) {
            countById.put(row.somaEventId(), row.reviewCount());
        }

        return countById;
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        return trimmed.isEmpty() ? null : trimmed;
    }
}
