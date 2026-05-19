package com.somabiseo.domain.portal.application;

import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.portal.domain.SomaPortalLoginResponse;
import com.somabiseo.domain.portal.domain.SomaPortalNoticeResponse;
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

    public List<SomaPortalNoticeResponse> getNotices(String sessionId, int page) {
        SomaPortalSession session = sessionStore.get(sessionId);
        String html = portalClient.getNoticesHtml(session, page);

        return htmlParser.parseNotices(html, portalClient.baseUrl());
    }

    public List<SomaPortalEventResponse> getEvents(String sessionId, int page) {
        SomaPortalSession session = sessionStore.get(sessionId);
        String html = portalClient.getEventsHtml(session, page);

        return htmlParser.parseEvents(html, portalClient.baseUrl());
    }

    public SomaPortalEventResponse getEventDetail(String sessionId, String sourceUrl) {
        SomaPortalSession session = sessionStore.get(sessionId);
        String html = portalClient.getEventDetailHtml(session, sourceUrl);

        return htmlParser.parseEventDetail(html, portalClient.baseUrl(), sourceUrl);
    }
}
