package com.somabiseo.domain.portal.infrastructure;

import com.somabiseo.domain.somaevent.domain.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
                    where (:type is null or event.type = :type)
                      and (:q is null
                        or lower(event.title) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', :q, '%')))
                    order by
                      case when event.startAt is null then 1 else 0 end,
                      event.startAt desc,
                      event.id desc
                    """,
            countQuery = """
                    select count(event) from CachedPortalEvent event
                    where (:type is null or event.type = :type)
                      and (:q is null
                        or lower(event.title) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', :q, '%')))
                    """
    )
    Page<CachedPortalEvent> findPageOrderByStartAtDesc(
            @Param("type") EventType type,
            @Param("q") String q,
            Pageable pageable
    );

    @Query(
            value = """
                    select event from CachedPortalEvent event
                    where (:type is null or event.type = :type)
                      and (:q is null
                        or lower(event.title) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', :q, '%')))
                    order by
                      case when event.startAt is null then 1 else 0 end,
                      event.startAt asc,
                      event.id asc
                    """,
            countQuery = """
                    select count(event) from CachedPortalEvent event
                    where (:type is null or event.type = :type)
                      and (:q is null
                        or lower(event.title) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', :q, '%')))
                    """
    )
    Page<CachedPortalEvent> findPageOrderByStartAtAsc(
            @Param("type") EventType type,
            @Param("q") String q,
            Pageable pageable
    );

    @Query(
            value = """
                    select event from CachedPortalEvent event
                    where (:type is null or event.type = :type)
                      and (:q is null
                        or lower(event.title) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', :q, '%')))
                    order by
                      case when event.registeredAt is null then 1 else 0 end,
                      event.registeredAt desc,
                      event.id desc
                    """,
            countQuery = """
                    select count(event) from CachedPortalEvent event
                    where (:type is null or event.type = :type)
                      and (:q is null
                        or lower(event.title) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', :q, '%')))
                    """
    )
    Page<CachedPortalEvent> findPageOrderByRegisteredAtDesc(
            @Param("type") EventType type,
            @Param("q") String q,
            Pageable pageable
    );

    @Query(
            value = """
                    select event from CachedPortalEvent event
                    where (:type is null or event.type = :type)
                      and (:q is null
                        or lower(event.title) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', :q, '%')))
                    order by
                      case when event.applicationEndAt is null then 1 else 0 end,
                      event.applicationEndAt asc,
                      case when event.startAt is null then 1 else 0 end,
                      event.startAt asc,
                      event.id asc
                    """,
            countQuery = """
                    select count(event) from CachedPortalEvent event
                    where (:type is null or event.type = :type)
                      and (:q is null
                        or lower(event.title) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.mentorName, '')) like lower(concat('%', :q, '%'))
                        or lower(coalesce(event.topic, '')) like lower(concat('%', :q, '%')))
                    """
    )
    Page<CachedPortalEvent> findPageOrderByApplicationEndAtAsc(
            @Param("type") EventType type,
            @Param("q") String q,
            Pageable pageable
    );
}
