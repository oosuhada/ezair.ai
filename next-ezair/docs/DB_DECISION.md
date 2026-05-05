# DB ORM Decision

## 현재 단계

현재는 SQL schema와 memory repository만 둡니다. 실제 DB 연결은 서비스 요구사항이 확정된 뒤 진행합니다.

## Prisma

장점:

- 빠른 생산성.
- migration과 schema 관리가 쉽습니다.
- 포트폴리오에서 이해하기 쉽습니다.

단점:

- edge runtime과 조합 시 제약이 있을 수 있습니다.
- SQL 세부 제어가 Drizzle보다 간접적입니다.

## Drizzle

장점:

- SQL에 가까운 타입 안전 쿼리.
- edge/serverless 친화적 선택지가 많습니다.
- 복잡한 쿼리 최적화에 유리합니다.

단점:

- 초심자에게 Prisma보다 러닝커브가 있습니다.
- migration 운영 방식을 별도로 정해야 합니다.

## 추천

- 빠른 포트폴리오 완성: Prisma.
- SQL 제어와 edge 배포 중시: Drizzle.

EZ AIR는 우선 Prisma로 검색 기록/피드백을 붙인 뒤, 필요하면 Drizzle로 전환해도 됩니다.
