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

## Run Backend

```bash
docker compose up -d postgres
cd backend
./gradlew bootRun
```

Local backend health:

```bash
curl http://localhost:8080/api/health
```

## Product Guardrails

- 비공식 서비스로 표현합니다.
- SOMA 포털 비밀번호를 저장하지 않습니다.
- MVP 1차에서는 신청, 취소 자동화를 만들지 않습니다.
- 실제 SOMA 연동은 mock 또는 수동 import 이후에 붙입니다.
