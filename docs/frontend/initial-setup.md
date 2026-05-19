# Frontend Initial Setup

이 문서는 SomaBiseo 프론트엔드 초기 세팅 기준과 주요 파일 위치를 정리한다.

## 기술 스택

| 영역 | 선택 |
| --- | --- |
| Framework | Next.js App Router 16.2.6 |
| Language | TypeScript |
| Styling | Tailwind CSS 4, shadcn 계열 유틸리티, Pretendard |
| Server state | TanStack Query |
| Client local state | Zustand persist |
| Forms | React Hook Form, Zod |
| HTTP client | ky |
| Icons | lucide-react |
| Toast | sonner |

프론트 구현 전에는 `frontend/node_modules/next/dist/docs/`의 관련 문서를 먼저 확인한다. 현재 프로젝트는 Next Pages Router의 예약 폴더와 충돌하지 않도록 FSD의 page composition 레이어를 `pages`가 아니라 `views`로 둔다.

## 실행 명령

```bash
npm --prefix frontend run dev
npm --prefix frontend run lint
npm --prefix frontend run build
```

로컬 API 기본 주소는 `http://localhost:8080/api`다. 배포 환경에서는 `NEXT_PUBLIC_API_BASE_URL`로 Railway 백엔드 주소를 주입한다.

## 라우팅 구조

```txt
frontend/src/app
├─ layout.tsx
├─ providers.tsx
├─ globals.css
├─ page.tsx
├─ (auth)/login/page.tsx
└─ (main)
   ├─ dashboard/page.tsx
   ├─ notices/page.tsx
   ├─ events/page.tsx
   └─ settings/page.tsx
```

라우트 상수는 `frontend/src/shared/config/routes.ts`에 모아 둔다.

## FSD 레이어

```txt
frontend/src
├─ app       Next App Router, provider, global css
├─ views     페이지 조립 레이어
├─ widgets   여러 feature/entity를 묶은 화면 블록
├─ features  사용자 액션 단위
├─ entities  도메인 모델과 API adapter
└─ shared    도메인을 모르는 공용 코드
```

주요 규칙:

- `shared`에는 도메인 로직을 넣지 않는다.
- `features`는 로그인, 북마크, 관심 저장처럼 사용자가 수행하는 액션 단위로 둔다.
- `entities`는 notice, soma-event, calendar처럼 도메인 모델 단위로 둔다.
- `views`는 라우트 페이지가 사용할 화면 조립만 담당한다.

## App Provider

`frontend/src/app/layout.tsx`는 HTML 언어, metadata, 전역 provider 연결만 담당한다.

`frontend/src/app/providers.tsx`는 클라이언트 provider를 모은다.

- `QueryClientProvider`
- `sonner` Toaster

TanStack Query 기본 설정은 `frontend/src/shared/api/query-client.ts`에 있다.

```txt
staleTime: 60초
gcTime: 5분
refetchOnWindowFocus: false
query retry: 1회
mutation retry: 0회
```

## API Client

`frontend/src/shared/api/client.ts`에서 ky 기반 `apiClient`를 만든다.

- `prefix`: `NEXT_PUBLIC_API_BASE_URL` 또는 `http://localhost:8080/api`
- `credentials`: `include`
- `throwHttpErrors`: `false`
- `timeout`: 10초

백엔드는 모든 일반 API를 `ApiResponse<T>` 형태로 반환하므로 프론트에서는 `unwrapApiResponse`로 성공 여부를 확인한다.

## 디자인 시스템 기초

전역 스타일은 `frontend/src/app/globals.css`에 있다.

- Pretendard Variable import
- Toss 계열에 가까운 색상 토큰
- 모바일 퍼스트 페이지 폭
- 공용 클래스: `sb-page`, `sb-section`, `sb-list-surface`, `sb-list-row`, `sb-field`

공용 UI는 `frontend/src/shared/ui`에 둔다.

```txt
button.tsx
empty-state.tsx
error-state.tsx
loading-state.tsx
page-header.tsx
segment-control.tsx
status-badge.tsx
```

앱 공통 레이아웃은 `frontend/src/widgets/app-shell/ui.tsx`가 담당한다.

- 상단 헤더
- 비공식 서비스 고지
- 모바일 하단 내비게이션
- 로그인 세션 상태 표시

모바일 하단 내비게이션은 `frontend/src/widgets/bottom-navigation/ui.tsx`에 있다.

## 브랜드 에셋

서비스 로고와 아이콘은 `frontend/public/brand`에 둔다.

- 큰 로고: `somabiseo-logo.png`
- 작은 아이콘: `somabiseo-icon-64.png`

Next app icon 파일은 `frontend/src/app/icon.png`, `frontend/src/app/apple-icon.png`, `frontend/src/app/favicon.ico`로 연결되어 있다.

## 상태 관리 기준

서버 상태는 TanStack Query로 관리한다.

- 공지 목록
- 공지 상세
- 멘토특강/자유멘토링 목록
- 멘토링 상세
- 대시보드 데이터
- 캘린더 충돌 조회

브라우저에만 필요한 로컬 상태는 Zustand persist로 관리한다.

- SOMA 포털 임시 세션
- 공지 읽음 상태
- 공지 북마크
- 일정 관심 저장
- Google Calendar mock 연결 상태

백엔드 영속 저장이 붙으면 해당 액션은 mutation으로 옮기고 성공 시 관련 query key를 invalidate한다.
