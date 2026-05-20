# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

SomaBiseo는 소프트웨어마에스트로 연수생을 위한 **비공식** 일정/공지/멘토링 비서입니다. Monorepo: `frontend` (Next.js) + `backend` (Spring Boot) + `docs`.

확정된 최신 제품/기술/인프라 맥락은 [docs/conversation.md](docs/conversation.md)에 있고, 에이전트 규칙은 [AGENTS.md](AGENTS.md), 프론트 세부 규칙은 [frontend/AGENTS.md](frontend/AGENTS.md), 백엔드 세부 규칙은 [backend/AGENTS.md](backend/AGENTS.md)에 있습니다. 작업 전에 이 문서들을 함께 확인하세요.

## Commands

루트 `package.json`이 양쪽 워크스페이스를 래핑합니다.

```bash
# Frontend (Next.js dev server on :3000, falls back to :3001 if taken)
npm run frontend:dev
npm run frontend:lint
npm run frontend:build

# Backend
npm run backend:dev          # ./gradlew bootRun
npm run backend:test         # ./gradlew test  (uses H2 in tests)

# Run a single backend test class
cd backend && ./gradlew test --tests 'com.somabiseo.domain.notice.application.NoticeServiceTest'

# Full local stack (backend + Postgres in Docker)
docker compose up -d --build backend
curl http://localhost:8080/api/health   # → { "status": "ok" }
```

Postgres는 호스트의 `5432`와 충돌하지 않도록 `127.0.0.1:${POSTGRES_PORT:-15432}`로 노출됩니다. 컨테이너 내부에서는 여전히 `5432`.

CI (`.github/workflows/ci.yml`)는 frontend lint+build, backend test를 실행합니다. `main`의 CI가 통과해야 `Deploy Production`이 Vercel + Railway에 배포합니다.

## Architecture

### Frontend — Next.js App Router + FSD

이 프로젝트의 Next.js는 16.x이며 훈련 데이터와 다를 수 있습니다. **새 API/패턴을 쓰기 전 `frontend/node_modules/next/dist/docs/`의 해당 가이드를 먼저 읽으세요.**

FSD 레이어 (Next의 `src/pages` 예약 폴더와 충돌을 피하려 페이지 조립 레이어는 **`views`**로 부릅니다):

- `src/app` — App Router 라우팅, providers, 전역 CSS만. `(auth)`, `(main)` 라우트 그룹.
- `src/views/{dashboard,events,event-detail,notices,notice-detail,login,landing,settings}` — 페이지 조립.
- `src/widgets` — 화면 블록 (app-shell, event-list, notice-list, dashboard-summary 등).
- `src/features` — 사용자 액션 단위 (auth, bookmark-notice, favorite-event, user-interests, add-event-to-calendar, connect-google-calendar 등).
- `src/entities/{notice,soma-event,calendar,user,review}` — 도메인 모델 + 도메인 API 호출.
- `src/shared` — 도메인을 모르는 공용 코드 (`api/client.ts`, `api/query-client.ts`, `ui`, `lib`).

상태 관리 (자세한 정책은 `docs/conversation.md`):

- **서버 상태는 TanStack Query.** QueryClient 기본값은 `frontend/src/shared/api/query-client.ts`에 모여 있음: `staleTime: 60s`, `gcTime: 5m`, `refetchOnWindowFocus: false`, query retry 1회.
- Query key에는 **SOMA 세션 ID, 필터, 상세 ID, 페이지 번호**처럼 응답을 바꾸는 값을 모두 포함합니다. SOMA 공지/멘토링 목록은 `pageIndex` 기반이므로 `page`까지 key에 포함.
- 목록은 무한 스크롤이 아닌 **번호 페이지네이션**을 우선.
- AI 요약은 상세 조회와 분리된 `POST /api/soma/events/summary`에서 만들고, 프론트는 `event-ai-summary` key로 읽음. 백엔드가 `sourceId + contentHash`로 DB 캐시.
- **Zustand는 브라우저 로컬 상태에만** — 임시 SOMA 세션, 북마크/읽음/관심, Google Calendar mock 연결 상태. 관심사는 `somabiseo-interest-preferences` 키로 persist되며, 비어 있으면 AppShell이 온보딩 모달을 띄움 (한 세션 안에서 "나중에"는 `sessionStorage`로 억제).

