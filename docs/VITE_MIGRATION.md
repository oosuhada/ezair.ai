# Vite/TypeScript Migration

## 목적

현재 정적 HTML/Vanilla JS 구조를 한 번에 교체하지 않고, 타입 안정성과 테스트 가능한 순수 함수를 먼저 도입합니다.

## 현재 추가된 구조

```text
src/
  api/
    client.ts
    flights.ts
    ai.ts
  features/flightSearch/
    iata.ts
    validation.ts
    format.ts
    index.ts
    flightSearch.test.ts
  types/
    api.ts
    ai.ts
    flight.ts
```

## 환경변수 원칙

- `VITE_API_BASE_URL`에는 public API base URL만 넣습니다.
- `GEMINI_API_KEY`, `AMADEUS_API_SECRET`은 Vite 환경변수에 넣지 않습니다.
- 개발 중 `/api`는 Vite proxy로 Express backend에 연결합니다.

## 다음 작업

- DOM 조작 로직을 작은 TS 모듈로 점진 이전.
- `innerHTML` 렌더링을 DOM 생성 또는 컴포넌트 방식으로 교체.
- Playwright로 실제 브라우저 E2E 추가.
- 디자인 시스템 또는 React 전환 여부 결정.
