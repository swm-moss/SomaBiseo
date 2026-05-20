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
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EndedEventQueryService {
    private static final int MAX_PAGE_SIZE = 100;
    private static final ZoneId SEOUL_ZONE = ZoneId.of("Asia/Seoul");
    private static final OffsetDateTime EARLIEST =
            OffsetDateTime.of(1970, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC);
    private static final OffsetDateTime LATEST =
            OffsetDateTime.of(9999, 12, 31, 23, 59, 59, 0, ZoneOffset.UTC);

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
    public EndedEventPageResponse find(EventType type, String q, LocalDate date, int page, int size) {
        String normalizedType = type == null ? null : type.name();
        String normalizedQ = normalize(q);
        int safePage = Math.max(page - 1, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        PageRequest pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Order.desc("endAt"), Sort.Order.desc("id"))
        );

        OffsetDateTime now = OffsetDateTime.now(clock.withZone(SEOUL_ZONE));
        OffsetDateTime dayStart = date == null
                ? EARLIEST
                : date.atStartOfDay(SEOUL_ZONE).toOffsetDateTime();
        OffsetDateTime dayEnd = date == null
                ? LATEST
                : date.plusDays(1).atStartOfDay(SEOUL_ZONE).toOffsetDateTime();
        Page<SomaEvent> result = somaEventRepository.findEndedEvents(
                now, normalizedType, normalizedQ, dayStart, dayEnd, pageable);

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
