package com.somabiseo.domain.preference.infrastructure;

import com.somabiseo.domain.preference.domain.UserEventFavoritePreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserEventFavoritePreferenceRepository extends JpaRepository<UserEventFavoritePreference, Long> {
    List<UserEventFavoritePreference> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndEventSourceId(Long userId, String eventSourceId);

    @Transactional
    void deleteByUserIdAndEventSourceId(Long userId, String eventSourceId);
}
