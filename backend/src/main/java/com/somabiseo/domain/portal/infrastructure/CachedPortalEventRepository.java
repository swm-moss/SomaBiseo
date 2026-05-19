package com.somabiseo.domain.portal.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;

public interface CachedPortalEventRepository extends JpaRepository<CachedPortalEvent, Long> {
    Optional<CachedPortalEvent> findBySourceId(String sourceId);

    Optional<CachedPortalEvent> findBySourceUrl(String sourceUrl);

    @Query("select max(event.updatedAt) from CachedPortalEvent event")
    Optional<Instant> findLatestUpdatedAt();
}
