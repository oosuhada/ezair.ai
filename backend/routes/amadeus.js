// backend/routes/amadeus.js
const express = require('express');
const router = express.Router();
const amadeusService = require('../services/amadeusService'); // Amadeus 서비스 임포트
const { LOCATION_ALIASES } = require('../services/intentParser');
const { createDemoFlights } = require('../services/demoSearchService');

function hasAmadeusCredentials() {
    return Boolean(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET);
}

function searchLocalLocations(keyword) {
    const lower = String(keyword || '').trim().toLowerCase();
    const seen = new Set();
    const data = [];
    for (const [alias, location] of Object.entries(LOCATION_ALIASES)) {
        if (!alias.toLowerCase().includes(lower) && !location.name.toLowerCase().includes(lower) && !location.code.toLowerCase().includes(lower)) continue;
        if (seen.has(location.code)) continue;
        seen.add(location.code);
        data.push({
            name: location.name,
            iataCode: location.code,
            subType: 'CITY',
            address: { cityName: location.name, countryName: '' },
        });
        if (data.length >= 10) break;
    }
    return { data, _meta: { sourceMode: 'local', sourceLabel: 'EZ AIR location index' } };
}

function minutesToIso(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `PT${hours ? `${hours}H` : ''}${mins ? `${mins}M` : ''}`;
}

function demoToAmadeusPayload(flights, params) {
    const carriers = {};
    const data = flights.map((flight) => {
        const carrierCode = String(flight.flightNumber || '').match(/^([A-Z0-9]{2})/)?.[1] || 'EZ';
        carriers[carrierCode] = flight.airline;
        const outbound = {
            duration: minutesToIso(flight.durationMinutes),
            segments: [{
                carrierCode,
                number: String(flight.flightNumber || '').replace(carrierCode, ''),
                departure: { iataCode: flight.origin, at: flight.departureTime },
                arrival: { iataCode: flight.destination, at: flight.arrivalTime },
            }],
        };
        const itineraries = [outbound];
        if (params.returnDate) {
            const outDate = new Date(flight.departureTime);
            const returnBase = new Date(`${params.returnDate}T00:00:00`);
            returnBase.setHours(outDate.getHours() + 2, outDate.getMinutes(), 0, 0);
            const returnArrival = new Date(returnBase.getTime() + flight.durationMinutes * 60_000);
            const toLocalIso = (date) => {
                const pad = (value) => String(value).padStart(2, '0');
                return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
            };
            itineraries.push({
                duration: minutesToIso(flight.durationMinutes),
                segments: [{
                    carrierCode,
                    number: String(flight.flightNumber || '').replace(carrierCode, ''),
                    departure: { iataCode: flight.destination, at: toLocalIso(returnBase) },
                    arrival: { iataCode: flight.origin, at: toLocalIso(returnArrival) },
                }],
            });
        }
        return {
            id: flight.id,
            price: {
                grandTotal: String(Math.round(flight.price.amount * (params.returnDate ? 2 : 1))),
                currency: flight.price.currency,
            },
            itineraries,
        };
    });
    return { data, dictionaries: { carriers }, _meta: { sourceMode: 'demo', sourceLabel: '데모 데이터' } };
}

// 공항/도시 검색 엔드포인트
router.get('/search-locations', async (req, res) => {
    const { keyword } = req.query;

    if (!keyword || keyword.length < 2) {
        return res.status(400).json({ error: 'Please enter at least 2 characters for search.' });
    }

    if (!hasAmadeusCredentials()) return res.json(searchLocalLocations(keyword));

    try {
        const data = await amadeusService.searchLocations(keyword);
        res.json({ ...data, _meta: { sourceMode: 'amadeus', sourceLabel: 'Amadeus test API' } });
    } catch (error) {
        console.error('Error in /api/search-locations route; using local index:', error.message);
        res.json(searchLocalLocations(keyword));
    }
});

// 항공편 검색 엔드포인트
router.post('/search-flights', async (req, res) => {
    const { origin, destination, departDate, returnDate, adults, travelClass, nonStop } = req.body;

    if (!origin || !destination || !departDate || !adults) {
        return res.status(400).json({ error: 'Missing required search parameters.' });
    }

    const params = { origin, destination, departDate, returnDate, adults, travelClass, nonStop };
    if (!hasAmadeusCredentials()) {
        return res.json(demoToAmadeusPayload(createDemoFlights(params), params));
    }

    try {
        const data = await amadeusService.searchFlights(params);
        res.json({ ...data, _meta: { sourceMode: 'amadeus', sourceLabel: 'Amadeus test API' } });
    } catch (error) {
        console.error('Error in /api/search-flights route; using demo fallback:', error.message);
        res.json(demoToAmadeusPayload(createDemoFlights(params), params));
    }
});

module.exports = router;
