package com.somabiseo.domain.somaevent.infrastructure;

import com.somabiseo.domain.somaevent.domain.SomaEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface SomaEventRepository extends JpaRepository<SomaEvent, Long> {
    Optional<SomaEvent> findBySourceId(String sourceId);

    List<SomaEvent> findByEndAtBetween(OffsetDateTime from, OffsetDateTime to);

    @Query(
            value = """
                    select e from SomaEvent e
                    where e.endAt < :now
                      and (cast(:type as string) is null or cast(e.type as string) = cast(:type as string))
                      and (cast(:q as string) is null
                           or lower(e.title) like lower(concat('%', cast(:q as string), '%'))
                           or (e.mentorName is not null
                               and lower(e.mentorName) like lower(concat('%', cast(:q as string), '%'))))
                    """,
            countQuery = """
                    select count(e) from SomaEvent e
                    where e.endAt < :now
                      and (cast(:type as string) is null or cast(e.type as string) = cast(:type as string))
                      and (cast(:q as string) is null
                           or lower(e.title) like lower(concat('%', cast(:q as string), '%'))
                           or (e.mentorName is not null
                               and lower(e.mentorName) like lower(concat('%', cast(:q as string), '%'))))
                    """
    )
    Page<SomaEvent> findEndedEvents(
            @Param("now") OffsetDateTime now,
            @Param("type") String type,
            @Param("q") String q,
            Pageable pageable
    );
}
