// routes/amadeus.js
const express = require('express');
const { z } = require('zod');
const router = express.Router();
const amadeusService = require('../services/amadeusService');

const iataDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜는 YYYY-MM-DD 형식이어야 합니다.');
const iataCode = z.string().length(3, 'IATA 코드는 3자리여야 합니다.').transform(v => v.toUpperCase());

const locationSchema = z.object({
    keyword: z.string().trim().min(2, '검색어는 최소 2자 이상이어야 합니다.').max(50, '검색어는 50자 이하여야 합니다.')
});

const flightSchema = z.object({
    origin: iataCode,
    destination: iataCode,
    departDate: iataDate,
    returnDate: iataDate.optional(),
    adults: z.coerce.number().int().min(1, '성인 인원은 1명 이상이어야 합니다.').max(9, '성인 인원은 최대 9명입니다.'),
    travelClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
    nonStop: z.coerce.boolean().default(false)
});

function validationError(res, issues) {
    return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: '요청 파라미터가 올바르지 않습니다.',
        issues: issues.map(i => ({ field: i.path.join('.'), message: i.message }))
    });
}

// 공항/도시 검색
router.get('/search-locations', async (req, res) => {
    const parsed = locationSchema.safeParse(req.query);
    if (!parsed.success) {
        return validationError(res, parsed.error.issues);
    }

    try {
        const data = await amadeusService.searchLocations(parsed.data.keyword);
        res.json(data);
    } catch (error) {
        console.error('[Route] /search-locations 오류:', error.message);
        res.status(error.status || 500).json({ error: error.message || '위치 검색 중 오류가 발생했습니다.' });
    }
});

// 항공편 검색
router.post('/search-flights', async (req, res) => {
    const parsed = flightSchema.safeParse(req.body);
    if (!parsed.success) {
        return validationError(res, parsed.error.issues);
    }

    try {
        const data = await amadeusService.searchFlights(parsed.data);
        res.json(data);
    } catch (error) {
        console.error('[Route] /search-flights 오류:', error.message);
        res.status(error.status || 500).json({ error: error.message || '항공편 검색 중 오류가 발생했습니다.' });
    }
});

module.exports = router;
