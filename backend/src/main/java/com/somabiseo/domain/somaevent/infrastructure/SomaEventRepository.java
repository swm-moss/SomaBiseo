package com.somabiseo.domain.somaevent.infrastructure;

import com.somabiseo.domain.somaevent.domain.SomaEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface SomaEventRepository extends JpaRepository<SomaEvent, Long> {
    Optional<SomaEvent> findBySourceId(String sourceId);

    List<SomaEvent> findByEndAtBetween(OffsetDateTime from, OffsetDateTime to);
}
