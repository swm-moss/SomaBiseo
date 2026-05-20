package com.somabiseo.domain.calendar.infrastructure;

import com.fasterxml.jackson.databind.JsonNode;
import com.somabiseo.domain.auth.application.GoogleAuthSessionStore;
import com.somabiseo.domain.calendar.domain.GoogleCalendarClient;
import com.somabiseo.domain.calendar.domain.GoogleCalendarConnectionException;
import com.somabiseo.domain.calendar.domain.GoogleCalendarEventResponse;
import com.somabiseo.domain.calendar.infrastructure.GoogleOAuthTokenStore.GoogleOAuthToken;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
@ConditionalOnProperty(name = "somabiseo.google-calendar.mock-enabled", havingValue = "false", matchIfMissing = true)
public class GoogleCalendarApiClient implements GoogleCalendarClient {
    private static final Logger log = LoggerFactory.getLogger(GoogleCalendarApiClient.class);
    private static final String CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";
    private static final String AUTH_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
    private static final DateTimeFormatter GOOGLE_DATE_TIME_FORMATTER = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
    private static final int GOOGLE_API_CONNECT_TIMEOUT_MILLIS = 3_000;
    private static final int GOOGLE_API_READ_TIMEOUT_MILLIS = 5_000;

    private final GoogleCalendarProperties properties;
    private final GoogleOAuthTokenStore tokenStore;
    private final GoogleAuthSessionStore authSessionStore;
    private final RestClient restClient;

    public GoogleCalendarApiClient(
            GoogleCalendarProperties properties,
            GoogleOAuthTokenStore tokenStore,
            GoogleAuthSessionStore authSessionStore
    ) {
        this.properties = properties;
        this.tokenStore = tokenStore;
        this.authSessionStore = authSessionStore;
        this.restClient = RestClient.builder()
                .requestFactory(requestFactory())
                .build();
    }

    private SimpleClientHttpRequestFactory requestFactory() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(GOOGLE_API_CONNECT_TIMEOUT_MILLIS);
        requestFactory.setReadTimeout(GOOGLE_API_READ_TIMEOUT_MILLIS);

