package com.somabiseo.domain.review.infrastructure;

import com.somabiseo.domain.review.domain.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
}
