// backend/routes/amadeus.js
const express = require('express');
const router = express.Router();
const amadeusService = require('../services/amadeusService'); // Amadeus 서비스 임포트

// 공항/도시 검색 엔드포인트
router.get('/search-locations', async (req, res) => {
    const { keyword } = req.query;

    if (!keyword || keyword.length < 2) {
        return res.status(400).json({ error: 'Please enter at least 2 characters for search.' });
    }

    try {
        const data = await amadeusService.searchLocations(keyword);
        res.json(data);
    } catch (error) {
        // 서비스 계층에서 발생한 에러를 여기서 처리하거나 다음 미들웨어로 넘김
        console.error('Error in /api/search-locations route:', error.message);
        res.status(error.status || 500).json({ error: error.message || 'Internal server error during location search.' });
    }
});

// 항공편 검색 엔드포인트
router.post('/search-flights', async (req, res) => {
    const { origin, destination, departDate, returnDate, adults, travelClass, nonStop } = req.body;

    if (!origin || !destination || !departDate || !adults) {
        return res.status(400).json({ error: 'Missing required search parameters.' });
    }

    try {
        const data = await amadeusService.searchFlights({
            origin,
            destination,
            departDate,
            returnDate,
            adults,
            travelClass,
            nonStop
        });
        res.json(data);
    } catch (error) {
        // 서비스 계층에서 발생한 에러를 여기서 처리하거나 다음 미들웨어로 넘김
        console.error('Error in /api/search-flights route:', error.message);
        res.status(error.status || 500).json({ error: error.message || 'Internal server error during flight search.' });
    }
});

module.exports = router;