package com.somabiseo.domain.review.application;

import com.somabiseo.domain.review.domain.EventApplicantSnapshot;
import com.somabiseo.domain.review.domain.WritableEventResponse;
import com.somabiseo.domain.review.infrastructure.EventApplicantSnapshotRepository;
import com.somabiseo.domain.somaevent.domain.SomaEvent;
import com.somabiseo.domain.somaevent.infrastructure.SomaEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WritableEventQueryService {
    private final SomaEventRepository somaEventRepository;
    private final EventApplicantSnapshotRepository applicantRepository;
    private final Clock clock;

    public WritableEventQueryService(
            SomaEventRepository somaEventRepository,
            EventApplicantSnapshotRepository applicantRepository,
            Clock clock
    ) {
        this.somaEventRepository = somaEventRepository;
        this.applicantRepository = applicantRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<WritableEventResponse> findWritable() {
        OffsetDateTime now = OffsetDateTime.now(clock.withZone(ZoneId.of("Asia/Seoul")));
        OffsetDateTime windowStart = now.minus(ReviewService.REVIEW_WINDOW);

        List<SomaEvent> candidates = somaEventRepository.findByEndAtBetween(windowStart, now);

        if (candidates.isEmpty()) {
            return List.of();
        }

        List<Long> ids = candidates.stream().map(SomaEvent::getId).toList();
        Map<Long, List<String>> applicantsByEvent = applicantRepository.findAll().stream()
                .filter(snapshot -> ids.contains(snapshot.getSomaEventId()))
                .collect(Collectors.groupingBy(
                        EventApplicantSnapshot::getSomaEventId,
                        Collectors.mapping(EventApplicantSnapshot::getTraineeName, Collectors.toList())
                ));

        return candidates.stream()
                .map(event -> {
                    List<String> applicants = applicantsByEvent.getOrDefault(event.getId(), List.of());
                    return new WritableEventResponse(
                            event.getSourceId(),
                            event.getType(),
                            event.getTitle(),
                            event.getMentorName(),
                            event.getEndAt(),
                            applicants
                    );
                })
                .filter(response -> !response.applicants().isEmpty())
                .sorted(Comparator.comparing(WritableEventResponse::endAt).reversed())
                .toList();
    }
}
