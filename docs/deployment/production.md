# 프로덕션 배포

SomaBiseo는 프론트엔드를 Vercel, 백엔드를 Railway에 분리 배포한다.

## 현재 운영 구성

| 구분 | 값 |
| --- | --- |
| Frontend | `https://somabiseo.vercel.app` |
| Backend Health | `https://backend-production-76bf.up.railway.app/api/health` |
| Railway Project | `SomaBiseo` |
| Railway Backend Service | `backend` |
| Railway Postgres Service | `postgres-db` |

## 배포 흐름

```txt
Pull Request -> CI
main push    -> CI 성공 -> Vercel frontend 배포
                        -> Railway backend 배포
```

- PR에서는 `CI` 워크플로우만 실행한다.
- `main`에 push되면 `CI`가 다시 실행된다.
- `main`의 `CI`가 성공하면 `Deploy Production` 워크플로우가 실행된다.
- 수동 재배포가 필요하면 GitHub Actions에서 `Deploy Production`을 `workflow_dispatch`로 실행한다.

## GitHub Secrets

Repository 또는 `production` Environment에 아래 secrets를 등록한다.

| 이름 | 설명 |
| --- | --- |
| `VERCEL_TOKEN` | Vercel CLI 배포용 토큰 |
| `VERCEL_ORG_ID` | Vercel 팀 또는 계정 ID |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID |
| `RAILWAY_TOKEN` | Railway CLI 배포용 토큰 |

## GitHub Variables

Repository 또는 `production` Environment에 아래 variables를 등록한다.

| 이름 | 설명 |
| --- | --- |
| `RAILWAY_PROJECT_ID` | Railway 프로젝트 ID |
| `RAILWAY_SERVICE_NAME` | Railway 백엔드 서비스 이름. 현재 값은 `backend` |
| `RAILWAY_ENVIRONMENT_NAME` | Railway 환경 이름. 비워두면 `production` 사용 |

## Vercel 설정

Vercel 프로젝트는 `frontend` 디렉토리를 루트로 설정한다.

필수 환경변수:

| 이름 | 예시 | 설명 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://backend-production-76bf.up.railway.app/api` | Railway 백엔드 공개 도메인 + `/api` |

권장 설정:

- Framework Preset: `Next.js`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: Next.js 기본값

## Railway 설정

Railway 백엔드 서비스는 `backend` 디렉토리를 배포 대상으로 사용한다. GitHub Actions는 다음 방식으로 업로드한다.

```bash
railway up backend --path-as-root
```

`backend/railway.toml`은 Dockerfile 빌드, `/api/health` healthcheck, 실패 시 재시작 정책을 정의한다.

필수 환경변수:

| 이름 | 예시 | 설명 |
| --- | --- | --- |
| `DATABASE_JDBC_URL` | `jdbc:postgresql://postgres-db.railway.internal:5432/railway` | Spring Boot용 JDBC URL. 없으면 `DATABASE_URL`을 자동 변환 |
| `DATABASE_USERNAME` | `somabiseo` | DB 사용자 |
| `DATABASE_PASSWORD` | `********` | DB 비밀번호 |
| `CORS_ALLOWED_ORIGINS` | `https://somabiseo.vercel.app` | Vercel 프론트 도메인 |
| `SOMA_PORTAL_BASE_URL` | `https://www.swmaestro.ai` | SOMA 포털 기준 URL |
| `SOMA_PORTAL_OPERATOR_USERNAME` | `********` | 읽기 전용 포털 조회용 운영자 SOMA 계정 |
| `SOMA_PORTAL_OPERATOR_PASSWORD` | `********` | 읽기 전용 포털 조회용 운영자 SOMA 비밀번호 |
| `SOMA_PORTAL_CACHE_TTL_MINUTES` | `30` | 공지/멘토링 DB 캐시 재동기화 주기 |
| `SOMA_PORTAL_SYNC_PAGE_LIMIT` | `60` | 한 번에 동기화할 포털 목록 최대 페이지 수 |
| `OPENAI_API_KEY` | `sk-...` | 멘토링/특강 AI 요약 생성용 OpenAI API 키 |
| `OPENAI_SUMMARY_MODEL` | `gpt-5.4-mini` | AI 요약 모델. 비우면 기본값 사용 |

Railway Postgres의 기본 `DATABASE_URL`은 `postgresql://...` 형식일 수 있다. 백엔드는 시작 시 이 값을 `jdbc:postgresql://...`로 자동 변환하지만, 운영에서 명시성을 높이려면 `DATABASE_JDBC_URL`을 따로 등록한다.
백엔드와 Postgres가 같은 Railway 프로젝트에 있으면 공개 DB 도메인 대신 `postgres-db.railway.internal` private DNS를 사용한다.
운영자 SOMA 계정은 사용자별 신청/취소가 아니라 공지와 멘토링 조회용으로만 사용한다.
공지/멘토링은 DB에 저장한 뒤 TTL이 지났을 때만 재동기화해서 포털 요청량을 줄인다.
OpenAI 키는 운영 환경변수에만 등록하고 `.env`, 문서, PR 본문에 원문을 남기지 않는다.

## 최초 구축 체크리스트

1. Vercel에서 `swm-moss/SomaBiseo`를 import하고 root directory를 `frontend`로 지정한다.
2. Railway에서 백엔드 서비스와 Postgres 서비스를 만든다.
3. Railway 백엔드 서비스에 공개 도메인을 붙인다.
4. Railway 백엔드 환경변수에 DB, CORS, SOMA 포털 값을 등록한다.
5. Vercel 환경변수 `NEXT_PUBLIC_API_BASE_URL`에 Railway 백엔드 도메인 + `/api`를 등록한다.
6. GitHub secrets와 variables를 등록한다.
7. `main`에 병합한 뒤 `CI`, `Deploy Production` 워크플로우가 차례로 성공하는지 확인한다.

## 참고 문서

- [Vercel CLI deploy](https://vercel.com/docs/cli/deploy)
- [Vercel GitHub Actions 배포](https://vercel.com/docs/deployments/git/vercel-for-github)
- [Railway CLI](https://docs.railway.com/guides/cli)
- [Railway Config as Code](https://docs.railway.com/reference/config-as-code)
- [Railway Healthchecks](https://docs.railway.com/reference/healthchecks)
