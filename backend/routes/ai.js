const express = require('express');
const { parseIntent, summarizeIntent } = require('../services/intentParser');
const { searchFlightsForProduct } = require('../services/flightSearchProductService');

const router = express.Router();

router.post('/ai-intent', (req, res) => {
  const { query, context } = req.body || {};
  if (!query || !String(query).trim()) return res.status(400).json({ error: '검색 문장을 입력해주세요.' });
  const parsed = parseIntent(String(query), context || null);
  res.json({ ...parsed, summary: summarizeIntent(parsed.intent) });
});

router.post('/ai-search', async (req, res) => {
  const { query, context } = req.body || {};
  if (!query || !String(query).trim()) return res.status(400).json({ error: '검색 문장을 입력해주세요.' });

  const parsed = parseIntent(String(query), context || null);
  const intent = parsed.intent;
  if (!intent.origin || !intent.destination) {
    return res.status(422).json({
      error: '출발지와 도착지를 문장에서 찾지 못했어요.',
      intent,
      summary: summarizeIntent(intent),
    });
  }
  if (!intent.departDate) {
    return res.status(422).json({
      error: '가는 날짜를 알려주세요. 예: 다음주 금요일, 9월 3일',
      intent,
      summary: summarizeIntent(intent),
    });
  }

  const result = await searchFlightsForProduct(intent);
  const routeText = `${intent.originName || intent.origin}에서 ${intent.destinationName || intent.destination}`;
  const aiInsight = `${routeText}로 ${intent.departDate} 출발하는 항공편을 찾았어요. ${intent.nonStop ? '직항 조건을 우선 적용했고, ' : ''}가격과 소요시간을 함께 비교해보세요.`;
  const additionalRecommendation = intent.nonStop
    ? '직항만 보면 선택지가 줄어들 수 있어요. 필요하면 “경유도 괜찮아”라고 이어서 검색해보세요.'
    : '가장 저렴한 항공편과 가장 빠른 항공편이 다를 수 있어요. 최대 3개까지 비교해보세요.';

  res.json({
    ...result,
    intent,
    applied: parsed.applied,
    summary: summarizeIntent(intent),
    aiInsight,
    additional_recommendation: additionalRecommendation,
    followUpActions: [
      { label: '하루 늦춰줘', query: '하루 늦춰줘' },
      { label: '2명으로 바꿔줘', query: '2명으로 바꿔줘' },
      { label: intent.nonStop ? '경유도 괜찮아' : '직항만 보여줘', query: intent.nonStop ? '경유도 괜찮아' : '직항만 보여줘' },
    ],
  });
});

module.exports = router;
