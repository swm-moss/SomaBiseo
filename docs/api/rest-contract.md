# REST Contract Draft

## Health

```txt
GET /api/health
```

```json
{
  "status": "ok"
}
```

## Auth

```txt
POST /api/auth/google/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/me
```

## SOMA Portal Read Adapter

사용자에게 SOMA 포털 아이디/비밀번호를 입력받지 않습니다. 공지와 멘토링 조회는 백엔드가
`SOMA_PORTAL_OPERATOR_USERNAME`, `SOMA_PORTAL_OPERATOR_PASSWORD` 환경변수의 운영자 계정으로
읽기 전용 세션을 만들고 재사용합니다.

```txt
GET    /api/soma/notices?page=1
GET    /api/soma/events?page=1
GET    /api/soma/events/detail?sourceUrl={encodedSourceUrl}
POST   /api/soma/events/summary
```

기존 `POST /api/soma/login`, `DELETE /api/soma/logout`, `sessionId` 기반 조회는 과거 호환용으로만 남아 있습니다.
신규 프론트 흐름에서는 사용하지 않습니다.

```json
{
  "sourceUrl": "https://www.swmaestro.ai/busan/sw/mypage/mentoLec/view.do?..."
}
```

요약은 서버에서 상세 본문을 다시 읽어 `sourceId + contentHash`로 캐싱한다. 같은 본문은 OpenAI API를 다시 호출하지 않는다.

## Dashboard

```txt
GET /api/dashboard
```

## Notices

```txt
GET    /api/notices
GET    /api/notices/{noticeId}
POST   /api/notices/{noticeId}/read
POST   /api/notices/{noticeId}/bookmark
DELETE /api/notices/{noticeId}/bookmark
```

## Soma Events

```txt
GET    /api/events
GET    /api/events/{eventId}
POST   /api/events/{eventId}/favorite
DELETE /api/events/{eventId}/favorite
```

## Calendar

```txt
GET  /api/calendar/google/connect-url
GET  /api/calendar/google/callback?code={authorizationCode}
GET  /api/calendar/google/status
GET  /api/calendar/google/events?from={isoDateTime}&to={isoDateTime}
DELETE /api/calendar/google/connection
GET  /api/calendar/conflicts?eventId=1
POST /api/calendar/events/{eventId}
DELETE /api/calendar/events/{eventId}
```

`connect-url`은 Google OAuth 동의 화면 URL을 반환한다. OAuth 완료 후 Google이 `callback`으로
돌아오면 백엔드가 authorization code를 access token으로 교환하고 프론트 설정 화면으로 redirect한다.
