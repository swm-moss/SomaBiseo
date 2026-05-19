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
GET  /api/calendar/google/callback
GET  /api/calendar/conflicts?eventId=1
POST /api/calendar/events/{eventId}
DELETE /api/calendar/events/{eventId}
```

## Reviews

```txt
GET  /api/reviews/writable
GET  /api/reviews/recent-events?limit=3
GET  /api/reviews/summaries?eventIds=a,b
GET  /api/events/{eventId}/reviews?page=1&size=10
POST /api/events/{eventId}/reviews
```

POST body는 `{"authorName": "...", "content": "20~500자"}`다. 본문 길이/종료 후 3일 윈도/신청자 명단 매칭/중복 작성 4가지 검증을 서버가 수행한다. 작성자는 백엔드가 동결한 신청자 명단에서 선택하므로 후기 작성 자체에 인증 헤더는 필요 없다.

요약 응답(`/api/reviews/summaries`)은 요청한 eventIds 순서대로 `{eventId, reviewCount, lastCreatedAt}` 배열을 돌려준다.
