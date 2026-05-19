<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## FSD Mapping

- `src/app`: App Router files, providers, global CSS only.
- `src/views`: page composition layer. Do not use `src/pages` because Next treats it as Pages Router.
- `src/widgets`: screen blocks.
- `src/features`: user actions.
- `src/entities`: domain model and mock API.
- `src/shared`: domain-agnostic utilities and UI.

## State

- Use TanStack Query for server state, API loading/error states, and response caching.
- Keep QueryClient defaults in `src/shared/api/query-client.ts`.
- Include session ID, filters, and detail IDs in query keys when they affect the response.
- Use Zustand only for client-local persisted state such as the temporary portal session and local toggles.

## Design Rules

프론트 개발시 “카드 남발 금지”, “섹션당 역할 1개만”, “필러 카피 금지”.
