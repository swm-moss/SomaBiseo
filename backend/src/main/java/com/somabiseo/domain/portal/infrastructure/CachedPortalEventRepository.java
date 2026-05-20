package com.somabiseo.domain.portal.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;

public interface CachedPortalEventRepository extends JpaRepository<CachedPortalEvent, Long> {
    Optional<CachedPortalEvent> findBySourceId(String sourceId);

    Optional<CachedPortalEvent> findBySourceUrl(String sourceUrl);

    @Query("select max(event.updatedAt) from CachedPortalEvent event")
    Optional<Instant> findLatestUpdatedAt();

    @Query(
            value = """
                    select event from CachedPortalEvent event
                    order by
                      case when event.startAt is null then 1 else 0 end,
                      event.startAt desc,
                      event.id desc
                    """,
            countQuery = "select count(event) from CachedPortalEvent event"
    )
    Page<CachedPortalEvent> findPageOrderByStartAtDesc(Pageable pageable);

    @Query(
            value = """
                    select event from CachedPortalEvent event
                    order by
                      case when event.startAt is null then 1 else 0 end,
                      event.startAt asc,
                      event.id asc
                    """,
            countQuery = "select count(event) from CachedPortalEvent event"
    )
    Page<CachedPortalEvent> findPageOrderByStartAtAsc(Pageable pageable);

    @Query(
            value = """
                    select event from CachedPortalEvent event
                    order by
                      case when event.registeredAt is null then 1 else 0 end,
                      event.registeredAt desc,
                      event.id desc
                    """,
            countQuery = "select count(event) from CachedPortalEvent event"
    )
    Page<CachedPortalEvent> findPageOrderByRegisteredAtDesc(Pageable pageable);

    @Query(
            value = """
                    select event from CachedPortalEvent event
                    order by
                      case when event.applicationEndAt is null then 1 else 0 end,
                      event.applicationEndAt asc,
                      case when event.startAt is null then 1 else 0 end,
                      event.startAt asc,
                      event.id asc
                    """,
            countQuery = "select count(event) from CachedPortalEvent event"
    )
    Page<CachedPortalEvent> findPageOrderByApplicationEndAtAsc(Pageable pageable);
}
