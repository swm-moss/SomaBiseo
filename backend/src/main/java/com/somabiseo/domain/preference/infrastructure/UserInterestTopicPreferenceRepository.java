package com.somabiseo.domain.preference.infrastructure;

import com.somabiseo.domain.preference.domain.UserInterestTopicPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserInterestTopicPreferenceRepository extends JpaRepository<UserInterestTopicPreference, Long> {
    List<UserInterestTopicPreference> findByUserIdOrderByDisplayOrderAsc(Long userId);

    boolean existsByUserIdAndTopicId(Long userId, String topicId);

    @Transactional
    void deleteByUserId(Long userId);
}
