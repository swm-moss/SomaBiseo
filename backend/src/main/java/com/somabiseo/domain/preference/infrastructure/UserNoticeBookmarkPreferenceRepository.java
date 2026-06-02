package com.somabiseo.domain.preference.infrastructure;

import com.somabiseo.domain.preference.domain.UserNoticeBookmarkPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserNoticeBookmarkPreferenceRepository extends JpaRepository<UserNoticeBookmarkPreference, Long> {
    List<UserNoticeBookmarkPreference> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndNoticeSourceId(Long userId, String noticeSourceId);

    @Transactional
    void deleteByUserIdAndNoticeSourceId(Long userId, String noticeSourceId);
}
