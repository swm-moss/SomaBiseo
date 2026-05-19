package com.somabiseo.domain.review.infrastructure;

import com.somabiseo.domain.review.domain.EventApplicantSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventApplicantSnapshotRepository extends JpaRepository<EventApplicantSnapshot, Long> {
    List<EventApplicantSnapshot> findBySomaEventId(Long somaEventId);

    boolean existsBySomaEventIdAndTraineeName(Long somaEventId, String traineeName);

    boolean existsBySomaEventIdAndApplicantNo(Long somaEventId, String applicantNo);
}
