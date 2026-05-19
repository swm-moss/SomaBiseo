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

SOMA 포털 비밀번호는 저장하지 않습니다. `/api/soma/login` 요청 처리 중에만 사용하고, 서버는 포털 세션 쿠키를 가진 임시 `sessionId`만 메모리에 보관합니다.

```txt
POST   /api/soma/login
DELETE /api/soma/logout?sessionId={sessionId}
GET    /api/soma/notices?sessionId={sessionId}&page=1
GET    /api/soma/events?sessionId={sessionId}&page=1
GET    /api/soma/events/detail?sessionId={sessionId}&sourceUrl={encodedSourceUrl}
POST   /api/soma/events/summary
```

```json
{
  "username": "portal-id",
  "password": "portal-password"
}
```

`POST /api/soma/events/summary`는 `Authorization: Bearer {sessionId}` 헤더를 사용한다.

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
