# EZ AIR API

## 공통 에러 형식

```json
{
  "error": "VALIDATION_ERROR",
  "message": "요청 값이 올바르지 않습니다.",
  "issues": []
}
```

## GET /api/health

서버 상태 확인용입니다.

Response:

```json
{
  "ok": true,
  "service": "ezair-api",
  "timestamp": "2026-05-05T15:06:04.626Z"
}
```

## GET /api/search-locations?keyword=Seoul

Amadeus location search를 프록시합니다.

Request:

```http
GET /api/search-locations?keyword=Seoul
```

Error:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "keyword는 최소 2글자 이상이어야 합니다."
}
```

## POST /api/search-flights

폼 기반 항공권 검색입니다.

Request:

```json
{
  "origin": "ICN",
  "destination": "JFK",
  "departDate": "2026-07-01",
  "returnDate": "2026-07-10",
  "adults": 1,
  "travelClass": "ECONOMY",
  "nonStop": false
}
```

Response는 Amadeus 원본 응답에 가깝습니다. 프론트에서는 필요한 필드를 정규화해 표시합니다.

## GET /api/gemini-health

AI 검색 모드 확인용입니다.

```json
{
  "ok": true,
  "service": "gemini",
  "mode": "mock"
}
```

## POST /api/ai/flight-search

자연어 항공권 검색입니다.

Request:

```json
{
  "query": "다음주 금요일 서울에서 제주도 직항 2명"
}
```

Mock/Results Response:

```json
{
  "mode": "MOCK",
  "aiInsight": "서울(김포) → 제주 항공편 3개를 찾았습니다.",
  "intent": {
    "originIata": "GMP",
    "destinationIata": "CJU",
    "departDate": "2026-05-19",
    "adults": 1,
    "travelClass": "ECONOMY",
    "nonStop": false
  },
  "flights": [],
  "followUpActions": [
    "더 저렴한 날짜 찾아줘",
    "직항만 보여줘",
    "하루 전후로 비교해줘"
  ],
  "cached": false
}
```

Clarification Response:

```json
{
  "mode": "CLARIFICATION",
  "question": "출발 공항을 선택해 주세요.",
  "candidates": [
    { "iataCode": "ICN", "name": "Incheon International Airport" },
    { "iataCode": "GMP", "name": "Gimpo International Airport" }
  ],
  "flights": [],
  "followUpActions": []
}
```

## 구현 예정 Endpoint

| Method | Path | 상태 |
|---|---|---|
| GET | `/api/searches/:id` | DB 도입 후 |
| POST | `/api/feedback` | Next.js scaffold에 포함 |
| GET | `/api/recommendations` | 추천 고도화 후 |
