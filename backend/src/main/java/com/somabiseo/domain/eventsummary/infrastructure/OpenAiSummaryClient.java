package com.somabiseo.domain.eventsummary.infrastructure;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.somabiseo.domain.eventsummary.domain.EventAiSummaryException;
import com.somabiseo.domain.eventsummary.domain.EventAiSummaryPayload;
import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

@Component
public class OpenAiSummaryClient {
    private static final String SUMMARY_INSTRUCTIONS = """
            너는 SomaBiseo의 멘토링/특강 요약기다.
            소프트웨어마에스트로 연수생이 상세 본문을 빠르게 훑고 수강 여부를 판단할 수 있게 요약한다.
            과장하지 말고, 본문에 없는 내용을 만들지 말고, 모든 응답은 한국어로 작성한다.
            """;

    private final OpenAiProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public OpenAiSummaryClient(OpenAiProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(Math.max(properties.timeoutSeconds(), 5)))
                .build();
    }

    public EventAiSummaryPayload summarize(SomaPortalEventResponse event) {
        if (!properties.configured()) {
            throw new EventAiSummaryException("AI 요약을 사용하려면 OPENAI_API_KEY 환경변수가 필요합니다.");
        }

        JsonNode response = sendResponseRequest(buildRequestBody(event));
        String outputText = extractOutputText(response);

        try {
            JsonNode summaryJson = objectMapper.readTree(outputText);

            return new EventAiSummaryPayload(
                    text(summaryJson, "oneLine"),
                    texts(summaryJson, "summaryBullets", 3),
                    texts(summaryJson, "targetAudience", 3),
                    texts(summaryJson, "keyTopics", 6),
                    texts(summaryJson, "takeaways", 4),
                    text(summaryJson, "difficulty"),
                    response.path("usage").path("input_tokens").isInt()
                            ? response.path("usage").path("input_tokens").asInt()
                            : null,
                    response.path("usage").path("output_tokens").isInt()
                            ? response.path("usage").path("output_tokens").asInt()
                            : null
            );
        } catch (JsonProcessingException exception) {
            throw new EventAiSummaryException("AI 요약 응답을 해석하지 못했습니다.", exception);
        }
    }

    public String model() {
        return properties.model();
    }

    private JsonNode sendResponseRequest(Map<String, Object> requestBody) {
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(properties.baseUrl() + "/responses"))
                    .timeout(Duration.ofSeconds(Math.max(properties.timeoutSeconds(), 5)))
                    .header("Authorization", "Bearer " + properties.apiKey())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody), StandardCharsets.UTF_8))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() >= 400) {
                throw new EventAiSummaryException("OpenAI 요약 요청이 실패했습니다. 상태 코드: " + response.statusCode());
            }

            return objectMapper.readTree(response.body());
        } catch (JsonProcessingException exception) {
            throw new EventAiSummaryException("OpenAI 요청 또는 응답 JSON을 처리하지 못했습니다.", exception);
        } catch (IOException exception) {
            throw new EventAiSummaryException("OpenAI API와 통신하지 못했습니다.", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new EventAiSummaryException("OpenAI API 요청이 중단됐습니다.", exception);
        }
    }

    private Map<String, Object> buildRequestBody(SomaPortalEventResponse event) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", properties.model());
        body.put("instructions", SUMMARY_INSTRUCTIONS);
        body.put("input", List.of(Map.of(
                "role", "user",
                "content", List.of(Map.of(
                        "type", "input_text",
                        "text", prompt(event)
                ))
        )));
        body.put("max_output_tokens", 900);
        body.put("store", false);
        body.put("text", Map.of("format", responseFormat()));

        return body;
    }

    private Map<String, Object> responseFormat() {
        return Map.of(
                "type", "json_schema",
                "name", "soma_event_summary",
                "strict", true,
                "schema", Map.of(
                        "type", "object",
                        "additionalProperties", false,
                        "required", List.of("oneLine", "summaryBullets", "targetAudience", "keyTopics", "takeaways", "difficulty"),
                        "properties", Map.of(
                                "oneLine", Map.of(
                                        "type", "string",
                                        "description", "멘토링의 핵심을 1문장으로 요약"
                                ),
                                "summaryBullets", Map.of(
                                        "type", "array",
                                        "minItems", 2,
                                        "maxItems", 3,
                                        "items", Map.of("type", "string")
                                ),
                                "targetAudience", Map.of(
                                        "type", "array",
                                        "minItems", 1,
                                        "maxItems", 3,
                                        "items", Map.of("type", "string")
                                ),
                                "keyTopics", Map.of(
                                        "type", "array",
                                        "minItems", 2,
                                        "maxItems", 6,
                                        "items", Map.of("type", "string")
                                ),
                                "takeaways", Map.of(
                                        "type", "array",
                                        "minItems", 2,
                                        "maxItems", 4,
                                        "items", Map.of("type", "string")
                                ),
                                "difficulty", Map.of(
                                        "type", "string",
                                        "enum", List.of("입문", "중급", "심화", "미정")
                                )
                        )
                )
        );
    }

    private String prompt(SomaPortalEventResponse event) {
        String content = truncate(event.contentText() == null ? "" : event.contentText().trim());

        return """
                다음 SOMA 멘토링/특강을 요약해 주세요.

                제목: %s
                유형: %s
                멘토/작성자: %s
                시간: %s ~ %s
                장소: %s

                본문:
                %s
                """.formatted(
                nullToDash(event.title()),
                event.type(),
                nullToDash(event.mentorName() == null ? event.author() : event.mentorName()),
                event.startAt(),
                event.endAt(),
                nullToDash(event.location()),
                content
        );
    }

    private String extractOutputText(JsonNode response) {
        JsonNode output = response.path("output");

        if (!output.isArray()) {
            throw new EventAiSummaryException("OpenAI 응답에 output이 없습니다.");
        }

        for (JsonNode item : output) {
            JsonNode content = item.path("content");

            if (!content.isArray()) {
                continue;
            }

            for (JsonNode contentItem : content) {
                if ("output_text".equals(contentItem.path("type").asText())) {
                    String text = contentItem.path("text").asText();

                    if (!text.isBlank()) {
                        return text;
                    }
                }
            }
        }

        throw new EventAiSummaryException("OpenAI 응답에서 요약 텍스트를 찾지 못했습니다.");
    }

    private List<String> texts(JsonNode node, String fieldName, int limit) {
        JsonNode field = node.path(fieldName);

        if (!field.isArray()) {
            return List.of();
        }

        return StreamSupport.stream(field.spliterator(), false)
                .map(JsonNode::asText)
                .flatMap(this::splitStructuredText)
                .filter(value -> !value.isBlank())
                .limit(limit)
                .toList();
    }

    private String text(JsonNode node, String fieldName) {
        return node.path(fieldName).asText("").trim();
    }

    private Stream<String> splitStructuredText(String value) {
        return value
                .replace('\uFFFC', '\n')
                .replace('•', '\n')
                .lines()
                .map(line -> line.replaceFirst("^[-*]\\s*", ""))
                .map(String::trim)
                .filter(line -> !line.isBlank());
    }

    private String truncate(String value) {
        int maxInputCharacters = Math.max(properties.maxInputCharacters(), 1_000);

        if (value.length() <= maxInputCharacters) {
            return value;
        }

        return value.substring(0, maxInputCharacters) + "\n\n[본문이 길어 여기서 잘렸습니다.]";
    }

    private String nullToDash(Object value) {
        return value == null || value.toString().isBlank() ? "-" : value.toString();
    }
}
