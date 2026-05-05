# EZ AIR

EZ AIR는 정적 HTML/CSS/Vanilla JS 프론트엔드와 Express API 서버를 기반으로 한 AI 항공권 검색 데모 프로젝트입니다. 현재 안정화 버전은 브라우저에서 Gemini 또는 Amadeus secret을 직접 사용하지 않고, 백엔드 API를 통해 자연어 검색과 항공권 검색을 처리하는 구조를 목표로 합니다.

## 현재 구조

```text
Browser
  ├─ index.html
  ├─ script/amadeus_search.js
  ├─ script/gemini_search.js
  └─ script/config.js
        ↓
Express API backend
  ├─ GET  /api/health
  ├─ GET  /api/search-locations
  ├─ POST /api/search-flights
  ├─ GET  /api/gemini-health
  └─ POST /api/ai/flight-search
        ↓
External APIs
  ├─ Amadeus Test API
  └─ Gemini API, real mode only
```

## 보안 원칙

- `GEMINI_API_KEY`, `AMADEUS_API_KEY`, `AMADEUS_API_SECRET`은 서버 `.env`에만 둡니다.
- 프론트엔드 코드, HTML, `VITE_`, `NEXT_PUBLIC_` 환경변수에는 secret을 넣지 않습니다.
- 이전에 브라우저에 노출된 API 키는 유출된 것으로 간주하고 폐기/재발급해야 합니다.
- `.env`는 Git에 커밋하지 않습니다. `.env.example`에는 빈 값만 둡니다.

## 설치

```bash
cd backend
npm install
```

## 환경변수

루트 또는 `backend`의 `.env.example`을 참고해 `backend/.env`를 만듭니다.

```bash
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500,http://localhost:5173
AMADEUS_API_KEY=
AMADEUS_API_SECRET=
GEMINI_API_KEY=
AI_SEARCH_MODE=mock
AMADEUS_BASE_URL=https://test.api.amadeus.com
```

`AI_SEARCH_MODE=mock`이면 Gemini/Amadeus를 호출하지 않고 데모 데이터를 반환합니다. `real`로 바꾸면 서버에서 Gemini intent 추출 후 Amadeus 검색을 시도합니다.

## 실행

백엔드:

```bash
cd backend
npm run dev
```

프론트엔드:

```bash
# 예: VS Code Live Server 또는 정적 서버 사용
npx serve . -l 5500
```

## 검증

```bash
cd backend
npm run check
npm run smoke
npm run security:scan
```

mock API 확인:

```bash
PORT=3300 AI_SEARCH_MODE=mock npm start
curl -sS http://localhost:3300/api/health
curl -sS http://localhost:3300/api/gemini-health
curl -sS -X POST http://localhost:3300/api/ai/flight-search \
  -H "Content-Type: application/json" \
  -d '{"query":"다음주 금요일 서울에서 제주도 직항 2명"}'
```

## 주요 API

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/search-locations?keyword=Seoul` | 공항/도시 자동완성 |
| POST | `/api/search-flights` | 폼 기반 항공권 검색 |
| GET | `/api/gemini-health` | AI 검색 모드 확인 |
| POST | `/api/ai/flight-search` | 자연어 항공권 검색 |

## 데모 문장

- `다음주 금요일 서울에서 제주도 직항 2명`
- `서울에서 뉴욕 가는 가장 저렴한 항공권`
- `서울에서 오사카 직항 찾아줘`
- `부산에서 제주 왕복 항공권`

## 로드맵

1. 현재 Vanilla JS + Express 데모 안정화
2. Vite/TypeScript 병렬 scaffold로 타입 안정성 확보
3. Next.js App Router 풀스택 마이그레이션
4. DB 검색 기록, 캐시, 피드백, 추천 랭킹 고도화
