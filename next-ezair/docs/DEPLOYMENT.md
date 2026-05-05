# Next EZ AIR Deployment

## 로컬 실행

```bash
cd next-ezair
npm install
cp .env.example .env.local
npm run dev
```

## 환경변수

서버 전용:

```bash
AMADEUS_API_KEY=
AMADEUS_API_SECRET=
GEMINI_API_KEY=
AI_SEARCH_MODE=mock
AMADEUS_BASE_URL=https://test.api.amadeus.com
```

`NEXT_PUBLIC_`에는 secret을 넣지 않습니다.

## Vercel 배포

1. `next-ezair` 폴더를 Root Directory로 설정합니다.
2. Environment Variables에 서버 secret을 등록합니다.
3. `AI_SEARCH_MODE=mock`으로 먼저 배포 검증 후 real로 전환합니다.
4. `/api/health`, `/api/ai/flight-search`를 확인합니다.

## Amadeus test/prod 전환

- test: `https://test.api.amadeus.com`
- production 전환은 Amadeus production API 승인 후 진행합니다.
- production secret은 별도 키로 관리합니다.
