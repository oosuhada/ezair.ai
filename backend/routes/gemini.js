// routes/gemini.js
const express = require('express');
const router = express.Router();
const { parseFlightQuery } = require('../services/geminiService');
const { resolveLocation } = require('../services/locationResolver');
const { normalizeFlightOffers } = require('../services/flightNormalizer');
const { buildMockAiFlightSearchResponse } = require('../services/mockFlightService');
const amadeusService = require('../services/amadeusService');
const { getCache, setCache } = require('../services/cacheService');

router.get('/gemini-health', (req, res) => {
    res.json({ ok: true, service: 'gemini', mode: process.env.AI_SEARCH_MODE || 'mock' });
});

router.post('/ai/flight-search', async (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'query가 필요합니다.' });
    }

    // --- Mock mode ---
    if ((process.env.AI_SEARCH_MODE || 'mock') === 'mock') {
        return res.json(buildMockAiFlightSearchResponse(query));
    }

    // --- Real mode ---
    try {
        // 1. Gemini로 intent 추출
        let intent;
        try {
            intent = await parseFlightQuery(query);
        } catch (err) {
            return res.status(err.status || 503).json({ error: err.message });
        }

        // 2. 명확화 필요
        if (intent.needsClarification) {
            return res.json({
                mode: 'CLARIFICATION',
                question: intent.clarificationQuestion || '출발지와 목적지를 알려주세요.',
                intent,
                flights: [],
                followUpActions: []
            });
        }

        // 3. Location resolve
        const [originResult, destResult] = await Promise.all([
            resolveLocation({ text: intent.originText, iata: intent.originIata }),
            resolveLocation({ text: intent.destinationText, iata: intent.destinationIata })
        ]);

        if (originResult.status === 'MISSING' || originResult.status === 'NO_MATCH') {
            return res.json({
                mode: 'CLARIFICATION',
                question: '출발지를 정확히 입력해 주세요.',
                intent,
                flights: [],
                followUpActions: []
            });
        }
        if (destResult.status === 'MISSING' || destResult.status === 'NO_MATCH') {
            return res.json({
                mode: 'CLARIFICATION',
                question: '도착지를 정확히 입력해 주세요.',
                intent,
                flights: [],
                followUpActions: []
            });
        }
        if (originResult.status === 'AMBIGUOUS') {
            return res.json({
                mode: 'CLARIFICATION',
                question: '출발 공항을 선택해 주세요.',
                candidates: originResult.candidates,
                intent,
                flights: [],
                followUpActions: []
            });
        }
        if (destResult.status === 'AMBIGUOUS') {
            return res.json({
                mode: 'CLARIFICATION',
                question: '도착 공항을 선택해 주세요.',
                candidates: destResult.candidates,
                intent,
                flights: [],
                followUpActions: []
            });
        }

        const origin = originResult.iataCode;
        const destination = destResult.iataCode;

        // 4. Cache key
        const cacheKey = `flights:${origin}:${destination}:${intent.departDate}:${intent.returnDate || ''}:${intent.adults}:${intent.travelClass}:${intent.nonStop}`;
        const cached = getCache(cacheKey);
        if (cached) {
            return res.json({ ...cached, cached: true });
        }

        // 5. Amadeus 검색
        let amadeusRaw;
        try {
            amadeusRaw = await amadeusService.searchFlights({
                origin,
                destination,
                departDate: intent.departDate,
                returnDate: intent.returnDate,
                adults: intent.adults,
                travelClass: intent.travelClass,
                nonStop: intent.nonStop
            });
        } catch (err) {
            return res.status(err.status || 503).json({ error: err.message });
        }

        // 6. Normalize
        const flights = normalizeFlightOffers(amadeusRaw);

        const responseBody = {
            mode: 'RESULTS',
            aiInsight: `${originResult.label || origin} → ${destResult.label || destination} 항공편 ${flights.length}개를 찾았습니다.`,
            intent: { ...intent, originIata: origin, destinationIata: destination },
            flights,
            followUpActions: FOLLOW_UP_ACTIONS,
            cached: false
        };

        setCache(cacheKey, responseBody, 5 * 60 * 1000);
        return res.json(responseBody);

    } catch (err) {
        console.error('[Route] /ai/flight-search 오류:', err.message);
        return res.status(500).json({ error: '항공편 검색 중 오류가 발생했습니다.' });
    }
});

module.exports = router;
