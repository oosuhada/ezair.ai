# AI Flight Search Golden Set

| # | 입력 | 기대 origin | 기대 destination | tripType | 날짜 처리 | clarification | 비고 |
|---:|---|---|---|---|---|---|---|
| 1 | 내일 제주도 가는 제일 싼 항공권 | GMP 또는 ICN | CJU | ONE_WAY | 오늘 기준 내일 | 출발 공항 모호하면 필요 | 서울 기본값 정책 필요 |
| 2 | 다음주 금요일 서울에서 오사카 직항 2명 | ICN 또는 GMP | KIX | ONE_WAY | 다음 주 금요일 | 서울 공항 선택 필요 가능 | nonStop true, adults 2 |
| 3 | 출장이라 아침에 도착하는 도쿄 항공편 | ICN 또는 GMP | HND 또는 NRT | ONE_WAY | 날짜 누락 시 필요 | 필요 | purpose BUSINESS |
| 4 | 김포 말고 인천에서 제주도 | ICN | CJU | ONE_WAY | 날짜 누락 시 필요 | 날짜 필요 | negative preference 반영 |
| 5 | 부산에서 제주 왕복 3명 | PUS | CJU | ROUND_TRIP | 날짜 누락 시 필요 | 날짜 필요 | adults 3 |
| 6 | 7월 15일 뉴욕 가는 비즈니스석 | ICN | JFK | ONE_WAY | 7월 15일 | 출발지 필요 가능 | travelClass BUSINESS |
| 7 | 이번 주말 아무 데나 싸게 갈 수 있는 곳 | 사용자 기본 공항 | 미정 | ONE_WAY | 이번 주말 | 필요 | 추천/탐색 모드 필요 |
| 8 | 서울에서 파리, 예산 100만원 이하 | ICN | CDG | ONE_WAY | 날짜 누락 시 필요 | 날짜 필요 | budgetMax 1000000 |

## 자동화 전환 기준

- Gemini structured output이 schema validation을 통과해야 합니다.
- 날짜는 테스트 실행일에 따라 달라질 수 있으므로 fixture 기준일을 고정해야 합니다.
- ambiguity가 있는 도시명은 clarification 또는 명시적 기본값 중 하나로 일관되게 처리해야 합니다.
