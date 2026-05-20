package com.somabiseo.domain.review.infrastructure;

import com.somabiseo.domain.review.domain.Review;
import com.somabiseo.domain.review.domain.ReviewFeedItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsBySomaEventIdAndAuthorName(Long somaEventId, String authorName);

    @Query("""
            select new com.somabiseo.domain.review.infrastructure.ReviewSummaryRow(
                r.somaEventId, count(r), max(r.createdAt)
            )
            from Review r
            where r.somaEventId in :somaEventIds
            group by r.somaEventId
            """)
    List<ReviewSummaryRow> findSummariesIn(Collection<Long> somaEventIds);

    @Query(
            value = """
                    select new com.somabiseo.domain.review.domain.ReviewFeedItem(
                        r.id, e.sourceId, e.title, e.type, e.mentorName, r.content, r.authorName, r.createdAt
                    )
                    from Review r
                    join SomaEvent e on e.id = r.somaEventId
                    where (cast(:q as string) is null
                           or lower(e.title) like lower(concat('%', cast(:q as string), '%'))
                           or (e.mentorName is not null and lower(e.mentorName) like lower(concat('%', cast(:q as string), '%')))
                           or lower(r.content) like lower(concat('%', cast(:q as string), '%')))
                      and (cast(:eventId as string) is null or e.sourceId = cast(:eventId as string))
                    order by r.createdAt desc, r.id desc
                    """,
            countQuery = """
                    select count(r)
                    from Review r
                    join SomaEvent e on e.id = r.somaEventId
                    where (cast(:q as string) is null
                           or lower(e.title) like lower(concat('%', cast(:q as string), '%'))
                           or (e.mentorName is not null and lower(e.mentorName) like lower(concat('%', cast(:q as string), '%')))
                           or lower(r.content) like lower(concat('%', cast(:q as string), '%')))
                      and (cast(:eventId as string) is null or e.sourceId = cast(:eventId as string))
                    """
    )
    Page<ReviewFeedItem> findFeed(@Param("q") String q, @Param("eventId") String eventId, Pageable pageable);
}
