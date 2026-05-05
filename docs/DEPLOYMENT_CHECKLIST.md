# EZ AIR Deployment Checklist

## 1. 공통 보안

- [ ] 노출된 Gemini/Amadeus 키 폐기 및 재발급.
- [ ] `.env`가 Git에 포함되지 않는지 확인.
- [ ] `.env.example`에는 빈 값만 유지.
- [ ] CORS origin을 실제 프론트 도메인으로 제한.
- [ ] `/api/ai/*` rate limit 확인.
- [ ] HTTPS 배포 확인.
- [ ] `npm run security:scan` 통과.

## 2. Vanilla + Express 배포

Frontend:

- [ ] Vercel/Netlify/GitHub Pages 중 하나에 정적 배포.
- [ ] `window.EZAIR_API_BASE_URL` 또는 config가 API 서버를 가리키는지 확인.

Backend:

- [ ] Render/Railway/Fly.io 등에 `backend` 배포.
- [ ] `PORT`, `CORS_ORIGIN`, `AI_SEARCH_MODE` 설정.
- [ ] `AMADEUS_API_KEY`, `AMADEUS_API_SECRET`, `GEMINI_API_KEY`는 서버 환경변수로만 설정.

## 3. Vite + Express 배포

- [ ] `npm run build:vite` 성공.
- [ ] `/api` proxy는 개발용이며, 운영에서는 실제 API base URL을 설정.
- [ ] `VITE_API_BASE_URL`에는 public URL만 넣고 secret 금지.

## 4. Next.js 배포

- [ ] `next-ezair`에서 `npm run build` 성공.
- [ ] Vercel 환경변수에 서버 secret 등록.
- [ ] `NEXT_PUBLIC_`에 secret이 없는지 검사.
- [ ] Route Handler 응답 확인.

## 5. DB

- [ ] Supabase/Neon/Postgres 선택.
- [ ] migration 적용 전 백업.
- [ ] `api_cache.expires_at` index 확인.
- [ ] feedback/comment 개인정보 저장 정책 확인.

## 6. 모니터링

- [ ] Sentry 또는 provider log 연결.
- [ ] Gemini token/cost 모니터링.
- [ ] Amadeus API error rate 모니터링.
- [ ] 429 rate-limit 발생 추적.

## 7. 배포 전 명령

```bash
cd backend
npm run check
npm run smoke
npm run security:scan
cd ..

npm run build:vite
npm test

cd next-ezair
npm run build
```