### Backend — Spring Boot 3.5 / Java 21

패키지는 `com.somabiseo.global` (공용 설정/응답/예외)과 `com.somabiseo.domain.<domain>`으로만 가릅니다. 각 도메인은 DDD 풍 4계층:

```
domain/<name>/
  presentation/   ← @RestController
  application/    ← @Service (use case)
  domain/         ← Entity, repository interface
  infrastructure/ ← repository 구현, 외부 어댑터
```

현재 도메인: `portal`, `notice`, `somaevent`, `eventsummary`, `dashboard`, `calendar`, `source`, `health`.

규칙:

- API 응답은 `ApiResponse<T>`로 감싸되, **`/api/health`만 예외**로 `{ "status": "ok" }`를 그대로 반환 (Railway healthcheck 대상).
- 외부 SOMA 데이터는 `SomaSourceClient` 인터페이스로 추상화. 기본 구현은 mock/manual import로 시작.
- 사용자 명시 요청 기반의 SOMA 포털 read-only는 `domain/portal`에 격리. **포털 비밀번호는 절대 저장하지 않음** — 임시 세션 쿠키만 메모리에 TTL로 보관.
- Google Calendar 쓰기는 idempotent — 같은 `SomaEvent`에 대해 중복 이벤트를 만들지 않음. 초기 구현은 mock.
- AI 요약은 `OPENAI_API_KEY`가 있을 때만 동작. 모델 기본값 `gpt-5.4-mini`, 교체는 `OPENAI_SUMMARY_MODEL` 환경변수.
- DB는 PostgreSQL + Flyway (마이그레이션은 `backend/src/main/resources/db/migration`). 테스트는 H2.
- Railway는 `PORT` 환경변수를 우선 지원해야 하고 healthcheck는 `/api/health`.

## Product Guardrails (코드에 영향 큼)

- **비공식 서비스** — 공식 SOMA 앱처럼 보이는 문구/로고를 쓰지 않습니다.
- SOMA 포털 비밀번호를 저장하지 않습니다.
- MVP 1차에서 **신청/취소 자동화·매크로성 동작 금지**. 이후에도 사용자가 명시적으로 누른 버튼 기반 흐름만.
- 무단 대량 크롤링, 후기/랭킹/추천 알고리즘은 1차에 넣지 않습니다.
- 실제 SOMA 연동은 mock 또는 수동 import를 거친 뒤 붙입니다.

## Frontend Design Rules

- 모바일 퍼스트. 데스크톱에서도 헤더와 상세 화면이 깨지지 않아야 함.
- **카드 남발 금지, 섹션당 역할 1개만, 필러 카피 금지.**
- 로딩/에러/빈 상태를 반드시 구현.
- shadcn/ui 계열 컴포넌트를 사용.

## Commit Messages

[docs/conventions/commit-message.md](docs/conventions/commit-message.md)를 따릅니다. 요약: `type: 제목` (type은 소문자 영어, 제목/본문은 한글, 제목과 본문 사이 빈 행, 제목 끝 마침표 금지). 유형: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `design`, `comment`, `rename`, `remove`, `!BREAKING CHANGE`, `!HOTFIX`.

## Deployment

- Frontend → Vercel (`https://somabiseo.vercel.app`), `NEXT_PUBLIC_API_BASE_URL`이 Railway 백엔드 공개 도메인 + `/api`를 가리킴.
- Backend → Railway (Dockerfile 빌드), Postgres는 private network로 연결되어 JDBC URL이 `DATABASE_JDBC_URL`로 주입됨. 프론트 도메인은 `CORS_ALLOWED_ORIGINS`에 등록.
- 배포 설정/시크릿/환경변수를 바꾸면 [docs/deployment/production.md](docs/deployment/production.md)를 함께 갱신합니다.
