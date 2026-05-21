package com.somabiseo.domain.portal.application;

import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.portal.domain.SomaPortalEventSort;
import com.somabiseo.domain.portal.domain.SomaPortalException;
import com.somabiseo.domain.portal.domain.SomaPortalLoginResponse;
import com.somabiseo.domain.portal.domain.SomaPortalMentoLecApplicationDetail;
import com.somabiseo.domain.portal.domain.SomaPortalMentoLecApplicationResponse;
import com.somabiseo.domain.portal.domain.SomaPortalNoticeResponse;
import com.somabiseo.domain.portal.domain.SomaPortalPageResponse;
import com.somabiseo.domain.portal.domain.SomaPortalSession;
import com.somabiseo.domain.portal.domain.SomaPortalUnauthorizedException;
import com.somabiseo.domain.portal.infrastructure.SomaPortalClient;
import com.somabiseo.domain.portal.infrastructure.SomaPortalHtmlParser;
import com.somabiseo.domain.portal.infrastructure.SomaPortalProperties;
import com.somabiseo.domain.somaevent.domain.EventMode;
import com.somabiseo.domain.somaevent.domain.EventType;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;

@Service
public class SomaPortalService {
    private static final String OPERATOR_SESSION_ID = "operator-readonly";
    private static final int PAGE_SIZE = 10;
    private static final int ALMOST_FULL_LIMIT = 3;

    private final SomaPortalClient portalClient;
    private final SomaPortalHtmlParser htmlParser;
    private final SomaPortalSessionStore sessionStore;
    private final SomaPortalProperties properties;
    private final SomaPortalCacheService cacheService;
    private final Object operatorSessionLock = new Object();
    private final Object noticeSyncLock = new Object();
    private final Object eventSyncLock = new Object();
    private volatile SomaPortalSession operatorSession;

    public SomaPortalService(
            SomaPortalClient portalClient,
            SomaPortalHtmlParser htmlParser,
            SomaPortalSessionStore sessionStore,
            SomaPortalProperties properties,
            SomaPortalCacheService cacheService
    ) {
        this.portalClient = portalClient;
        this.htmlParser = htmlParser;
        this.sessionStore = sessionStore;
        this.properties = properties;
        this.cacheService = cacheService;
    }

    public SomaPortalLoginResponse login(String username, String password) {
        SomaPortalClient.LoginResult loginResult = portalClient.login(username, password);
        Instant expiresAt = Instant.now().plus(properties.sessionTtlMinutes(), ChronoUnit.MINUTES);
        String sessionId = UUID.randomUUID().toString();

        sessionStore.put(new SomaPortalSession(
                sessionId,
                username,
                loginResult.cookieManager(),
                loginResult.httpClient(),
                expiresAt
        ));

        return new SomaPortalLoginResponse(sessionId, username, expiresAt);
    }

    public void logout(String sessionId) {
        sessionStore.remove(sessionId);
    }

    public SomaPortalPageResponse<SomaPortalNoticeResponse> getPublicNotices(int page) {
        syncNoticesIfNeeded();

        return cacheService.getNotices(page, PAGE_SIZE);
    }

    public SomaPortalPageResponse<SomaPortalNoticeResponse> getNotices(String sessionId, int page) {
        SomaPortalSession session = sessionStore.get(sessionId);
        SomaPortalPageResponse<SomaPortalNoticeResponse> response = fetchNotices(session, page);

        cacheService.upsertNotices(response.items());

        return response;
    }

    private SomaPortalPageResponse<SomaPortalNoticeResponse> fetchNotices(SomaPortalSession session, int page) {
        int safePage = Math.max(page, 1);
        String html = portalClient.getNoticesHtml(session, safePage);
        List<SomaPortalNoticeResponse> notices = htmlParser.parseNotices(html, portalClient.baseUrl());

        return toPageResponse(notices, html, safePage);
    }

    public SomaPortalPageResponse<SomaPortalEventResponse> getPublicEvents(
            int page,
            SomaPortalEventSort sort,
            EventType type,
            EventMode mode,
            String q,
            String date
    ) {
        syncEventsIfNeeded();

        return cacheService.getEvents(page, PAGE_SIZE, sort, type, mode, q, date);
    }

    public List<SomaPortalEventResponse> getAlmostFullEvents() {
        syncEventsIfNeeded();

        return cacheService.findAlmostFullEvents(ALMOST_FULL_LIMIT);
    }

