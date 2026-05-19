# Conversation Notes

이 문서는 SomaBiseo를 같이 만들며 결정한 제품, 기술, 인프라 맥락을 에이전트가 이어받기 위한 기록이다.

## 제품 방향

- SomaBiseo는 소프트웨어마에스트로 연수생을 위한 비공식 일정, 공지, 멘토링 비서다.
- 공식 소마 앱처럼 보이지 않게 표현한다.
- 사용자에게 SOMA 포털 아이디/비밀번호를 입력받지 않는다.
- 서버가 사용자별 SOMA 포털 세션 쿠키를 보관하는 구조로 만들지 않는다.
- 읽기 전용 데이터 조회는 운영자 계정 환경변수로 서버에서 수행한다.
- 신청/취소 기능 제거는 별도 팀원 작업으로 진행 중이므로 이 흐름을 수정하는 작업과 섞지 않는다.
- 초기 핵심 가치는 공지, 멘토특강, 자유멘토링을 한곳에서 보기 좋게 정리하는 것이다.
- 종료된 멘토특강/자유멘토링은 sourceId 단위로 후기를 모은다. 별점 없음, 본문 20~500자, 작성자는 신청자 명단에서 이름 선택. 종료 후 3일 이내만 작성 가능. 수정/삭제는 MVP에서 미지원.
- 신청자 명단은 백엔드 스케줄러가 운영자 세션(`SOMA_PORTAL_OPERATOR_*`)으로 종료 임박 시 1회 스냅샷해 `event_applicants`에 동결한다.

## 프론트 상태 관리와 캐싱

- 서버 상태는 TanStack Query, 클라이언트 로컬 상태는 Zustand를 사용한다.
- TanStack Query 대상은 공지 목록, 공지 상세, 일정 목록, 일정 상세, 대시보드, 캘린더 충돌 조회처럼 API에서 가져오는 데이터다.
- QueryClient 기본 정책은 `frontend/src/shared/api/query-client.ts`에 둔다.
- 현재 서버 상태 캐싱 정책은 `staleTime: 60초`, `gcTime: 5분`, `refetchOnWindowFocus: false`, query retry 1회다.
- query key에는 페이지, 필터, 상세 ID처럼 응답을 바꾸는 값을 반드시 포함한다.
- SOMA 포털 공지와 멘토링 목록은 `pageIndex` 기반 다중 페이지 목록이므로 React Query query key에 `page`를 포함해 페이지 단위 캐싱한다.
- 목록 화면은 무한 스크롤보다 1, 2, 3 번호 페이지네이션을 우선 사용해서 현재 위치와 이동 가능한 페이지를 명확히 보여준다.
- 멘토링/특강 AI 요약은 상세 본문을 기준으로 백엔드에서 `contentHash`를 계산하고, 같은 `sourceId + contentHash`가 있으면 DB 캐시를 반환한다.
- AI 요약은 상세 조회와 분리된 `POST /api/soma/events/summary`에서 생성한다. 프론트는 TanStack Query의 `event-ai-summary` key로 읽고, 백엔드 캐시가 비용 중복을 막는다.
- 서버에 쓰기 API가 붙는 기능은 mutation 성공 후 관련 query key를 invalidate한다.
- Zustand는 앱 로컬 로그인 세션, 북마크, 읽음, 관심 저장, Google Calendar 연결 mock 상태처럼 브라우저에 보관하는 클라이언트 상태에만 쓴다.
- 관심사 설정은 `somabiseo-interest-preferences` 로컬 Zustand persist에 저장하고, 대시보드 추천 특강과 일정 목록 추천 강조에 사용한다.
- 관심사가 비어 있으면 AppShell에서 관심사 온보딩 모달을 보여준다. 사용자가 현재 브라우저 세션에서 나중에 하기를 누르면 `sessionStorage`로 재노출을 막는다.
- 관심사 기반 추천은 초기에는 AI 호출 없이 제목, 주제, 장소, 본문, rawText 키워드 매칭으로 점수화한다.
- 백엔드 영속 저장이 붙으면 Zustand에만 있는 상태를 서버 mutation과 React Query 캐시 갱신 흐름으로 옮긴다.

## 프론트 구현 규칙

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui 계열 컴포넌트를 기준으로 한다.
- 이 프로젝트의 Next.js 문서는 `frontend/node_modules/next/dist/docs/`에서 확인한 뒤 구현한다.
- FSD 레이어는 `app`, `views`, `widgets`, `features`, `entities`, `shared`를 사용한다.
- Next의 Pages Router 예약 폴더와 충돌하지 않도록 페이지 조립 레이어 이름은 `pages`가 아니라 `views`다.
- 카드 남발 금지, 섹션당 역할 1개만, 필러 카피 금지.
- 모바일 퍼스트로 만들되 데스크톱에서도 헤더와 상세 화면이 깨지지 않아야 한다.

## 인프라와 배포

- 프론트엔드는 Vercel, 백엔드는 Railway에 분리 배포한다.
- 프로덕션 프론트 URL은 `https://somabiseo.vercel.app`이다.
- 프로덕션 백엔드 health URL은 `https://backend-production-76bf.up.railway.app/api/health`이다.
- Railway 프로젝트 이름은 `SomaBiseo`이며 백엔드 서비스는 `backend`, 데이터베이스 서비스는 `postgres-db`다.
- Railway 백엔드는 Dockerfile 기반으로 배포하고 `/api/health`를 healthcheck로 사용한다.
- Railway Postgres는 private network를 사용하며 JDBC 접속 문자열은 `DATABASE_JDBC_URL`로 제공한다.
- 프론트는 `NEXT_PUBLIC_API_BASE_URL`로 Railway 백엔드 공개 도메인 + `/api`를 바라본다.
- 백엔드는 `CORS_ALLOWED_ORIGINS`에 Vercel 프론트 도메인을 등록한다.
- 백엔드의 SOMA 읽기 전용 어댑터는 `SOMA_PORTAL_OPERATOR_USERNAME`, `SOMA_PORTAL_OPERATOR_PASSWORD` 환경변수로 로그인한다. 이 값은 코드, 문서, PR 본문에 노출하지 않는다.
- 백엔드 AI 요약 기능은 `OPENAI_API_KEY`가 있을 때만 동작한다. 키는 코드나 커밋에 저장하지 않고 Railway 환경변수로만 설정한다.
- AI 요약 모델은 기본 `gpt-5.4-mini`이며, 필요하면 `OPENAI_SUMMARY_MODEL`로 교체한다.
- GitHub Actions의 `CI`는 PR과 `main` push에서 실행한다.
- `main`의 `CI`가 성공하면 `Deploy Production` 워크플로우가 Vercel과 Railway 배포를 실행한다.
- 배포 관련 세부 사항은 `docs/deployment/production.md`를 최신 상태로 유지한다.

## 현재 작업 흐름

- 기능 수정은 별도 브랜치에서 진행하고 GitHub Issue와 PR을 만든다.
- 커밋 메시지는 `docs/conventions/commit-message.md`를 따른다.
- 작업 완료 전 `npm --prefix frontend run lint`, `npm --prefix frontend run build`, 필요한 백엔드 테스트를 실행한다.
