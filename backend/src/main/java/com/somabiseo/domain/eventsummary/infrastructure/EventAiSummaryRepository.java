package com.somabiseo.domain.eventsummary.infrastructure;

import com.somabiseo.domain.eventsummary.domain.EventAiSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventAiSummaryRepository extends JpaRepository<EventAiSummary, Long> {
    Optional<EventAiSummary> findBySourceIdAndContentHash(String sourceId, String contentHash);
}
