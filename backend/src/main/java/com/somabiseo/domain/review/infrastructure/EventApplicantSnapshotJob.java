package com.somabiseo.domain.review.infrastructure;

import com.somabiseo.domain.portal.application.SomaPortalService;
import com.somabiseo.domain.portal.domain.SomaPortalEventApplicantResponse;
import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.review.domain.EventApplicantSnapshot;
import com.somabiseo.domain.somaevent.domain.SomaEvent;
import com.somabiseo.domain.somaevent.infrastructure.SomaEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
public class EventApplicantSnapshotJob {
    private static final Logger log = LoggerFactory.getLogger(EventApplicantSnapshotJob.class);

    private static final Duration LOOK_BACK = Duration.ofHours(6);
    private static final Duration LOOK_AHEAD = Duration.ofHours(2);

    private final SomaPortalService somaPortalService;
    private final SomaEventRepository somaEventRepository;
    private final EventApplicantSnapshotRepository applicantRepository;
    private final Clock clock;

    public EventApplicantSnapshotJob(
            SomaPortalService somaPortalService,
            SomaEventRepository somaEventRepository,
            EventApplicantSnapshotRepository applicantRepository,
            Clock clock
    ) {
        this.somaPortalService = somaPortalService;
        this.somaEventRepository = somaEventRepository;
        this.applicantRepository = applicantRepository;
        this.clock = clock;
    }

    @Scheduled(cron = "0 0 * * * *", zone = "Asia/Seoul")
    public void snapshotEndingEvents() {
        OffsetDateTime now = OffsetDateTime.now(clock.withZone(ZoneId.of("Asia/Seoul")));
        OffsetDateTime windowStart = now.minus(LOOK_BACK);
        OffsetDateTime windowEnd = now.plus(LOOK_AHEAD);

        List<SomaEvent> candidates = somaEventRepository.findByEndAtBetween(windowStart, windowEnd);

        if (candidates.isEmpty()) {
            return;
        }

        Instant snapshotAt = clock.instant();

        for (SomaEvent event : candidates) {
            try {
                snapshotOne(event, snapshotAt);
            } catch (RuntimeException exception) {
                log.warn("event_applicants 스냅샷 실패 sourceId={} : {}", event.getSourceId(), exception.getMessage());
            }
        }
    }

    private void snapshotOne(SomaEvent event, Instant snapshotAt) {
        SomaPortalEventResponse detail = somaPortalService.getPublicEventDetail(event.getSourceUrl());
        List<SomaPortalEventApplicantResponse> applicants = detail.applicants();

        if (applicants == null || applicants.isEmpty()) {
            return;
        }

        for (SomaPortalEventApplicantResponse applicant : applicants) {
            if (applicant.no() == null || applicant.no().isBlank()) {
                continue;
            }

            if (applicantRepository.existsBySomaEventIdAndApplicantNo(event.getId(), applicant.no())) {
                continue;
            }

            applicantRepository.save(EventApplicantSnapshot.create(
                    event.getId(),
                    applicant.no(),
                    applicant.traineeName(),
                    null,
                    null,
                    applicant.status() == null ? "UNKNOWN" : applicant.status(),
                    snapshotAt
            ));
        }
    }
}
