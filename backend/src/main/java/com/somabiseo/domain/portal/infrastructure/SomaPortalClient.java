package com.somabiseo.domain.portal.infrastructure;

import com.somabiseo.domain.portal.domain.SomaPortalException;
import com.somabiseo.domain.portal.domain.SomaPortalSession;
import com.somabiseo.domain.portal.domain.SomaPortalUnauthorizedException;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Component
public class SomaPortalClient {
    private static final Pattern CHECK_SUCCESS_PATTERN = Pattern.compile("\"resultCode\"\\s*:\\s*\"success\"");

    private final SomaPortalProperties properties;
    private final SomaPortalHtmlParser parser;

    public SomaPortalClient(SomaPortalProperties properties, SomaPortalHtmlParser parser) {
        this.properties = properties;
        this.parser = parser;
    }

    public LoginResult login(String username, String password) {
        CookieManager cookieManager = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        HttpClient httpClient = newHttpClient(cookieManager);

        String loginPage = send(httpClient, get(properties.loginPagePath()));
        String csrfToken = parser.parseCsrfToken(loginPage);
        String formBody = loginFormBody(csrfToken, username, password);

        String checkBody = send(httpClient, postForm(properties.loginCheckPath(), formBody, true));

        if (!CHECK_SUCCESS_PATTERN.matcher(checkBody).find()) {
            throw new SomaPortalUnauthorizedException("SOMA 포털 계정 상태 확인에 실패했습니다.");
        }

        HttpResponse<String> loginResponse = sendRaw(httpClient, postForm(properties.loginSubmitPath(), formBody));
        HttpResponse<String> completedLoginResponse = completeAutoSubmitIfPresent(httpClient, loginResponse);

        if (parser.looksLikeLoggedOutPage(completedLoginResponse.body())) {
            throw new SomaPortalUnauthorizedException("SOMA 포털 로그인에 실패했습니다. 아이디와 비밀번호를 확인해 주세요.");
        }

        return new LoginResult(cookieManager, httpClient);
    }

    public String getNoticesHtml(SomaPortalSession session, int page) {
        HttpResponse<String> response = sendRaw(session.httpClient(), get(withPage(properties.noticeListPath(), page)));
        assertMypageResponse(response);

        return response.body();
    }

    public String getEventsHtml(SomaPortalSession session, int page) {
        HttpResponse<String> response = sendRaw(session.httpClient(), get(withPage(properties.eventListPath(), page)));
        assertMypageResponse(response);

        return response.body();
    }

    public String baseUrl() {
        return properties.baseUrl();
    }

    private HttpClient newHttpClient(CookieManager cookieManager) {
        return HttpClient.newBuilder()
                .cookieHandler(cookieManager)
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    private HttpRequest get(String path) {
        return HttpRequest.newBuilder(resolve(path))
                .timeout(Duration.ofSeconds(15))
                .header("User-Agent", "SomaBiseo/0.1 read-only assistant")
                .header("Accept", "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8")
                .GET()
                .build();
    }

    private HttpRequest postForm(String path, String formBody) {
        return postForm(path, formBody, false);
    }

    private HttpRequest postForm(String path, String formBody, boolean ajax) {
        HttpRequest.Builder builder = HttpRequest.newBuilder(resolve(path))
                .timeout(Duration.ofSeconds(15))
                .header("User-Agent", "SomaBiseo/0.1 read-only assistant")
                .header("Accept", "text/html,application/json;q=0.9,*/*;q=0.8")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Origin", properties.baseUrl())
                .header("Referer", resolve(properties.loginPagePath()).toString())
                .POST(HttpRequest.BodyPublishers.ofString(formBody, StandardCharsets.UTF_8));

        if (ajax) {
            builder.header("X-Requested-With", "XMLHttpRequest");
        }

        return builder.build();
    }

    private String send(HttpClient httpClient, HttpRequest request) {
        return sendRaw(httpClient, request).body();
    }

    private HttpResponse<String> sendRaw(HttpClient httpClient, HttpRequest request) {
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() >= 500) {
                throw new SomaPortalException("SOMA 포털 서버가 오류를 반환했습니다.");
            }

            return response;
        } catch (IOException exception) {
            throw new SomaPortalException("SOMA 포털과 통신하지 못했습니다.", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new SomaPortalException("SOMA 포털 요청이 중단됐습니다.", exception);
        }
    }

    private void assertMypageResponse(HttpResponse<String> response) {
        String path = response.uri().getPath();

        if (!path.contains("/sw/mypage") || parser.looksLikeLoggedOutPage(response.body())) {
            throw new SomaPortalUnauthorizedException("SOMA 포털 세션이 유효하지 않습니다. 다시 로그인해 주세요.");
        }
    }

    private URI resolve(String path) {
        return URI.create(properties.baseUrl()).resolve(path);
    }

    private String withPage(String path, int page) {
        int safePage = Math.max(page, 1);
        String separator = path.contains("?") ? "&" : "?";

        return path + separator + "pageIndex=" + safePage;
    }

    private String loginFormBody(String csrfToken, String username, String password) {
        Map<String, String> values = new LinkedHashMap<>();
        values.put("loginFlag", "");
        values.put("menuNo", "200025");
        values.put("csrfToken", csrfToken);
        values.put("username", username);
        values.put("password", password);

        return formBody(values);
    }

    private HttpResponse<String> completeAutoSubmitIfPresent(HttpClient httpClient, HttpResponse<String> response) {
        return parser.parseAutoSubmitForm(response.body())
                .map(form -> sendRaw(httpClient, postForm(form.action(), formBody(form.values()))))
                .orElse(response);
    }

    private String formBody(Map<String, String> values) {
        StringBuilder builder = new StringBuilder();

        for (Map.Entry<String, String> entry : values.entrySet()) {
            if (!builder.isEmpty()) {
                builder.append('&');
            }

            builder
                    .append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                    .append('=')
                    .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        }

        return builder.toString();
    }

    public record LoginResult(
            CookieManager cookieManager,
            HttpClient httpClient
    ) {
    }
}
