package com.somabiseo.domain.preference.application;

import com.somabiseo.domain.preference.domain.UserEventFavoritePreference;
import com.somabiseo.domain.preference.domain.UserInterestTopicPreference;
import com.somabiseo.domain.preference.domain.UserNoticeBookmarkPreference;
import com.somabiseo.domain.preference.domain.UserPreferencesResponse;
import com.somabiseo.domain.preference.infrastructure.UserEventFavoritePreferenceRepository;
import com.somabiseo.domain.preference.infrastructure.UserInterestTopicPreferenceRepository;
import com.somabiseo.domain.preference.infrastructure.UserNoticeBookmarkPreferenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

@Service
public class UserPreferenceService {
    private final UserNoticeBookmarkPreferenceRepository noticeBookmarkRepository;
    private final UserEventFavoritePreferenceRepository eventFavoriteRepository;
    private final UserInterestTopicPreferenceRepository interestTopicRepository;

    public UserPreferenceService(
            UserNoticeBookmarkPreferenceRepository noticeBookmarkRepository,
            UserEventFavoritePreferenceRepository eventFavoriteRepository,
            UserInterestTopicPreferenceRepository interestTopicRepository
    ) {
        this.noticeBookmarkRepository = noticeBookmarkRepository;
        this.eventFavoriteRepository = eventFavoriteRepository;
        this.interestTopicRepository = interestTopicRepository;
    }

    @Transactional(readOnly = true)
    public UserPreferencesResponse findByUser(Long userId) {
        return new UserPreferencesResponse(
                noticeBookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                        .map(UserNoticeBookmarkPreference::getNoticeSourceId)
                        .toList(),
                eventFavoriteRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                        .map(UserEventFavoritePreference::getEventSourceId)
                        .toList(),
                interestTopicRepository.findByUserIdOrderByDisplayOrderAsc(userId).stream()
                        .map(UserInterestTopicPreference::getTopicId)
                        .toList()
        );
    }

    @Transactional
    public UserPreferencesResponse bookmarkNotice(Long userId, String noticeSourceId) {
        String normalizedId = normalizeRequiredId(noticeSourceId);

        if (!noticeBookmarkRepository.existsByUserIdAndNoticeSourceId(userId, normalizedId)) {
            noticeBookmarkRepository.save(new UserNoticeBookmarkPreference(userId, normalizedId));
        }

        return findByUser(userId);
    }

    @Transactional
    public UserPreferencesResponse unbookmarkNotice(Long userId, String noticeSourceId) {
        noticeBookmarkRepository.deleteByUserIdAndNoticeSourceId(userId, normalizeRequiredId(noticeSourceId));

        return findByUser(userId);
    }

    @Transactional
    public UserPreferencesResponse favoriteEvent(Long userId, String eventSourceId) {
        String normalizedId = normalizeRequiredId(eventSourceId);

        if (!eventFavoriteRepository.existsByUserIdAndEventSourceId(userId, normalizedId)) {
            eventFavoriteRepository.save(new UserEventFavoritePreference(userId, normalizedId));
        }

        return findByUser(userId);
    }

    @Transactional
    public UserPreferencesResponse unfavoriteEvent(Long userId, String eventSourceId) {
        eventFavoriteRepository.deleteByUserIdAndEventSourceId(userId, normalizeRequiredId(eventSourceId));

        return findByUser(userId);
    }

    @Transactional
    public UserPreferencesResponse replaceInterestTopics(Long userId, List<String> topicIds) {
        interestTopicRepository.deleteByUserId(userId);

        List<String> normalizedTopicIds = normalizeTopicIds(topicIds);
        List<UserInterestTopicPreference> preferences = new ArrayList<>();

        for (int index = 0; index < normalizedTopicIds.size(); index += 1) {
            preferences.add(new UserInterestTopicPreference(userId, normalizedTopicIds.get(index), index));
        }

        interestTopicRepository.saveAll(preferences);

        return findByUser(userId);
    }

    @Transactional
    public UserPreferencesResponse mergeFromClient(
            Long userId,
            List<String> noticeBookmarkIds,
            List<String> eventFavoriteIds,
            List<String> interestTopicIds
    ) {
        for (String noticeBookmarkId : normalizeIds(noticeBookmarkIds, 255)) {
            if (!noticeBookmarkRepository.existsByUserIdAndNoticeSourceId(userId, noticeBookmarkId)) {
                noticeBookmarkRepository.save(new UserNoticeBookmarkPreference(userId, noticeBookmarkId));
            }
        }

        for (String eventFavoriteId : normalizeIds(eventFavoriteIds, 255)) {
            if (!eventFavoriteRepository.existsByUserIdAndEventSourceId(userId, eventFavoriteId)) {
                eventFavoriteRepository.save(new UserEventFavoritePreference(userId, eventFavoriteId));
            }
        }

        for (String interestTopicId : normalizeIds(interestTopicIds, 40)) {
            if (!interestTopicRepository.existsByUserIdAndTopicId(userId, interestTopicId)) {
                int displayOrder = interestTopicRepository.findByUserIdOrderByDisplayOrderAsc(userId).size();
                interestTopicRepository.save(new UserInterestTopicPreference(userId, interestTopicId, displayOrder));
            }
        }

        return findByUser(userId);
    }

    private List<String> normalizeTopicIds(List<String> topicIds) {
        return normalizeIds(topicIds, 40);
    }

    private List<String> normalizeIds(List<String> values, int maxLength) {
        if (values == null || values.isEmpty()) {
            return List.of();
        }

        LinkedHashSet<String> uniqueIds = new LinkedHashSet<>();

        for (String value : values) {
            String normalized = normalizeNullableId(value);

            if (normalized != null && normalized.length() <= maxLength) {
                uniqueIds.add(normalized);
            }
        }

        return List.copyOf(uniqueIds);
    }

    private String normalizeRequiredId(String value) {
        String normalized = normalizeNullableId(value);

        if (normalized == null) {
            throw new IllegalArgumentException("저장할 항목을 찾지 못했습니다.");
        }

        return normalized;
    }

    private String normalizeNullableId(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        return normalized.isEmpty() ? null : normalized;
    }
}
