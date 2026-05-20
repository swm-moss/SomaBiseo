package com.somabiseo.domain.auth.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.somabiseo.domain.auth.domain.GoogleAuthException;
import com.somabiseo.domain.auth.domain.GoogleAuthSessionResponse;
import com.somabiseo.domain.auth.domain.GoogleAuthUnauthorizedException;
import com.somabiseo.domain.auth.infrastructure.GoogleOAuthProperties;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class GoogleAuthService {
    private static final String AUTH_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
    private static final String LOGIN_SCOPES = String.join(
            " ",
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.events"
    );
    private static final String CALENDAR_SCOPES = String.join(
            " ",
            LOGIN_SCOPES
    );
    private static final String GOOGLE_AUTH_PROMPT = "consent select_account";

    private final GoogleOAuthProperties properties;
    private final GoogleAuthSessionStore sessionStore;
    private final RestClient restClient;
    private final ConcurrentMap<String, PendingGoogleAuthState> pendingStates = new ConcurrentHashMap<>();

    public GoogleAuthService(GoogleOAuthProperties properties, GoogleAuthSessionStore sessionStore) {
        this.properties = properties;
        this.sessionStore = sessionStore;
        this.restClient = RestClient.create();
    }

    public String buildLoginUrl(String returnTo) {
        return buildAuthorizationUrl(GoogleAuthFlow.LOGIN, returnTo);
    }

    public String buildCalendarConnectUrl(String returnTo) {
        return buildAuthorizationUrl(GoogleAuthFlow.CALENDAR, returnTo);
    }

    public String handleCallback(String code, String state, String error) {
        Optional<PendingGoogleAuthState> consumedState = consumeState(state);

        if (consumedState.isEmpty()) {
            return redirectWithError(
                    properties.frontendLoginRedirectUriOrDefault(),
                    "Google 로그인 상태가 만료되었습니다. 다시 시도해 주세요."
            );
        }

        PendingGoogleAuthState pendingState = consumedState.get();

        if (error != null && !error.isBlank()) {
            return redirectWithError(pendingState.returnTo(), "Google 로그인이 취소되었습니다.");
        }

        if (code == null || code.isBlank()) {
            return redirectWithError(pendingState.returnTo(), "Google 로그인 코드가 없습니다.");
        }

        GoogleToken token = exchangeAuthorizationCode(code);
        GoogleUserInfo userInfo = fetchUserInfo(token.accessToken());
        Instant sessionExpiresAt = Instant.now().plusSeconds(properties.sessionTtlMinutesOrDefault() * 60);
        GoogleAuthSessionResponse session = sessionStore.save(
                userInfo.subject(),
                userInfo.email(),
                userInfo.name(),
                userInfo.profileImageUrl(),
                token.accessToken(),
                token.refreshToken(),
                Instant.now().plusSeconds(token.expiresInSeconds()),
                sessionExpiresAt
        );

        return redirectWithSession(pendingState.returnTo(), session, pendingState.flow() == GoogleAuthFlow.CALENDAR);
    }

    public GoogleAuthSessionResponse getCurrentSession(String authorization) {
        return sessionStore.find(bearerSessionId(authorization))
                .map(GoogleAuthSessionStore.GoogleAuthSession::toResponse)
                .orElseThrow(() -> new GoogleAuthUnauthorizedException("로그인이 필요합니다."));
    }

    public void logout(String authorization) {
        sessionStore.remove(bearerSessionId(authorization));
    }

    private String buildAuthorizationUrl(GoogleAuthFlow flow, String returnTo) {
        ensureConfigured();

        String resolvedReturnTo = resolveReturnTo(flow, returnTo);
        String state = UUID.randomUUID().toString();
        pendingStates.put(
                state,
                new PendingGoogleAuthState(flow, resolvedReturnTo, Instant.now().plusSeconds(60 * 10))
        );

        return UriComponentsBuilder.fromUriString(AUTH_BASE_URL)
                .queryParam("client_id", properties.clientId())
                .queryParam("redirect_uri", properties.redirectUri())
                .queryParam("response_type", "code")
                .queryParam("scope", flow == GoogleAuthFlow.CALENDAR ? CALENDAR_SCOPES : LOGIN_SCOPES)
                .queryParam("access_type", "offline")
                .queryParam("include_granted_scopes", "true")
                .queryParam("prompt", GOOGLE_AUTH_PROMPT)
                .queryParam("state", state)
                .build()
                .toUriString();
    }

    private Optional<PendingGoogleAuthState> consumeState(String state) {
        if (state == null || state.isBlank()) {
            return Optional.empty();
        }

        PendingGoogleAuthState pendingState = pendingStates.remove(state);

        if (pendingState == null || pendingState.expiresAt().isBefore(Instant.now())) {
            return Optional.empty();
        }

        return Optional.of(pendingState);
    }

    private GoogleToken exchangeAuthorizationCode(String code) {
        ensureConfigured();

        var form = new LinkedMultiValueMap<String, String>();
        form.add("code", code);
        form.add("client_id", properties.clientId());
        form.add("client_secret", properties.clientSecret());
        form.add("redirect_uri", properties.redirectUri());
        form.add("grant_type", "authorization_code");

        JsonNode response = restClient.post()
                .uri(TOKEN_URL)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(JsonNode.class);

        if (response == null || !response.hasNonNull("access_token")) {
            throw new GoogleAuthException("Google OAuth 토큰을 발급받지 못했습니다.");
        }

        return new GoogleToken(
                response.path("access_token").asText(),
                response.path("refresh_token").asText(null),
                response.path("expires_in").asLong(3600)
        );
    }

    private GoogleUserInfo fetchUserInfo(String accessToken) {
        JsonNode response = restClient.get()
                .uri(USERINFO_URL)
                .headers(headers -> headers.setBearerAuth(accessToken))
                .retrieve()
                .body(JsonNode.class);

        if (response == null || !response.hasNonNull("email")) {
            throw new GoogleAuthException("Google 계정 정보를 가져오지 못했습니다.");
        }

        String email = response.path("email").asText();
        String name = response.path("name").asText(email);

        return new GoogleUserInfo(
                response.path("sub").asText(email),
                email,
                name,
                response.path("picture").asText(null)
        );
    }

    private String redirectWithSession(String returnTo, GoogleAuthSessionResponse session, boolean calendarConnected) {
        String fragment = toFragment(
                "sessionId", session.sessionId(),
                "username", session.username(),
                "email", session.email(),
                "profileImageUrl", session.profileImageUrl(),
                "expiresAt", session.expiresAt().toString(),
                "calendarConnected", "true"
        );

        return appendFragment(returnTo, fragment);
    }

    private String redirectWithError(String returnTo, String message) {
        return appendFragment(returnTo, toFragment("error", message));
    }

    private String appendFragment(String returnTo, String fragment) {
        return returnTo + (returnTo.contains("#") ? "&" : "#") + fragment;
    }

    private String toFragment(String... keyValues) {
        StringBuilder builder = new StringBuilder();

        for (int index = 0; index < keyValues.length; index += 2) {
            if (builder.length() > 0) {
                builder.append('&');
            }

            builder
                    .append(encode(keyValues[index]))
                    .append('=')
                    .append(encode(keyValues[index + 1]));
        }

        return builder.toString();
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private String resolveReturnTo(GoogleAuthFlow flow, String returnTo) {
        if (properties.isAllowedReturnTo(returnTo)) {
            return returnTo;
        }

        return flow == GoogleAuthFlow.CALENDAR
                ? properties.frontendCalendarRedirectUriOrDefault()
                : properties.frontendLoginRedirectUriOrDefault();
    }

    private void ensureConfigured() {
        if (!properties.isConfigured()) {
            throw new GoogleAuthException("Google OAuth 환경변수가 설정되지 않았습니다.");
        }
    }

    private String bearerSessionId(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new GoogleAuthUnauthorizedException("로그인이 필요합니다.");
        }

        String sessionId = authorization.substring("Bearer ".length()).trim();

        if (sessionId.isBlank()) {
            throw new GoogleAuthUnauthorizedException("로그인이 필요합니다.");
        }

        return sessionId;
    }

    private enum GoogleAuthFlow {
        LOGIN,
        CALENDAR
    }

    private record PendingGoogleAuthState(
            GoogleAuthFlow flow,
            String returnTo,
            Instant expiresAt
    ) {
    }

    private record GoogleToken(
            String accessToken,
            String refreshToken,
            long expiresInSeconds
    ) {
    }

    private record GoogleUserInfo(
            String subject,
            String email,
            String name,
            String profileImageUrl
    ) {
    }
}
