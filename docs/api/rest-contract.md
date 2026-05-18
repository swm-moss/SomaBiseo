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
```

```json
{
  "username": "portal-id",
  "password": "portal-password"
}
```

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
GET  /api/calendar/google/callback
GET  /api/calendar/conflicts?eventId=1
POST /api/calendar/events/{eventId}
DELETE /api/calendar/events/{eventId}
```
