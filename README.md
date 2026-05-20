# SomaBiseo

SomaBiseo는 소프트웨어마에스트로 연수생을 위한 비공식 일정, 공지, 멘토링 비서입니다.

## Structure

```txt
SomaBiseo
├─ frontend  Next.js App Router + FSD
├─ backend   Spring Boot REST API
└─ docs      product, API, agent task split
```

## Run Frontend

```bash
npm --prefix frontend run dev
```

Open the URL printed by Next.js, usually `http://localhost:3000`. If another app is using
3000, Next.js will pick another port such as `http://localhost:3001`.

## Run Backend

Create a local env file first. The real invite code and production secrets must stay in your
ignored `.env`.

```bash
cp .env.example .env
```

For this workspace, `.env` is already populated from Railway secrets with localhost DB and
redirect overrides. The raw Railway dump is stored in ignored `.env.railway.local` only for local
operator reference. Do not commit either file.

```bash
docker compose up -d --build backend
```

Local backend health:

```bash
curl http://localhost:8080/api/health
```

Postgres is exposed on `127.0.0.1:${POSTGRES_PORT:-15432}` to avoid clashing with an existing local `5432`.

## Production Deployment

Frontend deploys to Vercel and backend deploys to Railway after CI passes on `main`.
See [프로덕션 배포 문서](docs/deployment/production.md).

## Implementation Docs

- [프론트 초기 세팅](docs/frontend/initial-setup.md)
- [SOMA 포털 읽기 어댑터, 공지, 멘토링 기능](docs/features/soma-portal.md)

## Project Context

Agent handoff notes, React Query caching policy, and current infrastructure decisions live in
[Conversation Notes](docs/conversation.md).

## Local Real Portal Test

```bash
docker compose up -d --build backend
npm --prefix frontend run dev
```

Before running real portal reads, set the read-only operator credentials as environment variables
for the backend. These secrets are used only by the server-side adapter.

```bash
export SOMA_PORTAL_OPERATOR_USERNAME="<operator-soma-id>"
export SOMA_PORTAL_OPERATOR_PASSWORD="<operator-soma-password>"
```

Then open `/dashboard`, `/notices`, or `/events` on the frontend localhost URL. End users do not
enter SOMA portal credentials; the frontend calls read APIs without `sessionId`, and the backend
uses the operator account to fetch notices and mentoring events.
Fetched notices and mentoring events are stored in Postgres and refreshed by TTL instead of being
crawled on every request.

## Product Guardrails

- 비공식 서비스로 표현합니다.
- 사용자에게 SOMA 포털 아이디/비밀번호를 입력받지 않습니다.
- 읽기 전용 포털 조회는 서버 환경변수의 운영자 계정으로만 수행합니다.
- MVP 1차에서는 신청, 취소를 넣지 않습니다. 이후에는 사용자 명시 버튼 기반 흐름만 허용하고 매크로성 자동 반복 실행은 만들지 않습니다.
- 실제 SOMA 연동은 읽기 전용 데이터 조회부터 붙입니다.