        return requestFactory;
    }

    public String buildAuthorizationUrl(String sessionId) {
        ensureConfigured();
        String state = UUID.randomUUID().toString();

        tokenStore.saveState(sessionId, state);

        return UriComponentsBuilder.fromUriString(AUTH_BASE_URL)
                .queryParam("client_id", properties.clientId())
                .queryParam("redirect_uri", properties.redirectUri())
                .queryParam("response_type", "code")
                .queryParam("scope", CALENDAR_SCOPE + " openid email")
                .queryParam("access_type", "offline")
                .queryParam("prompt", "consent")
                .queryParam("state", state)
                .build()
                .toUriString();
    }

    public void exchangeAuthorizationCode(String sessionId, String code, String state) {
        ensureConfigured();

        if (!tokenStore.consumeState(sessionId, state)) {
            throw new GoogleCalendarConnectionException("Google Calendar OAuth state가 올바르지 않습니다.");
        }

        var form = new LinkedMultiValueMap<String, String>();
        form.add("code", code);
        form.add("client_id", properties.clientId());
        form.add("client_secret", properties.clientSecret());
        form.add("redirect_uri", properties.redirectUri());
        form.add("grant_type", "authorization_code");

        JsonNode tokenResponse = restClient.post()
                .uri(TOKEN_URL)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(JsonNode.class);

        if (tokenResponse == null || !tokenResponse.hasNonNull("access_token")) {
            throw new GoogleCalendarConnectionException("Google Calendar 토큰을 발급받지 못했습니다.");
        }

        String accessToken = tokenResponse.path("access_token").asText();
        String refreshToken = tokenResponse.path("refresh_token").asText(null);
        long expiresIn = tokenResponse.path("expires_in").asLong(3600);
        String email = fetchGoogleAccountEmail(accessToken);

        tokenStore.save(sessionId, new GoogleOAuthToken(
                accessToken,
                refreshToken,
                Instant.now().plusSeconds(expiresIn),
                email
        ));
    }

    public boolean isConnected(String sessionId) {
        return authSessionStore.find(sessionId).isPresent() || tokenStore.find(sessionId).isPresent();
    }

    public String googleAccountEmail(String sessionId) {
        return authSessionStore.find(sessionId)
                .map(GoogleAuthSessionStore.GoogleAuthSession::email)
                .or(() -> tokenStore.find(sessionId).map(GoogleOAuthToken::googleAccountEmail))
                .orElse(null);
    }

    @Override
    public String calendarId() {
        return properties.calendarIdOrDefault();
    }

    @Override
    public void disconnect(String sessionId) {
        tokenStore.clear(sessionId);
    }

    @Override
    public List<GoogleCalendarEventResponse> findEvents(String sessionId, OffsetDateTime from, OffsetDateTime to) {
        String accessToken = validAccessToken(sessionId);
        String calendarId = properties.calendarIdOrDefault();

        JsonNode response;

        try {
            response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("www.googleapis.com")
                            .path("/calendar/v3/calendars/{calendarId}/events")
                            .queryParam("timeMin", googleDateTime(from))
                            .queryParam("timeMax", googleDateTime(to))
                            .queryParam("singleEvents", "true")
                            .queryParam("orderBy", "startTime")
                            .build(calendarId))
                    .headers(headers -> headers.setBearerAuth(accessToken))
                    .retrieve()
                    .body(JsonNode.class);
        } catch (HttpClientErrorException.Unauthorized | HttpClientErrorException.Forbidden exception) {
            throw calendarPermissionException();
        } catch (RestClientException exception) {
            throw calendarApiException(exception);
        }

        return toEvents(response, calendarId);
    }

    @Override
    public Optional<GoogleCalendarEventResponse> findEvent(String sessionId, String googleEventId) {
        String accessToken = validAccessToken(sessionId);
        String calendarId = properties.calendarIdOrDefault();

        try {
            JsonNode response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("www.googleapis.com")
                            .path("/calendar/v3/calendars/{calendarId}/events/{eventId}")
                            .build(calendarId, googleEventId))
                    .headers(headers -> headers.setBearerAuth(accessToken))
                    .retrieve()
                    .body(JsonNode.class);

            return toEvent(response, calendarId);
        } catch (HttpClientErrorException.NotFound exception) {
            return Optional.empty();
        } catch (HttpClientErrorException.Unauthorized | HttpClientErrorException.Forbidden exception) {
            throw calendarPermissionException();
        } catch (RestClientException exception) {
            throw calendarApiException(exception);
        }
    }

    @Override
    public GoogleCalendarEventResponse insertEvent(
            String sessionId,
            String title,
            String description,
            String location,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {
        String accessToken = validAccessToken(sessionId);
        String calendarId = properties.calendarIdOrDefault();
        Map<String, Object> request = new HashMap<>();
        Map<String, String> start = new HashMap<>();
        Map<String, String> end = new HashMap<>();

        start.put("dateTime", googleDateTime(startAt));
        end.put("dateTime", googleDateTime(endAt));
        request.put("summary", title);
        request.put("description", description);
        request.put("location", location);
        request.put("start", start);
        request.put("end", end);

        JsonNode response;

        try {
            response = restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("www.googleapis.com")
                            .path("/calendar/v3/calendars/{calendarId}/events")
                            .build(calendarId))
                    .headers(headers -> headers.setBearerAuth(accessToken))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (HttpClientErrorException.Unauthorized | HttpClientErrorException.Forbidden exception) {
            throw calendarPermissionException();
        } catch (RestClientException exception) {
            throw calendarApiException(exception);
        }

        OffsetDateTime insertedStartAt = response == null ? startAt : readDateTime(response.path("start"));
        OffsetDateTime insertedEndAt = response == null ? endAt : readDateTime(response.path("end"));

        return new GoogleCalendarEventResponse(
                response == null ? "" : response.path("id").asText(),
                response == null ? title : response.path("summary").asText(title),
                insertedStartAt == null ? startAt : insertedStartAt,
                insertedEndAt == null ? endAt : insertedEndAt,
                calendarId,
                response == null ? location : response.path("location").asText(location),
                response == null ? description : response.path("description").asText(description)
        );
    }

    private GoogleCalendarConnectionException calendarPermissionException() {
        return new GoogleCalendarConnectionException(
                "Google Calendar 권한이 없습니다. 로그아웃 후 다시 로그인해 주세요."
        );
    }

    private GoogleCalendarConnectionException calendarApiException(RestClientException exception) {
        if (exception instanceof RestClientResponseException responseException) {
            log.warn(
                    "Google Calendar API request failed. status={}, body={}",
                    responseException.getStatusCode(),
                    responseException.getResponseBodyAsString(),
                    responseException
            );
        } else {
            log.warn("Google Calendar API request failed.", exception);
        }

        return new GoogleCalendarConnectionException(
                "Google Calendar API 호출에 실패했습니다. 잠시 후 다시 시도해 주세요.",
                exception
        );
    }

    private String validAccessToken(String sessionId) {
        Optional<GoogleAuthSessionStore.GoogleAuthSession> authSession = authSessionStore.find(sessionId);

        if (authSession.isPresent()) {
            return validAuthSessionAccessToken(authSession.get());
        }

        GoogleOAuthToken token = tokenStore.find(sessionId)
                .orElseThrow(() -> new GoogleCalendarConnectionException("Google Calendar 연결이 필요합니다."));

        if (!token.isExpired()) {
            return token.accessToken();
        }

        if (token.refreshToken() == null || token.refreshToken().isBlank()) {
            throw new GoogleCalendarConnectionException("Google Calendar 연결이 만료되었습니다. 다시 연결해 주세요.");
        }

        var form = new LinkedMultiValueMap<String, String>();
        form.add("client_id", properties.clientId());
        form.add("client_secret", properties.clientSecret());
        form.add("refresh_token", token.refreshToken());
        form.add("grant_type", "refresh_token");

        JsonNode tokenResponse = restClient.post()
                .uri(TOKEN_URL)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(JsonNode.class);

        if (tokenResponse == null || !tokenResponse.hasNonNull("access_token")) {
            throw new GoogleCalendarConnectionException("Google Calendar 토큰을 갱신하지 못했습니다.");
        }

        GoogleOAuthToken refreshed = token.refreshed(
                tokenResponse.path("access_token").asText(),
                tokenResponse.path("expires_in").asLong(3600)
        );
        tokenStore.save(sessionId, refreshed);

        return refreshed.accessToken();
    }

    private String validAuthSessionAccessToken(GoogleAuthSessionStore.GoogleAuthSession session) {
        if (session.tokenExpiresAt().minusSeconds(60).isAfter(Instant.now())) {
            return session.accessToken();
        }

        if (session.refreshToken() == null || session.refreshToken().isBlank()) {
            throw new GoogleCalendarConnectionException("Google Calendar 연결이 만료되었습니다. 다시 로그인해 주세요.");
        }

        var form = new LinkedMultiValueMap<String, String>();
        form.add("client_id", properties.clientId());
        form.add("client_secret", properties.clientSecret());
        form.add("refresh_token", session.refreshToken());
        form.add("grant_type", "refresh_token");

        JsonNode tokenResponse = restClient.post()
                .uri(TOKEN_URL)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(JsonNode.class);

        if (tokenResponse == null || !tokenResponse.hasNonNull("access_token")) {
            throw new GoogleCalendarConnectionException("Google Calendar 토큰을 갱신하지 못했습니다.");
        }

        String accessToken = tokenResponse.path("access_token").asText();
        authSessionStore.updateToken(
                session.sessionId(),
                accessToken,
                Instant.now().plusSeconds(tokenResponse.path("expires_in").asLong(3600))
        );

        return accessToken;
    }

    private String fetchGoogleAccountEmail(String accessToken) {
        JsonNode response = restClient.get()
                .uri(USERINFO_URL)
                .headers(headers -> headers.setBearerAuth(accessToken))
                .retrieve()
                .body(JsonNode.class);

        if (response == null || !response.hasNonNull("email")) {
            return null;
        }

        return response.path("email").asText();
    }

    private List<GoogleCalendarEventResponse> toEvents(JsonNode response, String calendarId) {
        List<GoogleCalendarEventResponse> events = new ArrayList<>();

        if (response == null || !response.has("items")) {
            return events;
        }

        for (JsonNode item : response.path("items")) {
            OffsetDateTime startAt = readDateTime(item.path("start"));
            OffsetDateTime endAt = readDateTime(item.path("end"));

            if (startAt == null || endAt == null) {
                continue;
            }

            events.add(new GoogleCalendarEventResponse(
                    item.path("id").asText(),
                    item.path("summary").asText("제목 없음"),
                    startAt,
                    endAt,
                    calendarId,
                    item.path("location").asText(null),
                    item.path("description").asText(null)
            ));
        }

        return events;
    }

    private Optional<GoogleCalendarEventResponse> toEvent(JsonNode item, String calendarId) {
        if (item == null) {
            return Optional.empty();
        }

        OffsetDateTime startAt = readDateTime(item.path("start"));
        OffsetDateTime endAt = readDateTime(item.path("end"));

        if (startAt == null || endAt == null) {
            return Optional.empty();
        }

        return Optional.of(new GoogleCalendarEventResponse(
                item.path("id").asText(),
                item.path("summary").asText("제목 없음"),
                startAt,
                endAt,
                calendarId,
                item.path("location").asText(null),
                item.path("description").asText(null)
        ));
    }

    private OffsetDateTime readDateTime(JsonNode node) {
        if (node.hasNonNull("dateTime")) {
            return OffsetDateTime.parse(node.path("dateTime").asText());
        }

        if (node.hasNonNull("date")) {
            return OffsetDateTime.parse(node.path("date").asText() + "T00:00:00+09:00");
        }

        return null;
    }

    private String googleDateTime(OffsetDateTime dateTime) {
        return GOOGLE_DATE_TIME_FORMATTER.format(dateTime);
    }

    private void ensureConfigured() {
        if (!properties.isConfigured()) {
            throw new GoogleCalendarConnectionException(
                    "Google Calendar OAuth 환경변수가 설정되지 않았습니다."
            );
        }
    }
}
