# EZ AIR Architecture

이 문서는 현재 구현과 향후 로드맵을 분리해 설명합니다.

## 1. 현재 구현

```text
Browser
  ├─ index.html
  ├─ script/config.js
  ├─ script/amadeus_search.js
  └─ script/gemini_search.js
        ↓ fetch
Express API
  ├─ backend/server.js
  ├─ backend/routes/amadeus.js
  ├─ backend/routes/gemini.js
  └─ backend/services/*
        ↓
External Providers
  ├─ Amadeus Test API
  └─ Gemini API, AI_SEARCH_MODE=real only
```

### Frontend

- 정적 HTML/CSS/Vanilla JS 기반입니다.
- `script/config.js`는 클라이언트 공개 설정만 제공합니다.
- `script/amadeus_search.js`는 위치 자동완성과 폼 기반 항공권 검색을 호출합니다.
- `script/gemini_search.js`는 서버의 `/api/ai/flight-search`만 호출합니다.

### Backend

- `backend/server.js`: Express app, CORS, Helmet, rate limit, health check.
- `routes/amadeus.js`: `/api/search-locations`, `/api/search-flights`.
- `routes/gemini.js`: `/api/gemini-health`, `/api/ai/flight-search`.
- `services/amadeusService.js`: Amadeus token, location, flight search.
- `services/geminiService.js`: Gemini REST 호출과 structured output 파싱.
- `services/locationResolver.js`: 도시/공항명 ambiguity 해결.
- `services/flightNormalizer.js`: Amadeus 응답을 프론트 공통 flight 형태로 변환.
- `services/mockFlightService.js`: mock mode 데모 응답.
- `services/cacheService.js`: TTL 메모리 캐시.

## 2. 보안 원칙

- 모든 secret은 서버 환경변수에서만 읽습니다.
- HTML, JS bundle, `VITE_`, `NEXT_PUBLIC_`에는 secret을 넣지 않습니다.
- CORS는 허용 origin 목록으로 제한합니다.
- AI 검색 endpoint에는 rate limit을 적용합니다.
- 에러 응답에는 provider token, key, stack trace를 포함하지 않습니다.

## 3. AI 항공권 검색 흐름

```text
User query
  ↓
POST /api/ai/flight-search
  ↓
AI_SEARCH_MODE 확인
  ├─ mock: mockFlightService 응답
  └─ real:
       1. Gemini structured output으로 intent 추출
       2. Zod schema로 normalize/validate
       3. locationResolver로 IATA 확정
       4. cache key 확인
       5. Amadeus searchFlights 호출
       6. flightNormalizer로 정규화
       7. follow-up action과 함께 반환
```

## 4. 캐싱 정책

| 대상 | 저장소 | TTL | 비고 |
|---|---|---:|---|
| Amadeus access token | process memory | provider expires_in - 60초 | secret 출력 금지 |
| location search | memory cache | 7일 | 도시/공항 정보는 저변동 |
| flight search | memory cache | 5분 | 가격/좌석은 고변동 |
| AI intent | 제안 | 1시간 이하 | 상대 날짜가 포함되면 짧게 |

## 5. Vite/TypeScript 로드맵

현재 정적 UI를 유지하면서 `src` 아래에 타입, API client, 순수 함수 테스트를 병렬로 추가합니다.

- `src/types/*`: API 계약 타입.
- `src/api/*`: fetch client.
- `src/features/flightSearch/*`: IATA 추출, validation, formatting.
- Vitest로 순수 함수 단위 테스트.

## 6. Next.js 로드맵

`next-ezair` 폴더에 App Router 기반 풀스택 앱을 병렬 scaffold로 둡니다.

- Route Handler에서 Gemini/Amadeus 호출.
- `lib/*`에 서버 전용 로직 분리.
- `components/*`에 검색 UI 분리.
- Vercel 배포 시 환경변수는 서버 전용으로 관리.

## 7. DB/AI 추천 로드맵

- PostgreSQL schema: users, airports, search_requests, flight_offer_snapshots, api_cache, feedback.
- repository interface를 먼저 만들고 memory 구현으로 개발.
- 이후 Prisma 또는 Drizzle로 교체.
- deterministic ranking으로 가격/소요시간/경유/출장 목적을 반영.
