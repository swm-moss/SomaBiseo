package com.somabiseo.domain.portal.infrastructure;

import com.somabiseo.domain.portal.domain.PortalBoardItem;
import com.somabiseo.domain.portal.domain.SomaPortalEventApplicantResponse;
import com.somabiseo.domain.portal.domain.SomaPortalEventDetailItem;
import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.portal.domain.SomaPortalException;
import com.somabiseo.domain.portal.domain.SomaPortalMentoLecApplicationDetail;
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
    private static final Pattern CAPACITY_PATTERN = Pattern.compile("(\\d+)\\s*명");
    private static final Pattern APPLICANT_COUNT_PATTERN = Pattern.compile("신청자\\s*리스트\\s*\\[\\s*(\\d+)\\s*명\\s*]");
    private static final Pattern TIME_AFTER_RANGE_PATTERN = Pattern.compile("~\\s*(\\d{1,2})[:시]\\s*(\\d{1,2})?");
    private static final Pattern HREF_PAGE_INDEX_PATTERN = Pattern.compile("(?:[?&]|^)pageIndex=(\\d+)");
    private static final Pattern SCRIPT_PAGE_INDEX_PATTERN = Pattern.compile("(?:fnLinkPage|linkPage|fn_egov_link_page|goPage|movePage|goPaging)\\s*\\(\\s*'?(\\d+)'?\\s*\\)");

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
        String text = document.text();

        return !document.select("form#login_form").isEmpty()
                || text.contains("아이디를 입력해 주세요")
                || text.contains("비밀번호를 입력해 주세요")
                || text.contains("아이디 혹은 비밀번호가 일치 하지 않습니다")
                || text.contains("아이디 혹은 비밀번호가 일치하지 않습니다")
                || html.contains("아이디 혹은 비밀번호가 일치 하지 않습니다")
                || html.contains("아이디 혹은 비밀번호가 일치하지 않습니다");
    }

    public boolean looksLikeLoggedOutPage(String html) {
        Document document = Jsoup.parse(html);

        if (looksLikeLoggedInPage(document)) {
            return false;
        }

        return looksLikeLoginPage(html)
                || document.select("a.lock[href*=forLogin.do]").stream()
                .anyMatch(link -> clean(link.text()).contains("로그인"));
    }

    private boolean looksLikeLoggedInPage(Document document) {
        String text = clean(document.text());

        return text.contains("로그아웃") || text.contains("MY PAGE");
    }

    public Optional<PortalAutoSubmitForm> parseAutoSubmitForm(String html) {
        Document document = Jsoup.parse(html);
        Element form = document.selectFirst("form[name=gofrm], form#gofrm");

        if (form == null) {
            return Optional.empty();
        }

        String action = clean(form.attr("action"));

        if (action.isBlank()) {
            return Optional.empty();
        }

        Map<String, String> values = new LinkedHashMap<>();

        for (Element input : form.select("input[name]")) {
            String name = clean(input.attr("name"));

            if (!name.isBlank()) {
                values.put(name, input.attr("value"));
            }
        }

        if (values.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(new PortalAutoSubmitForm(action, values));
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
                            null,
                            null,
                            null,
                            null,
                            inferStatus(item.rawText()),
                            null,
                            null,
                            null,
                            null,
                            item.sourceUrl(),
                            List.of(),
                            null,
                            List.of(),
                            item.rawText()
                    );
                })
                .toList();
    }

    public SomaPortalEventResponse parseEventDetail(String html, String baseUrl, String sourceUrl) {
        Document document = Jsoup.parse(html, baseUrl);
        String resolvedSourceUrl = absoluteUrl(sourceUrl, baseUrl);
        Element infoTable = findInfoTable(document).orElse(null);
        Map<String, String> detailMap = infoTable == null ? Map.of() : parseDetailMap(infoTable);
        Element applicantTable = findApplicantTable(document).orElse(null);
        List<SomaPortalEventApplicantResponse> applicants = applicantTable == null
                ? List.of()
                : parseApplicants(applicantTable);
        String rawText = clean(document.text());
        String title = firstNonBlank(
                detailMap.get("모집 명"),
                detailMap.get("모집명"),
                inferTitle(document),
                "SOMA 일정"
        );
        String lectureDate = firstNonBlank(detailMap.get("강의날짜"), detailMap.get("강의 날짜"));
        DateTimeRange lectureRange = parseDateTimeRange(lectureDate)
                .orElseGet(() -> new DateTimeRange(inferDateTime(rawText).orElse(null), null));
        String applicationPeriod = firstNonBlank(detailMap.get("접수 기간"), detailMap.get("접수기간"));
        DateTimeRange applicationRange = parseDateTimeRange(applicationPeriod)
                .orElseGet(() -> new DateTimeRange(null, null));

        return new SomaPortalEventResponse(
                sourceIdFromHref(resolvedSourceUrl),
                inferEventType(title + " " + rawText),
                title,
                inferMentorName(rawText).orElse(null),
                inferTopic(title),
                firstNonBlank(detailMap.get("장소"), inferLocation(rawText).orElse(null)),
                lectureRange.startAt(),
                lectureRange.endAt(),
                applicationRange.startAt(),
                applicationRange.endAt(),
                parseCapacity(detailMap.get("모집인원")).orElse(null),
                parseApplicantCount(rawText).orElse(applicants.isEmpty() ? null : applicants.size()),
                inferStatus(firstNonBlank(detailMap.get("상태"), rawText)),
                detailMap.get("개설승인"),
                detailMap.get("진행방식"),
                detailMap.get("작성자"),
                parseDate(detailMap.get("등록일")).orElse(null),
                resolvedSourceUrl,
                detailMap.entrySet().stream()
                        .map(entry -> new SomaPortalEventDetailItem(entry.getKey(), entry.getValue()))
                        .toList(),
                parseContentText(document, infoTable, applicantTable).orElse(null),
                applicants,
                rawText
        );
    }

    public SomaPortalMentoLecApplicationDetail parseMentoLecApplicationDetail(String html, String qustnrSn) {
        Document document = Jsoup.parse(html);
        String normalizedQustnrSn = normalizeId(qustnrSn);
        String source = document.html();
        int[] applyValues = parseApplyValues(document, source, normalizedQustnrSn);
        String applicationId = parseApplicationId(document, source, normalizedQustnrSn).orElse(null);

        return new SomaPortalMentoLecApplicationDetail(
                normalizedQustnrSn,
                applyValues[0],
                applyValues[1],
                applicationId
        );
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

    public int parseTotalPages(String html, int fallbackPage) {
        Document document = Jsoup.parse(html);
        int totalPages = Math.max(fallbackPage, 1);

        for (Element element : document.select("a[href], a[onclick], button[onclick]")) {
            if (!isPaginationElement(element)) {
                continue;
            }

            totalPages = Math.max(totalPages, maxPageIndex(element.attr("href")));
            totalPages = Math.max(totalPages, maxPageIndex(element.attr("onclick")));
        }

        for (Element element : document.select(".pagination a, .paging a, .page a, .paginate a, .bbs-page a")) {
            String text = clean(element.text());

            if (text.matches("\\d+")) {
                totalPages = Math.max(totalPages, Integer.parseInt(text));
            }
        }

        return totalPages;
    }

    public boolean hasPaginationLinks(String html) {
        Document document = Jsoup.parse(html);

        for (Element element : document.select("a[href], a[onclick], button[onclick]")) {
            if (!isPaginationElement(element)) {
                continue;
            }

            if (maxPageIndex(element.attr("href")) > 0 || maxPageIndex(element.attr("onclick")) > 0) {
                return true;
            }
        }

        return document.select(".pagination a, .paging a, .page a, .paginate a, .bbs-page a").stream()
                .map(element -> clean(element.text()))
                .anyMatch(text -> text.matches("\\d+"));
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
        Element link = row.selectFirst("td.tit a[href*=view.do], td.tit a[href*=detail.do]");

        if (link == null) {
            link = row.selectFirst("a[href*=view.do], a[href*=detail.do]");
        }

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

    private Optional<Element> findInfoTable(Document document) {
        return document.select("table").stream()
                .filter(table -> {
                    String text = clean(table.text());

                    return text.contains("모집 명")
                            || text.contains("접수 기간")
                            || text.contains("강의날짜")
                            || text.contains("모집인원");
                })
                .findFirst();
    }

    private Map<String, String> parseDetailMap(Element table) {
        Map<String, String> details = new LinkedHashMap<>();

        for (Element row : table.select("tr")) {
            Elements cells = row.select("th, td");

            for (int index = 0; index + 1 < cells.size(); index += 2) {
                String label = clean(cells.get(index).text()).replace(" ", "");
                String value = clean(cells.get(index + 1).text());

                if (!label.isBlank() && !value.isBlank() && label.length() <= 10) {
                    details.put(label, value);
                }
            }
        }

        return details;
    }

    private Optional<Element> findApplicantTable(Document document) {
        return document.select("table").stream()
                .filter(table -> {
                    String text = clean(table.text());

                    return text.contains("연수생") && text.contains("신청일") && text.contains("상태");
                })
                .findFirst();
    }

    private List<SomaPortalEventApplicantResponse> parseApplicants(Element table) {
        Elements headerCells = table.select("tr").stream()
                .filter(row -> !row.select("th").isEmpty())
                .findFirst()
                .map(row -> row.select("th, td"))
                .orElseGet(Elements::new);

        Map<String, Integer> headerIndex = new LinkedHashMap<>();

        for (int index = 0; index < headerCells.size(); index++) {
            headerIndex.put(clean(headerCells.get(index).text()).replace(" ", ""), index);
        }

        int noIndex = headerIndex.getOrDefault("NO.", headerIndex.getOrDefault("NO", 0));
        int nameIndex = headerIndex.getOrDefault("연수생", 1);
        int appliedAtIndex = headerIndex.getOrDefault("신청일", 2);
        int canceledAtIndex = headerIndex.getOrDefault("취소일", 3);
        int statusIndex = headerIndex.getOrDefault("상태", 4);
        List<SomaPortalEventApplicantResponse> applicants = new ArrayList<>();

        for (Element row : table.select("tr")) {
            if (!row.select("th").isEmpty()) {
                continue;
            }

            Elements cells = row.select("td");

            if (cells.size() <= Math.max(statusIndex, nameIndex)) {
                continue;
            }

            String traineeName = cellText(cells, nameIndex);

            if (traineeName.isBlank() || traineeName.equals("연수생")) {
                continue;
            }

            String canceledAt = cellText(cells, canceledAtIndex);

            applicants.add(new SomaPortalEventApplicantResponse(
                    cellText(cells, noIndex),
                    traineeName,
                    cellText(cells, appliedAtIndex),
                    "-".equals(canceledAt) ? null : canceledAt,
                    cellText(cells, statusIndex).replace("[", "").replace("]", "")
            ));
        }

        return applicants;
    }

    private String cellText(Elements cells, int index) {
        if (index < 0 || index >= cells.size()) {
            return "";
        }

        return clean(cells.get(index).text());
    }

    private Optional<String> parseContentText(Document document, Element infoTable, Element applicantTable) {
        Element start = infoTable == null ? null : infoTable.nextElementSibling();
        StringBuilder builder = new StringBuilder();

        while (start != null && start != applicantTable) {
            if (applicantTable != null && start.select("table").contains(applicantTable)) {
                break;
            }

            String text = cleanMultilineText(start);

            if (!text.isBlank() && !text.contains("신청자 리스트")) {
                if (!builder.isEmpty()) {
                    builder.append("\n\n");
                }

                builder.append(text);
            }

            start = start.nextElementSibling();
        }

        if (!builder.isEmpty()) {
            return Optional.of(builder.toString());
        }

        Document clone = document.clone();
        clone.select("script, style, header, nav, footer, table").remove();
        String fallback = cleanMultilineText(clone.body());

        return fallback.isBlank() ? Optional.empty() : Optional.of(fallback);
    }

    private String cleanMultilineText(Element element) {
        Element clone = element.clone();

        clone.select("br").after("\n");
        clone.select("p, div, li, h1, h2, h3, h4, h5").forEach(block -> block.append("\n"));

        return cleanMultiline(clone.wholeText());
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
                .replace("[멘토 특강]", " ")
                .replace("[멘토특강]", " ")
                .replace("[자유멘토링]", " ")
                .replace("[멘토링]", " ")
                .replace("[자유 멘토링]", " ")
                .replace("|", " "));
        String[] tokens = beforeMarker.split("\\s+");

        if (tokens.length == 0 || tokens[tokens.length - 1].isBlank()) {
            return Optional.empty();
        }

        String name = tokens[tokens.length - 1];

        if (tokens.length >= 2 && isAsciiWord(tokens[tokens.length - 2]) && isAsciiWord(name)) {
            name = tokens[tokens.length - 2] + " " + name;
        }

        if (!isNameToken(name)) {
            return Optional.empty();
        }

        return Optional.of(name + " 멘토");
    }

    private boolean isAsciiWord(String value) {
        return value.matches("[A-Za-z][A-Za-z0-9.·-]*");
    }

    private boolean isNameToken(String value) {
        return value.matches("[가-힣A-Za-z][가-힣A-Za-z0-9.·\\- ]*");
    }

    private String inferTopic(String title) {
        return title
                .replace("[멘토 특강]", "")
                .replace("[멘토특강]", "")
                .replace("[자유 멘토링]", "")
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

    private Optional<DateTimeRange> parseDateTimeRange(String text) {
        String cleaned = clean(text);

        if (cleaned.isBlank()) {
            return Optional.empty();
        }

        Matcher matcher = DATE_TIME_PATTERN.matcher(cleaned);

        if (!matcher.find()) {
            return Optional.empty();
        }

        OffsetDateTime startAt = toOffsetDateTime(matcher);
        OffsetDateTime endAt = null;
        int firstMatchEnd = matcher.end();

        if (matcher.find()) {
            endAt = toOffsetDateTime(matcher);
        } else {
            Matcher timeMatcher = TIME_AFTER_RANGE_PATTERN.matcher(cleaned.substring(firstMatchEnd));

            if (timeMatcher.find()) {
                int hour = Integer.parseInt(timeMatcher.group(1));
                int minute = timeMatcher.group(2) == null || timeMatcher.group(2).isBlank()
                        ? 0
                        : Integer.parseInt(timeMatcher.group(2));

                endAt = startAt.withHour(hour).withMinute(minute);
            }
        }

        return Optional.of(new DateTimeRange(startAt, endAt));
    }

    private OffsetDateTime toOffsetDateTime(Matcher matcher) {
        int minute = matcher.group(5) == null || matcher.group(5).isBlank()
                ? 0
                : Integer.parseInt(matcher.group(5));

        return LocalDateTime.of(
                Integer.parseInt(matcher.group(1)),
                Integer.parseInt(matcher.group(2)),
                Integer.parseInt(matcher.group(3)),
                Integer.parseInt(matcher.group(4)),
                minute
        ).atZone(SEOUL).toOffsetDateTime();
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

    private Optional<Integer> parseCapacity(String text) {
        Matcher matcher = CAPACITY_PATTERN.matcher(clean(text));

        if (!matcher.find()) {
            return Optional.empty();
        }

        return Optional.of(Integer.parseInt(matcher.group(1)));
    }

    private Optional<Integer> parseApplicantCount(String text) {
        Matcher matcher = APPLICANT_COUNT_PATTERN.matcher(clean(text));

        if (!matcher.find()) {
            return Optional.empty();
        }

        return Optional.of(Integer.parseInt(matcher.group(1)));
    }

    private String inferStatus(String text) {
        if (text.contains("취소됨") || text.contains("행사취소") || text.contains("행사 취소")
                || text.contains("특강취소") || text.contains("특강 취소")) {
            return "CANCELED";
        }

        if (text.contains("정원마감") || text.contains("정원 마감") || text.contains("인원마감")
                || text.contains("인원 마감") || text.contains("모집마감") || text.contains("모집 마감")) {
            return "FULL";
        }

        if (text.contains("마감") || text.contains("종료")) {
            return "CLOSED";
        }

        if (text.contains("예정")) {
            return "SCHEDULED";
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

            for (String key : List.of("nttId", "qustnrSn", "lecId", "mentoLecId", "seq", "id")) {
                String value = params.get(key);

                if (value != null && !value.isBlank()) {
                    return key + "-" + value;
                }
            }
        }

        return Integer.toHexString(href.hashCode());
    }

    private int[] parseApplyValues(Document document, String source, String qustnrSn) {
        Optional<int[]> fromApplyCall = parseApplyValuesFromScript(source, qustnrSn);

        if (fromApplyCall.isPresent()) {
            return fromApplyCall.get();
        }

        Optional<Integer> applyCnt = parseIntegerValue(document, "applyCnt")
                .or(() -> parseIntegerAssignment(source, "applyCnt"));
        Optional<Integer> appCnt = parseIntegerValue(document, "appCnt")
                .or(() -> parseIntegerAssignment(source, "appCnt"));

        if (applyCnt.isPresent() && appCnt.isPresent()) {
            return new int[]{applyCnt.get(), appCnt.get()};
        }

        throw new SomaPortalException("SOMA 포털 상세 페이지에서 신청 파라미터를 찾지 못했습니다.");
    }

    private Optional<int[]> parseApplyValuesFromScript(String source, String qustnrSn) {
        Pattern pattern = Pattern.compile(
                "apply\\s*\\(\\s*['\"]?" + Pattern.quote(qustnrSn) + "['\"]?\\s*,\\s*['\"]?(\\d+)['\"]?\\s*,\\s*['\"]?(\\d+)['\"]?",
                Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = pattern.matcher(source);

        if (!matcher.find()) {
            return Optional.empty();
        }

        return Optional.of(new int[]{
                Integer.parseInt(matcher.group(1)),
                Integer.parseInt(matcher.group(2))
        });
    }

    private Optional<String> parseApplicationId(Document document, String source, String qustnrSn) {
        Optional<String> fromCancelCall = parseApplicationIdFromScript(source, qustnrSn);

        if (fromCancelCall.isPresent()) {
            return fromCancelCall;
        }

        return document.select("input[name=id], input[name=applicationId], input[name=aplySn]").stream()
                .map(input -> clean(input.attr("value")))
                .filter(value -> !value.isBlank())
                .findFirst();
    }

    private Optional<String> parseApplicationIdFromScript(String source, String qustnrSn) {
        Pattern pattern = Pattern.compile(
                "applyCancel\\s*\\(\\s*['\"]?" + Pattern.quote(qustnrSn) + "['\"]?\\s*,\\s*['\"]?([^'\"),\\s]+)",
                Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = pattern.matcher(source);

        return matcher.find() ? Optional.of(matcher.group(1)) : Optional.empty();
    }

    private Optional<Integer> parseIntegerValue(Document document, String name) {
        return document.select("input[name=" + name + "], input[id=" + name + "]").stream()
                .map(input -> clean(input.attr("value")))
                .filter(value -> value.matches("\\d+"))
                .map(Integer::parseInt)
                .findFirst();
    }

    private Optional<Integer> parseIntegerAssignment(String source, String name) {
        Pattern pattern = Pattern.compile(Pattern.quote(name) + "\\s*[=:]\\s*['\"]?(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(source);

        return matcher.find() ? Optional.of(Integer.parseInt(matcher.group(1))) : Optional.empty();
    }

    private String normalizeId(String id) {
        if (id != null && id.startsWith("qustnrSn-")) {
            return id.substring("qustnrSn-".length());
        }

        return id;
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

    private int maxPageIndex(String value) {
        String cleaned = clean(value);

        if (cleaned.isBlank()) {
            return 0;
        }

        int maxPage = 0;
        Matcher hrefMatcher = HREF_PAGE_INDEX_PATTERN.matcher(cleaned);

        while (hrefMatcher.find()) {
            maxPage = Math.max(maxPage, Integer.parseInt(hrefMatcher.group(1)));
        }

        Matcher scriptMatcher = SCRIPT_PAGE_INDEX_PATTERN.matcher(cleaned);

        while (scriptMatcher.find()) {
            maxPage = Math.max(maxPage, Integer.parseInt(scriptMatcher.group(1)));
        }

        return maxPage;
    }

    private boolean isPaginationElement(Element element) {
        return looksLikePaginationText(clean(element.text())) || hasPaginationContainer(element);
    }

    private boolean looksLikePaginationText(String text) {
        return text.matches("\\d+")
                || List.of("처음", "이전", "다음", "끝", "처음 목록", "이전 목록", "다음 목록", "끝 목록")
                .contains(text);
    }

    private boolean hasPaginationContainer(Element element) {
        Element current = element;

        while (current != null) {
            String marker = (current.className() + " " + current.id()).toLowerCase();

            if (marker.contains("pagination")
                    || marker.contains("paging")
                    || marker.contains("paginate")
                    || marker.contains("bbs-page")) {
                return true;
            }

            current = current.parent();
        }

        return false;
    }

    private String inferTitle(Document document) {
        return document.select("h1, h2, h3, h4, .tit, .title").stream()
                .map(element -> clean(element.text()))
                .filter(text -> !text.isBlank())
                .findFirst()
                .orElse("");
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            String cleaned = clean(value);

            if (!cleaned.isBlank()) {
                return cleaned;
            }
        }

        return "";
    }

    private String clean(String value) {
        if (value == null) {
            return "";
        }

        return value.replace('\u00a0', ' ').replaceAll("\\s+", " ").trim();
    }

    private String cleanMultiline(String value) {
        if (value == null) {
            return "";
        }

        return value.replace('\u00a0', ' ')
                .replaceAll("[ \\t\\x0B\\f\\r]+", " ")
                .replaceAll(" *\\n *", "\n")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
    }

    public record PortalAutoSubmitForm(
            String action,
            Map<String, String> values
    ) {
    }

    private record DateTimeRange(
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {
    }
}
