package com.somabiseo.domain.auth.infrastructure;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.net.URI;

@ConfigurationProperties(prefix = "somabiseo.google-oauth")
public record GoogleOAuthProperties(
        String clientId,
        String clientSecret,
        String redirectUri,
        String frontendLoginRedirectUri,
        String frontendCalendarRedirectUri,
        long sessionTtlMinutes
) {
    public boolean isConfigured() {
        return !isBlank(clientId) && !isBlank(clientSecret) && !isBlank(redirectUri);
    }

    public String frontendLoginRedirectUriOrDefault() {
        if (!isBlank(frontendLoginRedirectUri)) {
            return frontendLoginRedirectUri;
        }

        if (!isBlank(frontendCalendarRedirectUri)) {
            return originOf(frontendCalendarRedirectUri) + "/login/google/callback";
        }

        return "http://localhost:3000/login/google/callback";
    }

    public String frontendCalendarRedirectUriOrDefault() {
        return isBlank(frontendCalendarRedirectUri)
                ? "http://localhost:3000/settings"
                : frontendCalendarRedirectUri;
    }

    public long sessionTtlMinutesOrDefault() {
        return sessionTtlMinutes <= 0 ? 60L * 24L * 30L : sessionTtlMinutes;
    }

    public boolean isAllowedReturnTo(String returnTo) {
        if (isBlank(returnTo)) {
            return false;
        }

        String origin = safeOriginOf(returnTo);

        return origin.equals(originOf(frontendLoginRedirectUriOrDefault()))
                || origin.equals(originOf(frontendCalendarRedirectUriOrDefault()))
                || origin.equals("http://localhost:3000")
                || origin.equals("http://localhost:3001");
    }

    private String originOf(String value) {
        URI uri = URI.create(value);
        int port = uri.getPort();
        String portPart = port < 0 ? "" : ":" + port;

        return uri.getScheme() + "://" + uri.getHost() + portPart;
    }

    private String safeOriginOf(String value) {
        try {
            URI uri = URI.create(value);

            if (isBlank(uri.getScheme()) || isBlank(uri.getHost())) {
                return "";
            }

            int port = uri.getPort();
            String portPart = port < 0 ? "" : ":" + port;

            return uri.getScheme() + "://" + uri.getHost() + portPart;
        } catch (IllegalArgumentException exception) {
            return "";
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
