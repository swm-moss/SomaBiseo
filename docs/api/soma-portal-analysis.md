# SOMA Portal Read Adapter Notes

분석 대상: `https://www.swmaestro.ai/busan/sw/member/user/forLogin.do?menuNo=200025`

## Login Flow

1. 로그인 페이지를 `GET`으로 열어 `JSESSIONID` 쿠키와 `csrfToken` hidden input을 받습니다.
2. 다음 form 값을 `application/x-www-form-urlencoded`로 구성합니다.

```txt
loginFlag=
menuNo=200025
csrfToken={login-page-csrfToken}
username={portal-id}
password={portal-password}
```

3. `/busan/sw/member/user/checkStat.json`에 먼저 `POST`합니다.
4. 응답의 `resultCode`가 `success`이면 `/busan/sw/member/user/toLogin.do`에 같은 form body로 `POST`합니다.
5. 로그인 성공 후 받은 포털 쿠키는 `sessionId`에 매핑해서 서버 메모리에만 보관합니다.

## Read Targets

```txt
공지사항: /busan/sw/mypage/myNotice/list.do?menuNo=200038
멘토특강/자유멘토링: /busan/sw/mypage/mentoLec/list.do?menuNo=200046
```

목록 페이지는 `pageIndex` query로 페이지를 넘깁니다.

## SomaBiseo API

```txt
POST   /api/soma/login
DELETE /api/soma/logout?sessionId={sessionId}
GET    /api/soma/notices?sessionId={sessionId}&page=1
GET    /api/soma/events?sessionId={sessionId}&page=1
```

## Safety Boundary

- 포털 비밀번호는 저장하지 않습니다.
- 포털 쿠키는 메모리에서만 TTL로 보관합니다.
- 이 어댑터는 읽기 전용입니다.
- 특강 신청, 취소, 자유멘토링 신청 자동화는 구현하지 않습니다.
