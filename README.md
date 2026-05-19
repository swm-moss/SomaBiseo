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

## Local Real Portal Test

```bash
docker compose up -d --build backend
npm --prefix frontend run dev
```

Then open `/login` on the frontend localhost URL and sign in with a SOMA portal account.
The frontend calls `http://localhost:8080/api/soma/login`, stores only the temporary
`sessionId` in browser storage, and uses it to load real notices and mentoring events.

## Product Guardrails

- 비공식 서비스로 표현합니다.
- SOMA 포털 비밀번호를 저장하지 않습니다.
- MVP 1차에서는 신청, 취소 자동화를 만들지 않습니다.
- 실제 SOMA 연동은 mock 또는 수동 import 이후에 붙입니다.