    public SomaPortalPageResponse<SomaPortalEventResponse> getEvents(
            String sessionId,
            int page,
            SomaPortalEventSort sort,
            EventType type,
            EventMode mode,
            String q,
            String date
    ) {
        SomaPortalSession session = sessionStore.get(sessionId);
        SomaPortalPageResponse<SomaPortalEventResponse> response = fetchEvents(session, page);

        cacheService.upsertEvents(response.items());

        return cacheService.getEvents(page, PAGE_SIZE, sort, type, mode, q, date);
    }

    public SomaPortalEventResponse getPublicEventDetailBySourceId(String sourceId) {
        syncEventsIfNeeded();

        return cacheService.findEventDetailBySourceId(sourceId)
                .orElseGet(() -> {
                    String sourceUrl = cacheService.findEventBySourceId(sourceId)
                            .map(SomaPortalEventResponse::sourceUrl)
                            .orElseGet(() -> sourceUrlFromSourceId(sourceId));
                    SomaPortalEventResponse detail = withOperatorSession((session) -> fetchEventDetail(session, sourceUrl));

                    cacheService.upsertEvent(detail);

                    return detail;
                });
    }

    private SomaPortalPageResponse<SomaPortalEventResponse> fetchEvents(SomaPortalSession session, int page) {
        int safePage = Math.max(page, 1);
        String html = portalClient.getEventsHtml(session, safePage);
        List<SomaPortalEventResponse> events = htmlParser.parseEvents(html, portalClient.baseUrl());

        return toPageResponse(events, html, safePage);
    }

    public SomaPortalEventResponse getPublicEventDetail(String sourceUrl) {
        return cacheService.findEventDetail(sourceUrl)
                .orElseGet(() -> {
                    SomaPortalEventResponse detail = withOperatorSession((session) -> fetchEventDetail(session, sourceUrl));

                    cacheService.upsertEvent(detail);

                    return detail;
                });
    }

    public SomaPortalEventResponse getEventDetail(String sessionId, String sourceUrl) {
        SomaPortalSession session = sessionStore.get(sessionId);
        SomaPortalEventResponse detail = fetchEventDetail(session, sourceUrl);

        cacheService.upsertEvent(detail);

        return detail;
    }

    private SomaPortalEventResponse fetchEventDetail(SomaPortalSession session, String sourceUrl) {
        String html = portalClient.getEventDetailHtml(session, sourceUrl);

        return htmlParser.parseEventDetail(html, portalClient.baseUrl(), sourceUrl);
    }

    public SomaPortalMentoLecApplicationResponse applyMentoLec(String sessionId, String qustnrSn) {
        SomaPortalSession session = sessionStore.get(sessionId);
        SomaPortalMentoLecApplicationDetail detail = getMentoLecApplicationDetail(session, qustnrSn);

        if (detail.applied()) {
            return new SomaPortalMentoLecApplicationResponse(detail.qustnrSn(), true, "이미 신청된 상태입니다.");
        }

        SomaPortalClient.PortalCommandResult result = portalClient.applyMentoLec(session, detail);

        return new SomaPortalMentoLecApplicationResponse(detail.qustnrSn(), true, result.message());
    }

    public SomaPortalMentoLecApplicationResponse cancelMentoLec(String sessionId, String qustnrSn) {
        SomaPortalSession session = sessionStore.get(sessionId);
        SomaPortalMentoLecApplicationDetail detail = getMentoLecApplicationDetail(session, qustnrSn);

        if (!detail.applied()) {
            return new SomaPortalMentoLecApplicationResponse(detail.qustnrSn(), false, "신청 내역이 없습니다.");
        }

        SomaPortalClient.PortalCommandResult result = portalClient.cancelMentoLec(session, detail);

        return new SomaPortalMentoLecApplicationResponse(detail.qustnrSn(), false, result.message());
    }

    private SomaPortalMentoLecApplicationDetail getMentoLecApplicationDetail(SomaPortalSession session, String qustnrSn) {
        String normalizedQustnrSn = normalizeQustnrSn(qustnrSn);
        String html = portalClient.getEventDetailHtml(session, portalClient.mentoLecViewPath(normalizedQustnrSn));

        return htmlParser.parseMentoLecApplicationDetail(html, normalizedQustnrSn);
    }

    private String normalizeQustnrSn(String qustnrSn) {
        if (qustnrSn != null && qustnrSn.startsWith("qustnrSn-")) {
            return qustnrSn.substring("qustnrSn-".length());
        }

        return qustnrSn;
    }

