package com.somabiseo.domain.calendar.infrastructure;

import com.fasterxml.jackson.databind.JsonNode;
import com.somabiseo.domain.calendar.domain.GoogleCalendarClient;
import com.somabiseo.domain.calendar.domain.GoogleCalendarConnectionException;
import com.somabiseo.domain.calendar.domain.GoogleCalendarEventResponse;
import com.somabiseo.domain.calendar.infrastructure.GoogleOAuthTokenStore.GoogleOAuthToken;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@ConditionalOnProperty(name = "somabiseo.google-calendar.mock-enabled", havingValue = "false", matchIfMissing = true)
public class GoogleCalendarApiClient implements GoogleCalendarClient {
    private static final String CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";
    private static final String AUTH_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

    private final GoogleCalendarProperties properties;
    private final GoogleOAuthTokenStore tokenStore;
    private final RestClient restClient;

    public GoogleCalendarApiClient(GoogleCalendarProperties properties, GoogleOAuthTokenStore tokenStore) {
        this.properties = properties;
        this.tokenStore = tokenStore;
        this.restClient = RestClient.create();
    }

    public String buildAuthorizationUrl() {
        ensureConfigured();

        return UriComponentsBuilder.fromUriString(AUTH_BASE_URL)
                .queryParam("client_id", properties.clientId())
                .queryParam("redirect_uri", properties.redirectUri())
                .queryParam("response_type", "code")
                .queryParam("scope", CALENDAR_SCOPE + " openid email")
                .queryParam("access_type", "offline")
                .queryParam("prompt", "consent")
                .build()
                .toUriString();
    }

    public void exchangeAuthorizationCode(String code) {
        ensureConfigured();

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

        tokenStore.save(new GoogleOAuthToken(
                accessToken,
                refreshToken,
                Instant.now().plusSeconds(expiresIn),
                email
        ));
    }

    public boolean isConnected() {
        return tokenStore.find().isPresent();
    }

    public String googleAccountEmail() {
        return tokenStore.find()
                .map(GoogleOAuthToken::googleAccountEmail)
                .orElse(null);
    }

    @Override
    public String calendarId() {
        return properties.calendarIdOrDefault();
    }

    @Override
    public void disconnect() {
        tokenStore.clear();
    }

    @Override
    public List<GoogleCalendarEventResponse> findEvents(OffsetDateTime from, OffsetDateTime to) {
        String accessToken = validAccessToken();
        String calendarId = properties.calendarIdOrDefault();

        JsonNode response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("www.googleapis.com")
                        .path("/calendar/v3/calendars/{calendarId}/events")
                        .queryParam("timeMin", from.toString())
                        .queryParam("timeMax", to.toString())
                        .queryParam("singleEvents", "true")
                        .queryParam("orderBy", "startTime")
                        .build(calendarId))
                .headers(headers -> headers.setBearerAuth(accessToken))
                .retrieve()
                .body(JsonNode.class);

        return toEvents(response, calendarId);
    }

    private String validAccessToken() {
        GoogleOAuthToken token = tokenStore.find()
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
        tokenStore.save(refreshed);

        return refreshed.accessToken();
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
                    item.path("location").asText(null)
            ));
        }

        return events;
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

    private void ensureConfigured() {
        if (!properties.isConfigured()) {
            throw new GoogleCalendarConnectionException(
                    "Google Calendar OAuth 환경변수가 설정되지 않았습니다."
            );
        }
    }
}
