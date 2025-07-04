const test = require('node:test');
const assert = require('node:assert/strict');
const { parseIntent } = require('../services/intentParser');

const NOW = new Date('2026-08-21T12:00:00+09:00');

test('한국어 자연어에서 노선과 다음주 금요일을 해석한다', () => {
  const { intent } = parseIntent('다음주 금요일 서울에서 제주로 가는 직항 항공권 찾아줘', null, NOW);
  assert.equal(intent.origin, 'ICN');
  assert.equal(intent.destination, 'CJU');
  assert.equal(intent.departDate, '2026-08-28');
  assert.equal(intent.nonStop, true);
});

test('기존 검색 맥락에서 하루 늦춰줘를 적용한다', () => {
  const context = { origin: 'ICN', originName: '서울', destination: 'BCN', destinationName: '바르셀로나', departDate: '2026-09-03', returnDate: null, adults: 1, travelClass: 'ECONOMY', nonStop: false };
  const { intent, applied } = parseIntent('하루 늦춰줘', context, NOW);
  assert.equal(intent.departDate, '2026-09-04');
  assert.ok(applied.includes('date'));
});

test('기존 검색 맥락에서 인원과 직항 조건을 바꾼다', () => {
  const context = { origin: 'ICN', originName: '서울', destination: 'NRT', destinationName: '도쿄', departDate: '2026-09-10', adults: 1, travelClass: 'ECONOMY', nonStop: false };
  const { intent } = parseIntent('2명으로 바꾸고 직항만 보여줘', context, NOW);
  assert.equal(intent.adults, 2);
  assert.equal(intent.nonStop, true);
});

test('런던 말고 파리로 같은 맥락 목적지 수정을 지원한다', () => {
  const context = { origin: 'ICN', originName: '서울', destination: 'LON', destinationName: '런던', departDate: '2026-10-01', adults: 1, travelClass: 'ECONOMY', nonStop: false };
  const { intent } = parseIntent('런던 말고 파리로', context, NOW);
  assert.equal(intent.destination, 'CDG');
  assert.equal(intent.destinationName, '파리');
});
