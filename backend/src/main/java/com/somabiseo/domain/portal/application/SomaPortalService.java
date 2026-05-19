package com.somabiseo.domain.portal.application;

import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.portal.domain.SomaPortalLoginResponse;
import com.somabiseo.domain.portal.domain.SomaPortalMentoLecApplicationDetail;
import com.somabiseo.domain.portal.domain.SomaPortalMentoLecApplicationResponse;
import com.somabiseo.domain.portal.domain.SomaPortalNoticeResponse;
import com.somabiseo.domain.portal.domain.SomaPortalPageResponse;
import com.somabiseo.domain.portal.domain.SomaPortalSession;
import com.somabiseo.domain.portal.infrastructure.SomaPortalClient;
import com.somabiseo.domain.portal.infrastructure.SomaPortalHtmlParser;
import com.somabiseo.domain.portal.infrastructure.SomaPortalProperties;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class SomaPortalService {
    private final SomaPortalClient portalClient;
    private final SomaPortalHtmlParser htmlParser;
    private final SomaPortalSessionStore sessionStore;
    private final SomaPortalProperties properties;

    public SomaPortalService(
            SomaPortalClient portalClient,
            SomaPortalHtmlParser htmlParser,
            SomaPortalSessionStore sessionStore,
            SomaPortalProperties properties
    ) {
        this.portalClient = portalClient;
        this.htmlParser = htmlParser;
        this.sessionStore = sessionStore;
        this.properties = properties;
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

    public SomaPortalPageResponse<SomaPortalNoticeResponse> getNotices(String sessionId, int page) {
        SomaPortalSession session = sessionStore.get(sessionId);
        int safePage = Math.max(page, 1);
        String html = portalClient.getNoticesHtml(session, safePage);
        List<SomaPortalNoticeResponse> notices = htmlParser.parseNotices(html, portalClient.baseUrl());

        return toPageResponse(notices, html, safePage);
    }

    public SomaPortalPageResponse<SomaPortalEventResponse> getEvents(String sessionId, int page) {
        SomaPortalSession session = sessionStore.get(sessionId);
        int safePage = Math.max(page, 1);
        String html = portalClient.getEventsHtml(session, safePage);
        List<SomaPortalEventResponse> events = htmlParser.parseEvents(html, portalClient.baseUrl());

        return toPageResponse(events, html, safePage);
    }

    public SomaPortalEventResponse getEventDetail(String sessionId, String sourceUrl) {
        SomaPortalSession session = sessionStore.get(sessionId);
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
