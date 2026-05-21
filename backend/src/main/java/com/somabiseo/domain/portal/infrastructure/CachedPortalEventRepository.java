package com.somabiseo.domain.portal.infrastructure;

import com.somabiseo.domain.somaevent.domain.EventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface CachedPortalEventRepository extends JpaRepository<CachedPortalEvent, Long> {
    Optional<CachedPortalEvent> findBySourceId(String sourceId);

    Optional<CachedPortalEvent> findBySourceUrl(String sourceUrl);

    @Query("select max(event.updatedAt) from CachedPortalEvent event")
    Optional<Instant> findLatestUpdatedAt();

    @Query(
            """
                    select event from CachedPortalEvent event
                    where (event.location is null or trim(event.location) = '')
                      and event.detailSyncedAt is null
                    order by
                      case when event.startAt is null then 1 else 0 end,
                      event.startAt desc,
                      event.id desc
                    """
    )
    List<CachedPortalEvent> findDisplayDetailHydrationCandidates(Pageable pageable);

    @Query(
            value = """
                    select event from CachedPortalEvent event
                    where (:type is null or event.type = :type)
                      and (cast(:mode as string) is null
                        or lower(coalesce(event.operationType, '')) like lower(concat('%', cast(:mode as string), '%')))
                      and (cast(:q as string) is null
                        or lower(event.title) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', cast(:q as string), '%')))
                      and (cast(:dateFrom as timestamp) is null
                        or (event.startAt is not null and event.startAt >= :dateFrom and event.startAt < :dateTo))
                      and (cast(:activeAt as timestamp) is null
                        or (event.endAt is not null and event.endAt >= :activeAt)
                        or (event.endAt is null and event.startAt is not null and event.startAt >= :activeAt))
                    order by
                      case when event.startAt is null then 1 else 0 end,
                      event.startAt desc,
                      event.id desc
                    """,
            countQuery = """
                    select count(event) from CachedPortalEvent event
                    where (:type is null or event.type = :type)
                      and (cast(:mode as string) is null
                        or lower(coalesce(event.operationType, '')) like lower(concat('%', cast(:mode as string), '%')))
                      and (cast(:q as string) is null
                        or lower(event.title) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', cast(:q as string), '%')))
                      and (cast(:dateFrom as timestamp) is null
                        or (event.startAt is not null and event.startAt >= :dateFrom and event.startAt < :dateTo))
                      and (cast(:activeAt as timestamp) is null
                        or (event.endAt is not null and event.endAt >= :activeAt)
                        or (event.endAt is null and event.startAt is not null and event.startAt >= :activeAt))
                    """
    )
    Page<CachedPortalEvent> findPageOrderByStartAtDesc(
            @Param("type") EventType type,
            @Param("mode") String mode,
            @Param("q") String q,
            @Param("dateFrom") OffsetDateTime dateFrom,
            @Param("dateTo") OffsetDateTime dateTo,
            @Param("activeAt") OffsetDateTime activeAt,
            Pageable pageable
    );

    @Query(
            value = """
                    select event from CachedPortalEvent event
                    where (:type is null or event.type = :type)
                      and (cast(:mode as string) is null
                        or lower(coalesce(event.operationType, '')) like lower(concat('%', cast(:mode as string), '%')))
                      and (cast(:q as string) is null
                        or lower(event.title) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', cast(:q as string), '%')))
                      and (cast(:dateFrom as timestamp) is null
                        or (event.startAt is not null and event.startAt >= :dateFrom and event.startAt < :dateTo))
                      and (cast(:activeAt as timestamp) is null
                        or (event.endAt is not null and event.endAt >= :activeAt)
                        or (event.endAt is null and event.startAt is not null and event.startAt >= :activeAt))
                    order by
                      case
                        when event.startAt is null then 2
                        when event.startAt >= :now then 0
                        else 1
                      end asc,
                      case when event.startAt is not null and event.startAt >= :now then event.startAt else null end asc,
                      case when event.startAt is not null and event.startAt < :now then event.startAt else null end desc,
                      event.id asc
                    """,
            countQuery = """
                    select count(event) from CachedPortalEvent event
                    where (:type is null or event.type = :type)
                      and (cast(:mode as string) is null
                        or lower(coalesce(event.operationType, '')) like lower(concat('%', cast(:mode as string), '%')))
                      and (cast(:q as string) is null
                        or lower(event.title) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', cast(:q as string), '%')))
                      and (cast(:dateFrom as timestamp) is null
                        or (event.startAt is not null and event.startAt >= :dateFrom and event.startAt < :dateTo))
                      and (cast(:activeAt as timestamp) is null
                        or (event.endAt is not null and event.endAt >= :activeAt)
                        or (event.endAt is null and event.startAt is not null and event.startAt >= :activeAt))
                    """
    )
    Page<CachedPortalEvent> findPageOrderByStartAtAsc(
            @Param("type") EventType type,
            @Param("mode") String mode,
            @Param("q") String q,
            @Param("dateFrom") OffsetDateTime dateFrom,
            @Param("dateTo") OffsetDateTime dateTo,
            @Param("activeAt") OffsetDateTime activeAt,
            @Param("now") OffsetDateTime now,
            Pageable pageable
    );

    @Query(
            value = """
                    select event from CachedPortalEvent event
                    where (:type is null or event.type = :type)
                      and (cast(:mode as string) is null
                        or lower(coalesce(event.operationType, '')) like lower(concat('%', cast(:mode as string), '%')))
                      and (cast(:q as string) is null
                        or lower(event.title) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', cast(:q as string), '%')))
                      and (cast(:dateFrom as timestamp) is null
                        or (event.startAt is not null and event.startAt >= :dateFrom and event.startAt < :dateTo))
                      and (cast(:activeAt as timestamp) is null
                        or (event.endAt is not null and event.endAt >= :activeAt)
                        or (event.endAt is null and event.startAt is not null and event.startAt >= :activeAt))
                    order by
                      case when event.registeredAt is null then 1 else 0 end,
                      event.registeredAt desc,
                      event.id desc
                    """,
            countQuery = """
                    select count(event) from CachedPortalEvent event
                    where (:type is null or event.type = :type)
                      and (cast(:mode as string) is null
                        or lower(coalesce(event.operationType, '')) like lower(concat('%', cast(:mode as string), '%')))
                      and (cast(:q as string) is null
                        or lower(event.title) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', cast(:q as string), '%')))
                      and (cast(:dateFrom as timestamp) is null
                        or (event.startAt is not null and event.startAt >= :dateFrom and event.startAt < :dateTo))
                      and (cast(:activeAt as timestamp) is null
                        or (event.endAt is not null and event.endAt >= :activeAt)
                        or (event.endAt is null and event.startAt is not null and event.startAt >= :activeAt))
                    """
    )
    Page<CachedPortalEvent> findPageOrderByRegisteredAtDesc(
            @Param("type") EventType type,
            @Param("mode") String mode,
            @Param("q") String q,
            @Param("dateFrom") OffsetDateTime dateFrom,
            @Param("dateTo") OffsetDateTime dateTo,
            @Param("activeAt") OffsetDateTime activeAt,
            Pageable pageable
    );

    @Query(
            value = """
                    select event from CachedPortalEvent event
                    where (:type is null or event.type = :type)
                      and (cast(:mode as string) is null
                        or lower(coalesce(event.operationType, '')) like lower(concat('%', cast(:mode as string), '%')))
                      and (cast(:q as string) is null
                        or lower(event.title) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', cast(:q as string), '%')))
                      and (cast(:dateFrom as timestamp) is null
                        or (event.startAt is not null and event.startAt >= :dateFrom and event.startAt < :dateTo))
                      and (cast(:activeAt as timestamp) is null
                        or (event.endAt is not null and event.endAt >= :activeAt)
                        or (event.endAt is null and event.startAt is not null and event.startAt >= :activeAt))
                    order by
                      case
                        when upper(event.status) = 'OPEN'
                          and event.capacity is not null
                          and event.applicantCount is not null
                          and event.capacity - event.applicantCount > 0
                        then (event.capacity - event.applicantCount)
                        else 1000000000
                      end asc,
                      event.id asc
                    """,
            countQuery = """
                    select count(event) from CachedPortalEvent event
                    where (:type is null or event.type = :type)
                      and (cast(:mode as string) is null
                        or lower(coalesce(event.operationType, '')) like lower(concat('%', cast(:mode as string), '%')))
                      and (cast(:q as string) is null
                        or lower(event.title) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', cast(:q as string), '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', cast(:q as string), '%')))
                      and (cast(:dateFrom as timestamp) is null
                        or (event.startAt is not null and event.startAt >= :dateFrom and event.startAt < :dateTo))
                      and (cast(:activeAt as timestamp) is null
                        or (event.endAt is not null and event.endAt >= :activeAt)
                        or (event.endAt is null and event.startAt is not null and event.startAt >= :activeAt))
                    """
    )
    Page<CachedPortalEvent> findPageOrderByRemainingSeatsAsc(
            @Param("type") EventType type,
            @Param("mode") String mode,
            @Param("q") String q,
            @Param("dateFrom") OffsetDateTime dateFrom,
            @Param("dateTo") OffsetDateTime dateTo,
            @Param("activeAt") OffsetDateTime activeAt,
            Pageable pageable
    );

    @Query("""
            select event from CachedPortalEvent event
            where upper(event.status) = 'OPEN'
              and event.capacity is not null
              and event.applicantCount is not null
              and event.capacity - event.applicantCount > 0
            order by (event.capacity - event.applicantCount) asc, event.id asc
            """)
    List<CachedPortalEvent> findAlmostFullOpenEvents(Pageable pageable);
}
