# Backend Agent Rules

- Use Java 21 and Spring Boot 3.x.
- Keep package boundaries under `com.somabiseo.global` and `com.somabiseo.domain`.
- Do not store SOMA portal passwords.
- Do not implement application/cancellation automation in MVP 1차.
- Use `SomaSourceClient` for external SOMA data. Start with mock or manual import implementations.
- Keep Google Calendar writes idempotent. Do not create duplicate calendar events for the same SomaEvent.
