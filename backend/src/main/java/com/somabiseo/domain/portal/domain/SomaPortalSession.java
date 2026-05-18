package com.somabiseo.domain.portal.domain;

import java.net.CookieManager;
import java.net.http.HttpClient;
import java.time.Instant;

public record SomaPortalSession(
        String id,
        String username,
        CookieManager cookieManager,
        HttpClient httpClient,
        Instant expiresAt
) {
    public boolean expired(Instant now) {
        return !expiresAt.isAfter(now);
    }
}
