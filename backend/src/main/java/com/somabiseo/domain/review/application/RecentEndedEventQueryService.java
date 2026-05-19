package com.somabiseo.domain.review.application;

import com.somabiseo.domain.review.domain.RecentEndedEventResponse;
import com.somabiseo.domain.review.infrastructure.ReviewRepository;
import com.somabiseo.domain.review.infrastructure.ReviewSummaryRow;
import com.somabiseo.domain.somaevent.domain.SomaEvent;
import com.somabiseo.domain.somaevent.infrastructure.SomaEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RecentEndedEventQueryService {
    private final SomaEventRepository somaEventRepository;
    private final ReviewRepository reviewRepository;
    private final Clock clock;

    public RecentEndedEventQueryService(
            SomaEventRepository somaEventRepository,
            ReviewRepository reviewRepository,
            Clock clock
    ) {
        this.somaEventRepository = somaEventRepository;
        this.reviewRepository = reviewRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<RecentEndedEventResponse> findRecent(int limit) {
        int safeLimit = Math.max(limit, 1);
        OffsetDateTime now = OffsetDateTime.now(clock.withZone(ZoneId.of("Asia/Seoul")));
        OffsetDateTime windowStart = now.minus(ReviewService.REVIEW_WINDOW);

        List<SomaEvent> events = somaEventRepository.findByEndAtBetween(windowStart, now).stream()
                .sorted(Comparator.comparing(SomaEvent::getEndAt).reversed())
                .limit(safeLimit)
                .toList();

        if (events.isEmpty()) {
            return List.of();
        }

        List<Long> ids = events.stream().map(SomaEvent::getId).toList();
        Map<Long, Long> countById = new HashMap<>();

        for (ReviewSummaryRow row : reviewRepository.findSummariesIn(ids)) {
            countById.put(row.somaEventId(), row.reviewCount());
        }

        return events.stream()
                .map(event -> new RecentEndedEventResponse(
                        event.getSourceId(),
                        event.getType(),
                        event.getTitle(),
                        event.getMentorName(),
                        event.getEndAt(),
                        countById.getOrDefault(event.getId(), 0L)
                ))
                .toList();
    }
}
