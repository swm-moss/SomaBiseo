package com.somabiseo.domain.portal.application;

import com.somabiseo.domain.portal.domain.SomaPortalSession;
import com.somabiseo.domain.portal.domain.SomaPortalUnauthorizedException;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SomaPortalSessionStore {
    private final Map<String, SomaPortalSession> sessions = new ConcurrentHashMap<>();

    public void put(SomaPortalSession session) {
        sessions.put(session.id(), session);
    }

    public SomaPortalSession get(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            throw new SomaPortalUnauthorizedException("SOMA 포털 sessionId가 필요합니다.");
        }

        SomaPortalSession session = sessions.get(sessionId);

        if (session == null || session.expired(Instant.now())) {
            if (session != null) {
                sessions.remove(sessionId);
            }

            throw new SomaPortalUnauthorizedException("SOMA 포털 세션이 없거나 만료됐습니다. 다시 로그인해 주세요.");
        }

        return session;
    }

    public void remove(String sessionId) {
        if (sessionId != null) {
            sessions.remove(sessionId);
        }
    }
}
