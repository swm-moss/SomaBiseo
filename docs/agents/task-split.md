# Agent Task Split

## Frontend Foundation Agent

- Owns `frontend/src/app`, `frontend/src/shared`, `frontend/src/widgets/app-shell`, `frontend/src/widgets/bottom-navigation`.
- Keep UI mobile first.
- Keep shared free of domain logic.

## Dashboard Frontend Agent

- Owns `frontend/src/views/dashboard` and `frontend/src/widgets/dashboard-summary`.
- Use mock API until backend integration starts.

## Notice Frontend Agent

- Owns `frontend/src/entities/notice`, `frontend/src/widgets/notice-list`, `frontend/src/features/bookmark-notice`, `frontend/src/features/mark-notice-read`, `frontend/src/views/notice-detail`.

## Event Frontend Agent

- Owns `frontend/src/entities/soma-event`, `frontend/src/widgets/event-list`, `frontend/src/widgets/upcoming-event-card`, `frontend/src/features/favorite-event`, `frontend/src/views/event-detail`.

## Calendar Frontend Agent

- Owns `frontend/src/entities/calendar`, `frontend/src/features/connect-google-calendar`, `frontend/src/features/check-calendar-conflict`, `frontend/src/features/add-event-to-calendar`.

## Backend Foundation Agent

- Owns `backend/src/main/java/com/somabiseo/global` and health API.

## Domain Backend Agents

- Notice Agent owns `backend/src/main/java/com/somabiseo/domain/notice`.
- Event Agent owns `backend/src/main/java/com/somabiseo/domain/somaevent`.
- Calendar Agent owns `backend/src/main/java/com/somabiseo/domain/calendar`.
- Source Adapter Agent owns `backend/src/main/java/com/somabiseo/domain/source`.
