package com.somabiseo.domain.portal.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.portal.domain.SomaPortalEventSort;
import com.somabiseo.domain.portal.domain.SomaPortalNoticeResponse;
import com.somabiseo.domain.portal.domain.SomaPortalPageResponse;
import com.somabiseo.domain.portal.infrastructure.CachedPortalEvent;
import com.somabiseo.domain.portal.infrastructure.CachedPortalEventRepository;
import com.somabiseo.domain.portal.infrastructure.CachedPortalNotice;
import com.somabiseo.domain.portal.infrastructure.CachedPortalNoticeRepository;
import com.somabiseo.domain.portal.infrastructure.CachedPortalSyncLog;
import com.somabiseo.domain.portal.infrastructure.CachedPortalSyncLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class SomaPortalCacheService {
    private static final String NOTICE_SOURCE_TYPE = "SOMA_NOTICE";
    private static final String EVENT_SOURCE_TYPE = "SOMA_EVENT";

    private final CachedPortalNoticeRepository noticeRepository;
    private final CachedPortalEventRepository eventRepository;
    private final CachedPortalSyncLogRepository syncLogRepository;
    private final ObjectMapper objectMapper;

    public SomaPortalCacheService(
            CachedPortalNoticeRepository noticeRepository,
            CachedPortalEventRepository eventRepository,
            CachedPortalSyncLogRepository syncLogRepository,
            ObjectMapper objectMapper
    ) {
        this.noticeRepository = noticeRepository;
        this.eventRepository = eventRepository;
        this.syncLogRepository = syncLogRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public boolean noticesFresh(Duration ttl) {
        return noticeRepository.count() > 0
                && syncLogRepository.findLatestSuccessFinishedAt(NOTICE_SOURCE_TYPE)
                .map((updatedAt) -> updatedAt.isAfter(Instant.now().minus(ttl)))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean eventsFresh(Duration ttl) {
        return eventRepository.count() > 0
                && syncLogRepository.findLatestSuccessFinishedAt(EVENT_SOURCE_TYPE)
                .map((updatedAt) -> updatedAt.isAfter(Instant.now().minus(ttl)))
                .orElse(false);
    }

    @Transactional
    public void upsertNotices(List<SomaPortalNoticeResponse> notices) {
        notices.forEach((notice) -> {
            CachedPortalNotice entity = noticeRepository.findBySourceId(notice.sourceId())
                    .orElseGet(() -> new CachedPortalNotice(notice));

            entity.update(notice);
            noticeRepository.save(entity);
        });
    }

    @Transactional
    public void upsertEvents(List<SomaPortalEventResponse> events) {
        events.forEach(this::upsertEvent);
    }

    @Transactional
    public void upsertEvent(SomaPortalEventResponse event) {
        CachedPortalEvent entity = eventRepository.findBySourceId(event.sourceId())
                .or(() -> eventRepository.findBySourceUrl(event.sourceUrl()))
                .orElseGet(() -> new CachedPortalEvent(event, objectMapper));

        entity.update(event, objectMapper);
        eventRepository.save(entity);
    }

    @Transactional
    public void markNoticeSyncSuccess(int totalPages) {
        syncLogRepository.save(CachedPortalSyncLog.success(
                NOTICE_SOURCE_TYPE,
                "공지 " + totalPages + "페이지 동기화 완료"
        ));
    }

    @Transactional
    public void markEventSyncSuccess(int totalPages) {
        syncLogRepository.save(CachedPortalSyncLog.success(
                EVENT_SOURCE_TYPE,
                "멘토링 " + totalPages + "페이지 동기화 완료"
        ));
    }

    @Transactional(readOnly = true)
    public SomaPortalPageResponse<SomaPortalNoticeResponse> getNotices(int page, int size) {
        int safePage = Math.max(page, 1);
        Page<CachedPortalNotice> noticePage = noticeRepository.findAll(
                PageRequest.of(
                        safePage - 1,
                        size,
                        Sort.by(Sort.Direction.DESC, "publishedAt").and(Sort.by(Sort.Direction.DESC, "id"))
                )
        );

        return new SomaPortalPageResponse<>(
                noticePage.map(CachedPortalNotice::toResponse).toList(),
                safePage,
                Math.max(noticePage.getTotalPages(), 1),
                noticePage.hasNext()
        );
    }

    @Transactional(readOnly = true)
    public SomaPortalPageResponse<SomaPortalEventResponse> getEvents(int page, int size, SomaPortalEventSort sort) {
        int safePage = Math.max(page, 1);
        PageRequest pageRequest = PageRequest.of(safePage - 1, size);
        Page<CachedPortalEvent> eventPage = switch (sort == null ? SomaPortalEventSort.LECTURE_DATE_DESC : sort) {
            case LECTURE_DATE_DESC -> eventRepository.findPageOrderByStartAtDesc(pageRequest);
            case LECTURE_DATE_ASC -> eventRepository.findPageOrderByStartAtAsc(pageRequest);
            case REGISTERED_AT_DESC -> eventRepository.findPageOrderByRegisteredAtDesc(pageRequest);
            case APPLICATION_DEADLINE_ASC -> eventRepository.findPageOrderByApplicationEndAtAsc(pageRequest);
        };

        return new SomaPortalPageResponse<>(
                eventPage.map((event) -> event.toResponse(objectMapper)).toList(),
                safePage,
                Math.max(eventPage.getTotalPages(), 1),
                eventPage.hasNext()
        );
    }

    @Transactional(readOnly = true)
    public Optional<SomaPortalEventResponse> findEventDetail(String sourceUrl) {
        return eventRepository.findBySourceUrl(sourceUrl)
                .filter(CachedPortalEvent::hasDetail)
                .map((event) -> event.toResponse(objectMapper));
    }

    @Transactional(readOnly = true)
    public Optional<SomaPortalEventResponse> findEventBySourceId(String sourceId) {
        return eventRepository.findBySourceId(sourceId)
                .map((event) -> event.toResponse(objectMapper));
    }

    @Transactional(readOnly = true)
    public Optional<SomaPortalEventResponse> findEventDetailBySourceId(String sourceId) {
        return eventRepository.findBySourceId(sourceId)
                .filter(CachedPortalEvent::hasDetail)
                .map((event) -> event.toResponse(objectMapper));
    }
}
