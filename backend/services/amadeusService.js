// services/amadeusService.js
require('dotenv').config();

if (typeof globalThis.fetch !== 'function') {
    throw new Error('Node 20+ 내장 fetch가 필요합니다. Node 버전을 확인해 주세요.');
}

const AMADEUS_BASE_URL = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';

let amadeusAccessToken = null;
let tokenExpiryTime = 0;

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

async function getAmadeusAccessToken() {
    if (amadeusAccessToken && Date.now() < tokenExpiryTime - 60000) {
        return amadeusAccessToken;
    }

    const clientId = process.env.AMADEUS_API_KEY;
    const clientSecret = process.env.AMADEUS_API_SECRET;

    if (!clientId || !clientSecret) {
        const error = new Error('AMADEUS_API_KEY 또는 AMADEUS_API_SECRET이 .env에 설정되지 않았습니다.');
        error.status = 500;
        throw error;
    }

    const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
    });

    try {
        const response = await fetchWithTimeout(
            `${AMADEUS_BASE_URL}/v1/security/oauth2/token`,
            { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body },
            10000
        );

        if (!response.ok) {
            const error = new Error(`Amadeus 토큰 발급 실패: HTTP ${response.status}`);
            error.status = response.status;
            throw error;
        }

        const data = await response.json();
        amadeusAccessToken = data.access_token;
        tokenExpiryTime = Date.now() + data.expires_in * 1000;
        console.log('[Amadeus] 토큰 발급 성공.');
        return amadeusAccessToken;

    } catch (error) {
        console.error('[Amadeus] 토큰 발급 오류:', error.message);
        if (!error.status) error.status = 500;
        throw error;
    }
}

async function searchLocations(keyword) {
    const accessToken = await getAmadeusAccessToken();

    const url = `${AMADEUS_BASE_URL}/v1/reference-data/locations?` + new URLSearchParams({
        subType: 'CITY,AIRPORT',
        keyword,
        'page[offset]': 0,
        'page[limit]': 10
    });

    try {
        const response = await fetchWithTimeout(url, {
            headers: { Authorization: `Bearer ${accessToken}` }
        }, 10000);

        if (!response.ok) {
            const error = new Error('Amadeus Location API 오류');
            error.status = response.status;
            throw error;
        }

        return await response.json();

    } catch (error) {
        console.error('[Amadeus] 위치 검색 오류:', error.message);
        if (!error.status) error.status = 500;
        throw error;
    }
}

async function searchFlights({ origin, destination, departDate, returnDate, adults, travelClass, nonStop }) {
    const accessToken = await getAmadeusAccessToken();

    const queryParams = new URLSearchParams({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departDate,
        adults,
        travelClass: travelClass || 'ECONOMY',
        max: 10
    });
    if (returnDate) queryParams.append('returnDate', returnDate);
    if (nonStop) queryParams.append('nonStop', 'true');

    try {
        const response = await fetchWithTimeout(
            `${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${queryParams}`,
            { headers: { Authorization: `Bearer ${accessToken}` } },
            10000
        );

        if (!response.ok) {
            const error = new Error('Amadeus Flight API 오류');
            error.status = response.status;
            throw error;
        }

        return await response.json();

    } catch (error) {
        console.error('[Amadeus] 항공편 검색 오류:', error.message);
        if (!error.status) error.status = 500;
        throw error;
    }
}

module.exports = { searchLocations, searchFlights };
