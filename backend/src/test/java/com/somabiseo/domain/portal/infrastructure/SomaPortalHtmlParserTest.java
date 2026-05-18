package com.somabiseo.domain.portal.infrastructure;

import com.somabiseo.domain.portal.domain.PortalBoardItem;
import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.somaevent.domain.EventType;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class SomaPortalHtmlParserTest {
    private final SomaPortalHtmlParser parser = new SomaPortalHtmlParser();

    @Test
    void parsesCsrfTokenFromLoginPage() {
        String html = """
                <form id="login_form">
                  <input type="hidden" name="csrfToken" value="token-123" />
                </form>
                """;

        assertThat(parser.parseCsrfToken(html)).isEqualTo("token-123");
    }

    @Test
    void parsesGalleryBoardItems() {
        String html = """
                <ul class="bbs-gallery">
                  <li class="item">
                    <strong class="t">
                      <a href="/busan/sw/bbs/B0000002/view.do?nttId=36047&menuNo=200019&pageIndex=1">공지 제목</a>
                    </strong>
                    <span class="date">2026.01.12</span>
                  </li>
                </ul>
                """;

        List<PortalBoardItem> items = parser.parseBoardItems(html, "https://www.swmaestro.ai");

        assertThat(items).hasSize(1);
        assertThat(items.getFirst().sourceId()).isEqualTo("nttId-36047");
        assertThat(items.getFirst().title()).isEqualTo("공지 제목");
        assertThat(items.getFirst().sourceUrl()).isEqualTo("https://www.swmaestro.ai/busan/sw/bbs/B0000002/view.do?nttId=36047&menuNo=200019&pageIndex=1");
        assertThat(items.getFirst().date()).isNotNull();
    }

    @Test
    void parsesTableBoardItemsAndInfersEventType() {
        String html = """
                <table>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td class="tit"><a href="/busan/sw/mypage/mentoLec/view.do?qustnrSn=17">[멘토특강] AI 서비스 운영</a></td>
                      <td>정다은 멘토</td>
                      <td>2026.05.20 15:00</td>
                    </tr>
                  </tbody>
                </table>
                """;

        List<SomaPortalEventResponse> events = parser.parseEvents(html, "https://www.swmaestro.ai");

        assertThat(events).hasSize(1);
        assertThat(events.getFirst().sourceId()).isEqualTo("qustnrSn-17");
        assertThat(events.getFirst().type()).isEqualTo(EventType.LECTURE);
        assertThat(events.getFirst().mentorName()).isEqualTo("정다은 멘토");
        assertThat(events.getFirst().startAt()).isNotNull();
    }

    @Test
    void doesNotTreatEventTypeLabelAsMentorName() {
        String html = """
                <table>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td class="tit"><a href="/busan/sw/mypage/mentoLec/view.do?qustnrSn=9284">[멘토 특강] 글로벌 금융 질서의 재편</a></td>
                      <td>2026-06-20 09:00</td>
                    </tr>
                  </tbody>
                </table>
                """;

        List<SomaPortalEventResponse> events = parser.parseEvents(html, "https://www.swmaestro.ai");

        assertThat(events).hasSize(1);
        assertThat(events.getFirst().mentorName()).isNull();
        assertThat(events.getFirst().topic()).isEqualTo("글로벌 금융 질서의 재편");
    }

    @Test
    void parsesAutoSubmitBridgeForm() {
        String html = """
                <form name="gofrm" action='/busan/sw/login.do' method='post'>
                  <input type='hidden' name='password' value='hashed-password' />
                  <input type='hidden' name='username' value='user@example.com' />
                </form>
                """;

        Optional<SomaPortalHtmlParser.PortalAutoSubmitForm> form = parser.parseAutoSubmitForm(html);

        assertThat(form).isPresent();
        assertThat(form.get().action()).isEqualTo("/busan/sw/login.do");
        assertThat(form.get().values())
                .containsEntry("username", "user@example.com")
                .containsEntry("password", "hashed-password");
    }

    @Test
    void detectsLoggedOutMainPage() {
        String html = """
                <html>
                  <body>
                    <a href="/sw/member/user/forLogin.do?menuNo=200025" class="lock">로그인</a>
                  </body>
                </html>
                """;

        assertThat(parser.looksLikeLoggedOutPage(html)).isTrue();
    }
}
