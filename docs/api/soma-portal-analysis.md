# SOMA Portal Read Adapter Notes

분석 대상: `https://www.swmaestro.ai/busan/sw/member/user/forLogin.do?menuNo=200025`

## Login Flow

현재 제품 플로우에서는 사용자가 이 로그인 값을 입력하지 않습니다. 아래 흐름은 백엔드가
`SOMA_PORTAL_OPERATOR_USERNAME`, `SOMA_PORTAL_OPERATOR_PASSWORD` 환경변수의 운영자 계정으로
읽기 전용 데이터를 동기화할 때만 사용합니다.

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
5. 로그인 성공 후 받은 포털 쿠키는 운영자 읽기 세션으로 서버 메모리에만 보관합니다.

## Read Targets

```txt
공지사항: /busan/sw/mypage/myNotice/list.do?menuNo=200038
멘토특강/자유멘토링: /busan/sw/mypage/mentoLec/list.do?menuNo=200046
```

목록 페이지는 `pageIndex` query로 페이지를 넘깁니다.
프론트 목록은 첫 페이지만 고정 조회하지 않고 사용자가 페이지 번호를 누를 때 해당 `pageIndex`를 불러오는 방식으로 처리합니다.

## SomaBiseo API

```txt
GET /api/soma/notices?page=1
GET /api/soma/events?page=1
```

목록 응답의 `data`는 페이지 메타데이터를 포함합니다.

```json
{
  "items": [],
  "page": 1,
  "totalPages": 3,
  "hasNextPage": true
}
```

## Safety Boundary

- 사용자에게 포털 아이디/비밀번호를 입력받지 않습니다.
- 운영자 포털 계정은 환경변수로만 주입합니다.
- 포털 쿠키는 메모리에서만 TTL로 보관합니다.
- 현재 어댑터는 읽기 전용입니다.
- 신청/취소 기능은 읽기 전용 조회 흐름과 분리해서 다룹니다.
