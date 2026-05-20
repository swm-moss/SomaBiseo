package com.somabiseo.domain.calendar.infrastructure;

import com.somabiseo.domain.calendar.domain.GoogleCalendarEventLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface GoogleCalendarEventLinkRepository extends JpaRepository<GoogleCalendarEventLink, Long> {
    Optional<GoogleCalendarEventLink> findByCalendarSessionIdAndSourceIdAndCalendarId(
            String calendarSessionId,
            String sourceId,
            String calendarId
    );

    List<GoogleCalendarEventLink> findByCalendarSessionIdAndSourceIdInAndCalendarId(
            String calendarSessionId,
            List<String> sourceIds,
            String calendarId
    );

    @Transactional
    void deleteByCalendarSessionId(String calendarSessionId);

    @Transactional
    @Modifying
    @Query(
            value = """
                    insert into calendar_session_event_links (
                        calendar_session_id,
                        source_id,
                        calendar_id,
                        status,
                        created_at,
                        updated_at
                    )
                    values (
                        :calendarSessionId,
                        :sourceId,
                        :calendarId,
                        'PENDING',
                        now(),
                        now()
                    )
                    on conflict (calendar_session_id, source_id, calendar_id) do nothing
                    """,
            nativeQuery = true
    )
    int insertPending(
            @Param("calendarSessionId") String calendarSessionId,
            @Param("sourceId") String sourceId,
            @Param("calendarId") String calendarId
    );
}
