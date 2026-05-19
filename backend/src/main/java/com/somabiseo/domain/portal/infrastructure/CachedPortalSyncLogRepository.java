package com.somabiseo.domain.portal.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface CachedPortalSyncLogRepository extends JpaRepository<CachedPortalSyncLog, Long> {
    @Query("""
            select max(log.finishedAt)
            from CachedPortalSyncLog log
            where log.sourceType = :sourceType
              and log.status = 'SUCCESS'
            """)
    Optional<Instant> findLatestSuccessFinishedAt(@Param("sourceType") String sourceType);
}
