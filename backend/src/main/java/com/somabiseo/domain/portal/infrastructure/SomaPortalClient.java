package com.somabiseo.domain.portal.infrastructure;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.somabiseo.domain.portal.domain.SomaPortalException;
import com.somabiseo.domain.portal.domain.SomaPortalMentoLecApplicationDetail;
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
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class SomaPortalClient {
    private static final Pattern CHECK_SUCCESS_PATTERN = Pattern.compile("\"resultCode\"\\s*:\\s*\"success\"");

    private final SomaPortalProperties properties;
    private final SomaPortalHtmlParser parser;
    private final ObjectMapper objectMapper;

    public SomaPortalClient(SomaPortalProperties properties, SomaPortalHtmlParser parser, ObjectMapper objectMapper) {
        this.properties = properties;
        this.parser = parser;
        this.objectMapper = objectMapper;
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

        HttpResponse<String> verificationResponse = sendRaw(httpClient, get(properties.noticeListPath()));
        assertLoginVerified(verificationResponse);

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

    public String getEventDetailHtml(SomaPortalSession session, String sourceUrl) {
        HttpResponse<String> response = sendRaw(session.httpClient(), get(sourceUrl));
        assertMypageResponse(response);

        return response.body();
    }

    public PortalCommandResult applyMentoLec(SomaPortalSession session, SomaPortalMentoLecApplicationDetail detail) {
        Map<String, String> values = new LinkedHashMap<>();
        values.put("qustnrSn", detail.qustnrSn());
        values.put("applyCnt", String.valueOf(detail.applyCnt()));
        values.put("appCnt", String.valueOf(detail.appCnt()));

        HttpResponse<String> response = sendRaw(session.httpClient(), postForm(
                properties.mentoLecApplyPath(),
                formBody(values),
                true,
                mentoLecViewPath(detail.qustnrSn())
        ));

        return parseCommandResult(response);
    }

    public PortalCommandResult cancelMentoLec(SomaPortalSession session, SomaPortalMentoLecApplicationDetail detail) {
        if (!detail.applied()) {
            throw new SomaPortalException("SOMA 포털 상세 페이지에서 취소할 신청 내역을 찾지 못했습니다.");
        }

        Map<String, String> values = new LinkedHashMap<>();
        values.put("id", detail.applicationId());
        values.put("qustnrSn", detail.qustnrSn());

        HttpResponse<String> response = sendRaw(session.httpClient(), postForm(
                properties.mentoLecCancelPath(),
                formBody(values),
                true,
                mentoLecViewPath(detail.qustnrSn())
        ));

        return parseCommandResult(response);
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
        return postForm(path, formBody, ajax, properties.loginPagePath());
    }

    private HttpRequest postForm(String path, String formBody, boolean ajax, String refererPath) {
        HttpRequest.Builder builder = HttpRequest.newBuilder(resolve(path))
                .timeout(Duration.ofSeconds(15))
                .header("User-Agent", "SomaBiseo/0.1 read-only assistant")
                .header("Accept", ajax ? "application/json, text/javascript, */*; q=0.01" : "text/html,application/json;q=0.9,*/*;q=0.8")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Origin", properties.baseUrl())
                .header("Referer", resolve(refererPath).toString())
                .POST(HttpRequest.BodyPublishers.ofString(formBody, StandardCharsets.UTF_8));

        if (ajax) {
            builder.header("X-Requested-With", "XMLHttpRequest");
            builder.header("AJAX", "true");
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

    private void assertLoginVerified(HttpResponse<String> response) {
        String path = response.uri().getPath();

        if (!path.contains("/sw/mypage") || parser.looksLikeLoggedOutPage(response.body())) {
            throw new SomaPortalUnauthorizedException("SOMA 포털 로그인에 실패했습니다. 아이디와 비밀번호를 확인해 주세요.");
        }
    }

    private URI resolve(String path) {
        URI baseUri = URI.create(properties.baseUrl());
        URI resolvedUri = baseUri.resolve(path);

        if (resolvedUri.getHost() != null && !resolvedUri.getHost().equals(baseUri.getHost())) {
            throw new SomaPortalException("허용되지 않은 SOMA 포털 URL입니다.");
        }

        return resolvedUri;
    }

    private String withPage(String path, int page) {
        int safePage = Math.max(page, 1);
        String separator = path.contains("?") ? "&" : "?";

        return path + separator + "pageIndex=" + safePage;
    }

    public String mentoLecViewPath(String qustnrSn) {
        String separator = properties.mentoLecViewPath().contains("?") ? "&" : "?";

        return properties.mentoLecViewPath() + separator + "qustnrSn=" + encode(qustnrSn);
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

    private PortalCommandResult parseCommandResult(HttpResponse<String> response) {
        String body = response.body() == null ? "" : response.body().trim();
        JsonNode jsonBody = commandJsonBody(body);
        String message = commandMessage(body, jsonBody);
        boolean commandFailure = looksLikeCommandFailure(body, message, jsonBody);

        if (parser.looksLikeLoggedOutPage(body)) {
            throw new SomaPortalUnauthorizedException("SOMA 포털 세션이 유효하지 않습니다. 다시 로그인해 주세요.");
        }

        if (response.statusCode() >= 400) {
            throw new SomaPortalException("SOMA 포털 요청이 실패했습니다.");
        }

        if (commandFailure) {
            throw new SomaPortalException(message.isBlank() ? "SOMA 포털 요청이 실패했습니다." : message);
        }

        if (message.isBlank()) {
            message = "정상처리하였습니다.";
        }

        return new PortalCommandResult(message);
    }

    private boolean looksLikeCommandFailure(String body, String message, JsonNode jsonBody) {
        if (jsonBody != null) {
            Boolean jsonFailure = jsonCommandFailure(jsonBody);

            if (jsonFailure != null) {
                return jsonFailure;
            }
        }

        String lowered = body.toLowerCase();

        if (lowered.contains("\"success\":false")
                || lowered.contains("\"result\":false")
                || lowered.contains("\"resultcode\":\"error\"")
                || lowered.contains("\"resultcode\":\"fail\"")
                || lowered.contains("\"result\":\"fail\"")
                || lowered.contains("\"cancelat\":\"n\"")) {
            return true;
        }

        String commandMessage = message.isBlank() ? body : message;

        return commandMessage.contains("실패")
                || commandMessage.contains("불가")
                || commandMessage.contains("마감")
                || commandMessage.contains("초과")
                || commandMessage.contains("오류");
    }

    private Boolean jsonCommandFailure(JsonNode jsonBody) {
        JsonNode success = findFieldIgnoreCase(jsonBody, "success");

        if (success != null && indicatesFalse(success)) {
            return true;
        }

        JsonNode result = findFieldIgnoreCase(jsonBody, "result");

        if (result != null && indicatesFailure(result)) {
            return true;
        }

        JsonNode resultCode = findFieldIgnoreCase(jsonBody, "resultCode");

        if (resultCode != null && indicatesFailure(resultCode)) {
            return true;
        }

        JsonNode cancelAt = findFieldIgnoreCase(jsonBody, "cancelAt");

        if (cancelAt != null && "n".equalsIgnoreCase(cancelAt.asText())) {
            return true;
        }

        return null;
    }

    private boolean indicatesFalse(JsonNode node) {
        if (node.isBoolean()) {
            return !node.asBoolean();
        }

        return "false".equalsIgnoreCase(node.asText());
    }

    private boolean indicatesFailure(JsonNode node) {
        if (indicatesFalse(node)) {
            return true;
        }

        String value = node.asText();

        return "error".equalsIgnoreCase(value) || "fail".equalsIgnoreCase(value);
    }

    private String commandMessage(String body, JsonNode jsonBody) {
        if (body.isBlank()) {
            return "";
        }

        if (jsonBody != null) {
            String message = firstTextField(jsonBody, "message", "msg", "resultMsg", "resultMessage");

            if (!message.isBlank()) {
                return message;
            }
        }

        Matcher matcher = Pattern.compile("\"(?:message|msg|resultMsg|resultMessage)\"\\s*:\\s*\"([^\"]*)\"")
                .matcher(body);

        if (matcher.find()) {
            return matcher.group(1);
        }

        String text = body.replaceAll("[{}\\[\\]\"]", " ").replaceAll("\\s+", " ").trim();

        return text.length() > 120 ? text.substring(0, 120) : text;
    }

    private JsonNode commandJsonBody(String body) {
        if (body.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readTree(body);
        } catch (JsonProcessingException exception) {
            return null;
        }
    }

    private String firstTextField(JsonNode jsonBody, String... fieldNames) {
        for (String fieldName : fieldNames) {
            JsonNode field = findFieldIgnoreCase(jsonBody, fieldName);

            if (field != null && field.isValueNode()) {
                String text = field.asText();

                if (!text.isBlank()) {
                    return text;
                }
            }
        }

        return "";
    }

    private JsonNode findFieldIgnoreCase(JsonNode node, String fieldName) {
        if (node == null) {
            return null;
        }

        if (node.isObject()) {
            for (Entry<String, JsonNode> field : node.properties()) {
                if (field.getKey().equalsIgnoreCase(fieldName)) {
                    return field.getValue();
                }

                JsonNode childResult = findFieldIgnoreCase(field.getValue(), fieldName);

                if (childResult != null) {
                    return childResult;
                }
            }
        }

        if (node.isArray()) {
            for (JsonNode child : node) {
                JsonNode childResult = findFieldIgnoreCase(child, fieldName);

                if (childResult != null) {
                    return childResult;
                }
            }
        }

        return null;
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    public record LoginResult(
            CookieManager cookieManager,
            HttpClient httpClient
    ) {
    }

    public record PortalCommandResult(String message) {
    }
}