    private String sourceUrlFromSourceId(String sourceId) {
        if (sourceId != null && sourceId.startsWith("qustnrSn-")) {
            return portalClient.mentoLecViewPath(sourceId.substring("qustnrSn-".length()));
        }

        throw new SomaPortalException("캐시에서 멘토링 상세 주소를 찾지 못했습니다.");
    }

    private void syncNoticesIfNeeded() {
        if (cacheService.noticesFresh(cacheTtl())) {
            return;
        }

        synchronized (noticeSyncLock) {
            if (cacheService.noticesFresh(cacheTtl())) {
                return;
            }

            syncNotices();
        }
    }

    private void syncNotices() {
        withOperatorSession((session) -> {
            SomaPortalPageResponse<SomaPortalNoticeResponse> firstPage = fetchNotices(session, 1);
            cacheService.upsertNotices(firstPage.items());

            int totalPages = limitedTotalPages(firstPage.totalPages());

            for (int page = 2; page <= totalPages; page += 1) {
                cacheService.upsertNotices(fetchNotices(session, page).items());
            }

            cacheService.markNoticeSyncSuccess(totalPages);

            return null;
        });
    }

    private void syncEventsIfNeeded() {
        if (cacheService.eventsFresh(cacheTtl())) {
            return;
        }

        synchronized (eventSyncLock) {
            if (cacheService.eventsFresh(cacheTtl())) {
                return;
            }

            syncEvents();
        }
    }

    private void syncEvents() {
        withOperatorSession((session) -> {
            SomaPortalPageResponse<SomaPortalEventResponse> firstPage = fetchEvents(session, 1);
            cacheService.upsertEvents(firstPage.items());

            int totalPages = limitedTotalPages(firstPage.totalPages());

            for (int page = 2; page <= totalPages; page += 1) {
                cacheService.upsertEvents(fetchEvents(session, page).items());
            }

            cacheService.markEventSyncSuccess(totalPages);

            return null;
        });
    }

    private Duration cacheTtl() {
        return Duration.ofMinutes(Math.max(properties.cacheTtlMinutes(), 1));
    }

    private int limitedTotalPages(int totalPages) {
        int syncPageLimit = properties.syncPageLimit() <= 0 ? 1 : properties.syncPageLimit();

        return Math.max(1, Math.min(totalPages, syncPageLimit));
    }

    private <T> T withOperatorSession(Function<SomaPortalSession, T> action) {
        try {
            return action.apply(operatorSession());
        } catch (SomaPortalUnauthorizedException exception) {
            clearOperatorSession();

            return action.apply(operatorSession());
        }
    }

    private SomaPortalSession operatorSession() {
        SomaPortalSession cachedSession = operatorSession;

        if (isFreshSession(cachedSession)) {
            return cachedSession;
        }

        synchronized (operatorSessionLock) {
            cachedSession = operatorSession;

            if (isFreshSession(cachedSession)) {
                return cachedSession;
            }

            SomaPortalClient.LoginResult loginResult = portalClient.login(
                    requiredOperatorUsername(),
                    requiredOperatorPassword()
            );
            Instant expiresAt = Instant.now().plus(properties.sessionTtlMinutes(), ChronoUnit.MINUTES);
            SomaPortalSession session = new SomaPortalSession(
                    OPERATOR_SESSION_ID,
                    properties.operatorUsername(),
                    loginResult.cookieManager(),
                    loginResult.httpClient(),
                    expiresAt
            );

            operatorSession = session;

            return session;
        }
    }

    private boolean isFreshSession(SomaPortalSession session) {
        return session != null && session.expiresAt().isAfter(Instant.now().plus(1, ChronoUnit.MINUTES));
    }

    private void clearOperatorSession() {
        synchronized (operatorSessionLock) {
            operatorSession = null;
        }
    }

    private String requiredOperatorUsername() {
        if (properties.operatorUsername() == null || properties.operatorUsername().isBlank()) {
            throw new SomaPortalException("SOMA_PORTAL_OPERATOR_USERNAME 환경변수가 필요합니다.");
        }

        return properties.operatorUsername();
    }

    private String requiredOperatorPassword() {
        if (properties.operatorPassword() == null || properties.operatorPassword().isBlank()) {
            throw new SomaPortalException("SOMA_PORTAL_OPERATOR_PASSWORD 환경변수가 필요합니다.");
        }

        return properties.operatorPassword();
    }

    private <T> SomaPortalPageResponse<T> toPageResponse(List<T> items, String html, int page) {
        int totalPages = htmlParser.parseTotalPages(html, page);

        return new SomaPortalPageResponse<>(
                items,
                page,
                Math.max(totalPages, 1),
                totalPages > page
        );
    }
}
