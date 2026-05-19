# SomaBiseo Agent Rules

SomaBiseo는 소프트웨어마에스트로 연수생을 위한 비공식 일정, 공지, 멘토링 비서입니다.

## 절대 하지 않을 것

1. 공식 소마 앱처럼 보이는 문구를 쓰지 않습니다.
2. SOMA 포털 비밀번호를 저장하지 않습니다.
3. 특강 신청, 취소, 자유멘토링 신청을 자동 대행하지 않습니다.
4. 무단 대량 크롤링을 만들지 않습니다.
5. 공식 로고를 무단으로 쓰지 않습니다.
6. 후기, 랭킹, 추천 알고리즘을 MVP 1차에 넣지 않습니다.

## 프론트 규칙

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui 계열 컴포넌트를 사용합니다.
- 이 프로젝트의 Next.js는 훈련 데이터와 다를 수 있습니다. `frontend/node_modules/next/dist/docs/`에서 관련 문서를 먼저 읽고 구현합니다.
- FSD 레이어를 따릅니다. Next의 `src/pages` 예약 폴더와 충돌하지 않도록 페이지 조립 레이어 이름은 `src/views`를 씁니다.
- `app`에는 라우팅, provider, 전역 스타일만 둡니다.
- `widgets`는 화면 블록, `features`는 사용자 액션, `entities`는 도메인 모델, `shared`는 도메인을 모르는 공용 코드만 둡니다.
- 카드 남발 금지, 섹션당 역할 1개만, 필러 카피 금지.
- 모바일 퍼스트로 만듭니다.
- 로딩, 에러, 빈 상태를 구현합니다.

## 백엔드 규칙

- Java 21, Spring Boot 3.x, Spring Web, Spring Security, Spring Data JPA, PostgreSQL, Flyway를 기준으로 합니다.
- API 응답 형식은 `ApiResponse<T>`를 기본으로 쓰되, `/api/health`는 `{ "status": "ok" }`를 반환합니다.
- 기본 데이터 동기화는 `SomaSourceClient` 인터페이스와 mock/manual import 구현부터 사용합니다.
- 사용자가 명시적으로 요청한 SOMA 포털 읽기 전용 API는 `domain/portal`에 격리합니다. 포털 비밀번호를 저장하지 않고, 임시 세션 쿠키만 메모리 TTL로 보관합니다.
- Google Calendar OAuth, FreeBusy, 이벤트 생성은 백엔드에서 다루되 초기 구현은 mock으로 시작합니다.

## 배포 규칙

- 프론트엔드는 Vercel, 백엔드는 Railway로 배포합니다.
- `main`으로 병합되면 GitHub Actions의 CI가 먼저 통과해야 프로덕션 배포 워크플로우가 실행됩니다.
- 배포 설정, 시크릿, 환경변수를 바꾸면 [프로덕션 배포 문서](docs/deployment/production.md)를 함께 갱신합니다.
- Railway 백엔드는 `PORT` 환경변수를 우선 지원해야 하며, healthcheck는 `/api/health`를 사용합니다.

## 커밋 규칙

- 커밋을 만들 때는 [커밋 메시지 컨벤션](docs/conventions/commit-message.md)을 반드시 따릅니다.
- 커밋 유형은 영어 소문자로 작성합니다.
- 커밋 제목과 본문은 한글로 작성합니다.
- 제목과 본문은 빈 행으로 분리합니다.
- 본문에는 무엇을 왜 바꿨는지 적고, 여러 항목은 글머리 기호를 사용합니다.

## 완료 보고

작업 완료 후 변경 파일, 확인 방법, 남은 위험을 짧게 요약합니다.
