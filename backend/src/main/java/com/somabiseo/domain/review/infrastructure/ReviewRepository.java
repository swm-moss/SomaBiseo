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
    Page<Review> findBySomaEventIdOrderByCreatedAtDesc(Long somaEventId, Pageable pageable);

    long countBySomaEventId(Long somaEventId);

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
                    where (:q is null
                           or lower(e.title) like lower(concat('%', :q, '%'))
                           or lower(coalesce(e.mentorName, '')) like lower(concat('%', :q, '%'))
                           or lower(r.content) like lower(concat('%', :q, '%')))
                      and (:eventId is null or e.sourceId = :eventId)
                    order by r.createdAt desc
                    """,
            countQuery = """
                    select count(r)
                    from Review r
                    join SomaEvent e on e.id = r.somaEventId
                    where (:q is null
                           or lower(e.title) like lower(concat('%', :q, '%'))
                           or lower(coalesce(e.mentorName, '')) like lower(concat('%', :q, '%'))
                           or lower(r.content) like lower(concat('%', :q, '%')))
                      and (:eventId is null or e.sourceId = :eventId)
                    """
    )
    Page<ReviewFeedItem> findFeed(@Param("q") String q, @Param("eventId") String eventId, Pageable pageable);
}
