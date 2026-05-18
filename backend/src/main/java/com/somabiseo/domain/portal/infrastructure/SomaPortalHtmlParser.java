package com.somabiseo.domain.portal.infrastructure;

import com.somabiseo.domain.portal.domain.PortalBoardItem;
import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.portal.domain.SomaPortalException;
import com.somabiseo.domain.portal.domain.SomaPortalNoticeResponse;
import com.somabiseo.domain.somaevent.domain.EventType;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class SomaPortalHtmlParser {
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final Pattern DATE_PATTERN = Pattern.compile("(20\\d{2})[.\\-/년 ]\\s*(\\d{1,2})[.\\-/월 ]\\s*(\\d{1,2})");
    private static final Pattern DATE_TIME_PATTERN = Pattern.compile("(20\\d{2})[.\\-/년 ]\\s*(\\d{1,2})[.\\-/월 ]\\s*(\\d{1,2})\\s*(\\d{1,2})[:시]\\s*(\\d{1,2})?");

    public String parseCsrfToken(String html) {
        Document document = Jsoup.parse(html);
        String csrfToken = document.select("input[name=csrfToken]").attr("value");

        if (csrfToken == null || csrfToken.isBlank()) {
            throw new SomaPortalException("SOMA 포털 로그인 페이지에서 csrfToken을 찾지 못했습니다.");
        }

        return csrfToken;
    }

    public boolean looksLikeLoginPage(String html) {
        Document document = Jsoup.parse(html);

        return !document.select("form#login_form").isEmpty()
                || document.text().contains("아이디를 입력해 주세요")
                || document.text().contains("비밀번호를 입력해 주세요");
    }

    public List<SomaPortalNoticeResponse> parseNotices(String html, String baseUrl) {
        return parseBoardItems(html, baseUrl).stream()
                .map(item -> new SomaPortalNoticeResponse(
                        item.sourceId(),
                        item.title(),
                        item.sourceUrl(),
                        item.date(),
                        item.rawText()
                ))
                .toList();
    }

    public List<SomaPortalEventResponse> parseEvents(String html, String baseUrl) {
        return parseBoardItems(html, baseUrl).stream()
                .map(item -> {
                    EventType type = inferEventType(item.title() + " " + item.rawText());

                    return new SomaPortalEventResponse(
                            item.sourceId(),
                            type,
                            item.title(),
                            inferMentorName(item.rawText()).orElse(null),
                            inferTopic(item.title()),
                            inferLocation(item.rawText()).orElse(null),
                            inferDateTime(item.rawText()).orElse(item.date()),
                            null,
                            inferStatus(item.rawText()),
                            item.sourceUrl(),
                            item.rawText()
                    );
                })
                .toList();
    }

    public List<PortalBoardItem> parseBoardItems(String html, String baseUrl) {
        Document document = Jsoup.parse(html, baseUrl);
        Map<String, PortalBoardItem> items = new LinkedHashMap<>();

        for (Element galleryItem : document.select("ul.bbs-gallery li.item")) {
            Optional<PortalBoardItem> item = parseGalleryItem(galleryItem, baseUrl);
            item.ifPresent(boardItem -> items.putIfAbsent(boardItem.sourceId(), boardItem));
        }

        for (Element row : document.select("table tbody tr")) {
            Optional<PortalBoardItem> item = parseTableRow(row, baseUrl);
            item.ifPresent(boardItem -> items.putIfAbsent(boardItem.sourceId(), boardItem));
        }

        if (items.isEmpty()) {
            for (Element link : document.select("a[href*=view.do], a[href*=detail.do]")) {
                Optional<PortalBoardItem> item = parseLink(link, baseUrl);
                item.ifPresent(boardItem -> items.putIfAbsent(boardItem.sourceId(), boardItem));
            }
        }

        return new ArrayList<>(items.values());
    }

    private Optional<PortalBoardItem> parseGalleryItem(Element element, String baseUrl) {
        Element link = element.selectFirst("strong.t a[href]");

        if (link == null) {
            link = element.selectFirst("a[href*=view.do], a[href*=detail.do]");
        }

        if (link == null) {
            return Optional.empty();
        }

        String title = clean(link.text());
        String href = absoluteUrl(link.attr("href"), baseUrl);
        String rawText = clean(element.text());
        OffsetDateTime date = parseDate(element.select(".date").text()).orElseGet(() -> inferDate(rawText).orElse(null));

        return Optional.of(new PortalBoardItem(sourceIdFromHref(href), title, href, date, rawText));
    }

    private Optional<PortalBoardItem> parseTableRow(Element row, String baseUrl) {
        Element link = row.selectFirst("a[href*=view.do], a[href*=detail.do], a[href]");

        if (link == null || clean(link.text()).isBlank()) {
            return Optional.empty();
        }

        String title = clean(link.text());
        String href = absoluteUrl(link.attr("href"), baseUrl);
        String rawText = clean(row.text());
        OffsetDateTime date = inferDate(rawText).orElse(null);

        return Optional.of(new PortalBoardItem(sourceIdFromHref(href), title, href, date, rawText));
    }

    private Optional<PortalBoardItem> parseLink(Element link, String baseUrl) {
        String title = clean(link.text());

        if (title.isBlank()) {
            return Optional.empty();
        }

        String href = absoluteUrl(link.attr("href"), baseUrl);

        return Optional.of(new PortalBoardItem(sourceIdFromHref(href), title, href, null, title));
    }

    private EventType inferEventType(String text) {
        if (text.contains("특강")) {
            return EventType.LECTURE;
        }

        return EventType.MENTORING;
    }

    private Optional<String> inferMentorName(String text) {
        int mentorMarker = text.lastIndexOf("멘토");

        if (mentorMarker < 0) {
            return Optional.empty();
        }

        String beforeMarker = clean(text.substring(0, mentorMarker)
                .replace("[멘토특강]", " ")
                .replace("[자유멘토링]", " ")
                .replace("[멘토링]", " ")
                .replace("|", " "));
        String[] tokens = beforeMarker.split("\\s+");

        if (tokens.length == 0 || tokens[tokens.length - 1].isBlank()) {
            return Optional.empty();
        }

        String name = tokens[tokens.length - 1];

        if (tokens.length >= 2 && isAsciiWord(tokens[tokens.length - 2]) && isAsciiWord(name)) {
            name = tokens[tokens.length - 2] + " " + name;
        }

        return Optional.of(name + " 멘토");
    }

    private boolean isAsciiWord(String value) {
        return value.matches("[A-Za-z][A-Za-z0-9.·-]*");
    }

    private String inferTopic(String title) {
        return title
                .replace("[멘토특강]", "")
                .replace("[자유멘토링]", "")
                .replace("[멘토링]", "")
                .trim();
    }

    private Optional<String> inferLocation(String text) {
        for (String marker : List.of("장소", "위치")) {
            int index = text.indexOf(marker);

            if (index >= 0) {
                String tail = text.substring(index + marker.length()).replace(":", " ").trim();
                String value = tail.split("\\s{2,}|\\|")[0].trim();

                if (!value.isBlank()) {
                    return Optional.of(value);
                }
            }
        }

        if (text.contains("온라인")) {
            return Optional.of("온라인");
        }

        return Optional.empty();
    }

    private Optional<OffsetDateTime> inferDate(String text) {
        Matcher matcher = DATE_PATTERN.matcher(text);

        if (!matcher.find()) {
            return Optional.empty();
        }

        return parseDate(matcher.group(1) + "." + matcher.group(2) + "." + matcher.group(3));
    }

    private Optional<OffsetDateTime> inferDateTime(String text) {
        Matcher matcher = DATE_TIME_PATTERN.matcher(text);

        if (!matcher.find()) {
            return Optional.empty();
        }

        int minute = matcher.group(5) == null || matcher.group(5).isBlank()
                ? 0
                : Integer.parseInt(matcher.group(5));

        LocalDateTime dateTime = LocalDateTime.of(
                Integer.parseInt(matcher.group(1)),
                Integer.parseInt(matcher.group(2)),
                Integer.parseInt(matcher.group(3)),
                Integer.parseInt(matcher.group(4)),
                minute
        );

        return Optional.of(dateTime.atZone(SEOUL).toOffsetDateTime());
    }

    private Optional<OffsetDateTime> parseDate(String value) {
        String cleaned = clean(value);

        if (cleaned.isBlank()) {
            return Optional.empty();
        }

        for (DateTimeFormatter formatter : List.of(
                DateTimeFormatter.ofPattern("yyyy.MM.dd"),
                DateTimeFormatter.ofPattern("yyyy.M.d"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("yyyy-M-d")
        )) {
            try {
                return Optional.of(LocalDate.parse(cleaned, formatter)
                        .atStartOfDay(SEOUL)
                        .toOffsetDateTime());
            } catch (DateTimeParseException ignored) {
                // 다음 포맷을 시도합니다.
            }
        }

        return Optional.empty();
    }

    private String inferStatus(String text) {
        if (text.contains("마감") || text.contains("종료")) {
            return "CLOSED";
        }

        if (text.contains("신청") || text.contains("접수")) {
            return "OPEN";
        }

        return "UNKNOWN";
    }

    private String absoluteUrl(String href, String baseUrl) {
        if (href == null || href.isBlank()) {
            return baseUrl;
        }

        return URI.create(baseUrl).resolve(href).toString();
    }

    private String sourceIdFromHref(String href) {
        URI uri = URI.create(href);
        String query = uri.getRawQuery();

        if (query != null) {
            Map<String, String> params = parseQuery(query);

            for (String key : List.of("nttId", "lecId", "mentoLecId", "seq", "id")) {
                String value = params.get(key);

                if (value != null && !value.isBlank()) {
                    return key + "-" + value;
                }
            }
        }

        return Integer.toHexString(href.hashCode());
    }

    private Map<String, String> parseQuery(String query) {
        Map<String, String> params = new LinkedHashMap<>();

        for (String pair : query.split("&")) {
            int separator = pair.indexOf('=');

            if (separator <= 0) {
                continue;
            }

            String key = URLDecoder.decode(pair.substring(0, separator), StandardCharsets.UTF_8);
            String value = URLDecoder.decode(pair.substring(separator + 1), StandardCharsets.UTF_8);
            params.put(key, value);
        }

        return params;
    }

    private String clean(String value) {
        if (value == null) {
            return "";
        }

        return value.replace('\u00a0', ' ').replaceAll("\\s+", " ").trim();
    }
}
