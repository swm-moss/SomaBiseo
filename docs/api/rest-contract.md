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
