package com.somabiseo.domain.portal.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;

public interface CachedPortalNoticeRepository extends JpaRepository<CachedPortalNotice, Long> {
    Optional<CachedPortalNotice> findBySourceId(String sourceId);

    @Query("select max(notice.updatedAt) from CachedPortalNotice notice")
    Optional<Instant> findLatestUpdatedAt();
}
