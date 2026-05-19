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
    void parsesMentoLecListMetadataFromTableColumns() {
        String html = """
                <table>
                  <tbody>
                    <tr>
                      <td>343</td>
                      <td class="tit">
                        <a href="/busan/sw/mypage/mentoLec/view.do?qustnrSn=9343">
                          [멘토 특강] [오프라인] 지속 성장하는 AI 서비스 위한 CI/CD와 자동화 개선 루프
                        </a>
                      </td>
                      <td>2026-05-16 ~ 2026-06-01</td>
                      <td>2026-06-01(월) 20:00 ~ 22:00</td>
                      <td>2 /8</td>
                      <td>-</td>
                      <td>[접수중]</td>
                      <td>강민준</td>
                      <td>2026-05-16</td>
                    </tr>
                  </tbody>
                </table>
                """;

        List<SomaPortalEventResponse> events = parser.parseEvents(html, "https://www.swmaestro.ai");

        SomaPortalEventResponse event = events.getFirst();

        assertThat(event.mentorName()).isEqualTo("강민준");
        assertThat(event.author()).isEqualTo("강민준");
        assertThat(event.location()).isEqualTo("오프라인");
        assertThat(event.operationType()).isEqualTo("오프라인");
        assertThat(event.applicantCount()).isEqualTo(2);
        assertThat(event.capacity()).isEqualTo(8);
        assertThat(event.status()).isEqualTo("OPEN");
        assertThat(event.approvalStatus()).isNull();
        assertThat(event.registeredAt()).isNotNull();
        assertThat(event.startAt()).isNotNull();
        assertThat(event.endAt()).isNotNull();
    }

    @Test
    void usesListAuthorInsteadOfTopicAsMentorName() {
        String html = """
                <table>
                  <tbody>
                    <tr>
                      <td>345</td>
                      <td class="tit">
                        <a href="/busan/sw/mypage/mentoLec/view.do?qustnrSn=9345">
                          [자유 멘토링] 신홍재님 팀 멘토링 > 주제: 아이디어 멘토링
                        </a>
                      </td>
                      <td>2026-05-19 ~ 2026-06-04</td>
                      <td>2026-06-04(목) 09:00 ~ 10:00</td>
                      <td>1 /3</td>
                      <td>-</td>
                      <td>[접수중]</td>
                      <td>안재홍</td>
                      <td>2026-05-19</td>
                    </tr>
                  </tbody>
                </table>
                """;

        List<SomaPortalEventResponse> events = parser.parseEvents(html, "https://www.swmaestro.ai");

        assertThat(events.getFirst().mentorName()).isEqualTo("안재홍");
    }

    @Test
    void infersEventStatusesFromPortalText() {
        String html = """
                <table>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td class="tit"><a href="/busan/sw/mypage/mentoLec/view.do?qustnrSn=1">신청 접수중인 특강</a></td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td class="tit"><a href="/busan/sw/mypage/mentoLec/view.do?qustnrSn=2">정원 마감 특강</a></td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td class="tit"><a href="/busan/sw/mypage/mentoLec/view.do?qustnrSn=3">신청 예정 특강</a></td>
                    </tr>
                    <tr>
                      <td>4</td>
                      <td class="tit"><a href="/busan/sw/mypage/mentoLec/view.do?qustnrSn=4">행사 취소 특강</a></td>
                    </tr>
                  </tbody>
                </table>
                """;

        List<SomaPortalEventResponse> events = parser.parseEvents(html, "https://www.swmaestro.ai");

        assertThat(events).extracting(SomaPortalEventResponse::status)
                .containsExactly("OPEN", "FULL", "SCHEDULED", "CANCELED");
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
    void parsesMentoLecApplicationDetailForApply() {
        String html = """
                <html>
                  <body>
                    <button onclick="apply('9310', '7', '0')">신청하기</button>
                  </body>
                </html>
                """;

        var detail = parser.parseMentoLecApplicationDetail(html, "9310");

        assertThat(detail.qustnrSn()).isEqualTo("9310");
        assertThat(detail.applyCnt()).isEqualTo(7);
        assertThat(detail.appCnt()).isEqualTo(0);
        assertThat(detail.applied()).isFalse();
    }

    @Test
    void parsesMentoLecApplicationDetailForCancel() {
        String html = """
                <html>
                  <body>
                    <button onclick="apply('9310', 7, 1)">신청하기</button>
                    <a href="javascript:void(0)" onclick="applyCancel('9310', '38784')">[신청취소]</a>
                  </body>
                </html>
                """;

        var detail = parser.parseMentoLecApplicationDetail(html, "qustnrSn-9310");

        assertThat(detail.qustnrSn()).isEqualTo("9310");
        assertThat(detail.applyCnt()).isEqualTo(7);
        assertThat(detail.appCnt()).isEqualTo(1);
        assertThat(detail.applicationId()).isEqualTo("38784");
        assertThat(detail.applied()).isTrue();
    }

    @Test
    void parsesTotalPagesFromPaginationLinks() {
        String html = """
                <div class="paging">
                  <a href="?menuNo=200046&pageIndex=1">1</a>
                  <a href="?menuNo=200046&pageIndex=2">2</a>
                  <a href="javascript:fnLinkPage(3)">다음 목록</a>
                  <a onclick="goPage('5')">끝 목록</a>
                </div>
                """;

        int totalPages = parser.parseTotalPages(html, 1);

        assertThat(totalPages).isEqualTo(5);
    }

    @Test
    void doesNotUseNextPageLinkAsTotalPages() {
        String html = """
                <div class="paging">
                  <a href="?menuNo=200046&pageIndex=1">1</a>
                  <a href="javascript:fnLinkPage(2)">다음 목록</a>
                </div>
                """;

        int totalPages = parser.parseTotalPages(html, 1);

        assertThat(totalPages).isEqualTo(1);
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

    @Test
    void doesNotTreatLoggedInMypageWithOtherCenterLoginLinkAsLoggedOut() {
        String html = """
                <html>
                  <body>
                    <header>
                      <a href="/sw/member/user/forLogin.do?menuNo=200025" class="lock">로그인</a>
                      <a href="/busan/sw/member/user/logout.do">로그아웃</a>
                      <a href="/busan/sw/mypage/myNotice/list.do?menuNo=200038">MY PAGE</a>
                    </header>
                    <main>
                      <h1>공지사항</h1>
                    </main>
                  </body>
                </html>
                """;

        assertThat(parser.looksLikeLoggedOutPage(html)).isFalse();
    }

    @Test
    void detectsWrongPasswordAlertPageAsLoggedOut() {
        String html = """
                <!doctype html>
                <html lang="ko">
                  <head>
                    <script>
                      alert('아이디 혹은 비밀번호가 일치 하지 않습니다.');
                      location.href='/busan/sw/member/user/forLogin.do?menuNo=200025';
                    </script>
                  </head>
                  <body></body>
                </html>
                """;

        assertThat(parser.looksLikeLoggedOutPage(html)).isTrue();
    }

    @Test
    void parsesEventDetailTableContentAndApplicants() {
        String html = """
                <html>
                  <body>
                    <table>
                      <tbody>
                        <tr>
                          <th>모집 명</th>
                          <td colspan="3">[멘토 특강] [오프라인] 지속 성장하는 AI 서비스 위한 CI/CD와 자동화 개선 루프</td>
                        </tr>
                        <tr>
                          <th>상태</th>
                          <td>[마감]</td>
                          <th>개설 승인</th>
                          <td>OK</td>
                        </tr>
                        <tr>
                          <th>접수 기간</th>
                          <td>2026.05.12 00시00분 ~ 2026.05.31 09시00분</td>
                          <th>강의날짜</th>
                          <td>2026.05.31 09:00시 ~ 11:30시</td>
                        </tr>
                        <tr>
                          <th>진행방식</th>
                          <td>오프라인</td>
                          <th>장소</th>
                          <td>하이텐 - 23호실(8인)</td>
                        </tr>
                        <tr>
                          <th>모집인원</th>
                          <td>8명</td>
                          <th>작성자</th>
                          <td>오승근</td>
                        </tr>
                        <tr>
                          <th>등록일</th>
                          <td colspan="3">2026.05.11</td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="view-content">
                      <p>1. 멘토링 목표 : CI/CD와 자동화 개선 루프를 이해하는 것을 목표로 합니다.</p>
                      <p>2. 멘토링 세부 내용</p>
                      <ul>
                        <li>GitHub Actions 기반 다중 환경 CI/CD 파이프라인 설계 예시</li>
                        <li>환경별 변수·시크릿 관리</li>
                      </ul>
                    </div>
                    <h4>신청자 리스트 [8 명]</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>NO.</th>
                          <th>연수생</th>
                          <th>신청일</th>
                          <th>취소일</th>
                          <th>상태</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>9</td>
                          <td>박보라</td>
                          <td>2026.05.12 21:58</td>
                          <td>-</td>
                          <td>[신청완료]</td>
                        </tr>
                        <tr>
                          <td>취소</td>
                          <td>김도원</td>
                          <td>2026.05.12 21:55</td>
                          <td>2026.05.12 21:58</td>
                          <td>[신청취소]</td>
                        </tr>
                      </tbody>
                    </table>
                  </body>
                </html>
                """;

        SomaPortalEventResponse event = parser.parseEventDetail(
                html,
                "https://www.swmaestro.ai",
                "/busan/sw/mypage/mentoLec/view.do?qustnrSn=337"
        );

        assertThat(event.sourceId()).isEqualTo("qustnrSn-337");
        assertThat(event.type()).isEqualTo(EventType.LECTURE);
        assertThat(event.title()).contains("CI/CD와 자동화 개선 루프");
        assertThat(event.status()).isEqualTo("CLOSED");
        assertThat(event.approvalStatus()).isEqualTo("OK");
        assertThat(event.operationType()).isEqualTo("오프라인");
        assertThat(event.location()).isEqualTo("하이텐 - 23호실(8인)");
        assertThat(event.capacity()).isEqualTo(8);
        assertThat(event.applicantCount()).isEqualTo(8);
        assertThat(event.startAt()).isNotNull();
        assertThat(event.endAt()).isNotNull();
        assertThat(event.applicationStartAt()).isNotNull();
        assertThat(event.applicationEndAt()).isNotNull();
        assertThat(event.detailItems()).extracting("label").contains("모집명", "접수기간", "강의날짜");
        assertThat(event.contentText()).contains("멘토링 목표", "GitHub Actions");
        assertThat(event.applicants()).hasSize(2);
        assertThat(event.applicants().getFirst().traineeName()).isEqualTo("박보라");
        assertThat(event.applicants().getFirst().status()).isEqualTo("신청완료");
        assertThat(event.applicants().get(1).canceledAt()).isEqualTo("2026.05.12 21:58");
    }

    @Test
    void trimsPortalChromeFromEventDetailContentFallback() {
        String html = """
                <html>
                  <body>
                    메뉴 건너띄기
                    상단메뉴 바로가기
                    본문 바로가기
                    로딩 중입니다...
                    자유 멘토링 멘토 특강
                    HOME
                    마이페이지
                    멘토링 / 특강 게시판
                    접수내역
                    <table>
                      <tbody>
                        <tr>
                          <th>모집 명</th>
                          <td colspan="3">[멘토 특강] [오프라인] 지속 성정하는 AI 서비스 위한 CI/CD와 자동화 개선 루프</td>
                        </tr>
                        <tr>
                          <th>상태</th>
                          <td>[마감]</td>
                          <th>개설 승인</th>
                          <td>OK</td>
                        </tr>
                        <tr>
                          <th>접수 기간</th>
                          <td>2026.05.12 00시00분 ~ 2026.05.31 09시00분</td>
                          <th>강의날짜</th>
                          <td>2026.05.31 09:00시 ~ 11:30시</td>
                        </tr>
                        <tr>
                          <th>진행방식</th>
                          <td>오프라인</td>
                          <th>장소</th>
                          <td>하이텐 - 23호실(8인)</td>
                        </tr>
                        <tr>
                          <th>모집인원</th>
                          <td>8명</td>
                          <th>작성자</th>
                          <td>오승근</td>
                        </tr>
                        <tr>
                          <th>등록일</th>
                          <td colspan="3">2026.05.11</td>
                        </tr>
                      </tbody>
                    </table>
                    1. 멘토링 목표 : AI Agent 및 지능형 서비스를 지속 성장시키기 위한 필수 개념을 이해하는 것을 목표로 합니다.
                    2. 멘토링 세부 내용
                    - GitHub Actions 기반 다중 환경 CI/CD 파이프라인 설계 예시
                    취소하기
                    목록
                    ※ 무단불참 시 경고가 부여될 수 있습니다.
                    신청자 리스트 [8 명]
                    <table>
                      <tbody>
                        <tr>
                          <th>NO.</th>
                          <th>연수생</th>
                          <th>신청일</th>
                          <th>취소일</th>
                          <th>상태</th>
                        </tr>
                        <tr>
                          <td>1</td>
                          <td>심여준</td>
                          <td>2026.05.11 23:11</td>
                          <td>-</td>
                          <td>[신청완료]</td>
                        </tr>
                      </tbody>
                    </table>
                    처음 목록
                    이전 목록
                    1
                    다음 목록
                    끝 목록
                  </body>
                </html>
                """;

        SomaPortalEventResponse event = parser.parseEventDetail(
                html,
                "https://www.swmaestro.ai",
                "/busan/sw/mypage/mentoLec/view.do?qustnrSn=337"
        );

        assertThat(event.contentText()).contains("멘토링 목표", "GitHub Actions");
        assertThat(event.contentText()).doesNotContain("메뉴 건너띄기", "마이페이지", "취소하기", "신청자 리스트", "처음 목록");
    }

    @Test
    void parsesEventDetailFromPlainPortalTextLayout() {
        String html = """
                <html>
                  <body>
                    AI·SW 마에스트로 부산
                    NO.
                    팀명
                    팀장
                    자유 멘토링 / 멘토 특강
                    모집 명
                    [멘토 특강] [오프라인] 지속 성정하는 AI 서비스 위한 CI/CD와 자동화 개선 루프
                    상태
                    [마감]
                    개설 승인
                    OK
                    접수 기간
                    2026.05.12 00시00분
                    ~
                    2026.05.31 09시00분
                    강의날짜
                    2026.05.31
                    09:00시 ~ 11:30시
                    진행방식
                    오프라인
                    장소
                    하이텐 - 23호실(8인)
                    모집인원
                    8명
                    작성자
                    오승근
                    등록일
                    2026.05.11
                    1. 멘토링 목표 : AI Agent 및 지능형 서비스를 지속 성장시키기 위한 필수 개념을 이해하는 것을 목표로 합니다.
                    2. 멘토링 세부 내용
                    - GitHub Actions 기반 다중 환경 CI/CD 파이프라인 설계 예시
                    취소하기
                    목록
                    ※ 무단불참 시 경고가 부여될 수 있습니다.
                    신청자 리스트 [8 명]
                  </body>
                </html>
                """;

        SomaPortalEventResponse event = parser.parseEventDetail(
                html,
                "https://www.swmaestro.ai",
                "/busan/sw/mypage/mentoLec/view.do?qustnrSn=9216"
        );

        assertThat(event.title()).contains("CI/CD와 자동화 개선 루프");
        assertThat(event.location()).isEqualTo("하이텐 - 23호실(8인)");
        assertThat(event.contentText()).contains("멘토링 목표", "GitHub Actions");
        assertThat(event.contentText()).doesNotContain("AI·SW 마에스트로 부산", "NO.", "모집 명", "취소하기", "신청자 리스트");
    }

    @Test
    void parsesEventDetailFromDivLayoutWithoutNavigationNoise() {
        String html = """
                <html>
                  <head>
                    <title>AI·SW마에스트로 부산</title>
                  </head>
                  <body>
                    <header>
                      <a>메뉴 건너띄기</a>
                      <a>상단메뉴 바로가기</a>
                      <a>본문 바로가기</a>
                      <nav>공지사항 팀매칭 월간일정 멘토링 / 특강 게시판 보고 게시판 회원정보</nav>
                    </header>
                    <main id="content">
                      <h1>자유 멘토링 / 멘토 특강</h1>
                      <div class="bbs-view-new">
                        <div class="top">
                          <div class="group">
                            <strong class="t">모집 명</strong>
                            <div>[멘토 특강] 떠먹여주는 생성형 금융 Agent 서비스 기획</div>
                          </div>
                          <div class="half_w clearfix">
                            <div class="group">
                              <strong class="t">상태</strong>
                              <div>[마감]</div>
                            </div>
                            <div class="group">
                              <strong class="t">개설 승인</strong>
                              <div>OK</div>
                            </div>
                          </div>
                          <div class="half_w clearfix">
                            <div class="group">
                              <strong class="t">접수 기간</strong>
                              <div>2026.05.17 12시00분 ~ 2026.06.03 09시00분</div>
                            </div>
                            <div class="group">
                              <strong class="t">강의날짜</strong>
                              <div>2026.06.03 09:00시 ~ 12:00시</div>
                            </div>
                          </div>
                          <div class="half_w clearfix">
                            <div class="group">
                              <strong class="t">진행방식</strong>
                              <div>온라인</div>
                            </div>
                            <div class="group">
                              <strong class="t">장소</strong>
                              <div>온라인(webex)</div>
                            </div>
                          </div>
                          <div class="half_w clearfix">
                            <div class="group">
                              <strong class="t">모집인원</strong>
                              <div>9명</div>
                            </div>
                            <div class="group">
                              <strong class="t">작성자</strong>
                              <div>이태영</div>
                            </div>
                          </div>
                          <div class="group">
                            <strong class="t">등록일</strong>
                            <div>2026.05.13</div>
                          </div>
                        </div>
                        <div class="cont">
                          <p>금융 서비스는 어렵다고 느껴지시나요?</p>
                          <p>좋은 금융 서비스는 좋은 모델이 아니라 좋은 구조에서 시작됩니다.</p>
                          <p>WebEX URL https://soma.webex.com/example</p>
                        </div>
                        <div class="btns">
                          <a>취소하기</a>
                          <a>목록</a>
                        </div>
                        <h4>신청자 리스트 [9 명]</h4>
                        <table>
                          <thead>
                            <tr>
                              <th>NO.</th>
                              <th>연수생</th>
                              <th>신청일</th>
                              <th>취소일</th>
                              <th>상태</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>9</td>
                              <td>김태환</td>
                              <td>2026.05.18 09:04</td>
                              <td>-</td>
                              <td>[신청완료]</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </main>
                    <footer>개인정보처리방침 이메일무단수집거부 이용약관</footer>
                  </body>
                </html>
                """;

        SomaPortalEventResponse event = parser.parseEventDetail(
                html,
                "https://www.swmaestro.ai",
                "/busan/sw/mypage/mentoLec/view.do?qustnrSn=9281"
        );

        assertThat(event.title()).isEqualTo("[멘토 특강] 떠먹여주는 생성형 금융 Agent 서비스 기획");
        assertThat(event.title()).doesNotContain("AI·SW마에스트로 부산");
        assertThat(event.location()).isEqualTo("온라인(webex)");
        assertThat(event.location()).doesNotContain("모집인원", "작성자", "WebEX");
        assertThat(event.capacity()).isEqualTo(9);
        assertThat(event.applicantCount()).isEqualTo(9);
        assertThat(event.contentText()).contains("금융 서비스는 어렵다고 느껴지시나요?", "WebEX URL");
        assertThat(event.contentText()).doesNotContain("메뉴 건너띄기", "공지사항", "신청자 리스트", "개인정보처리방침");
        assertThat(event.rawText()).doesNotContain("메뉴 건너띄기", "개인정보처리방침");
        assertThat(event.applicants()).hasSize(1);
        assertThat(event.applicants().getFirst().traineeName()).isEqualTo("김태환");
    }
}
