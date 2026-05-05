// services/locationResolver.js
const amadeusService = require('./amadeusService');
const { setCache, getCache } = require('./cacheService');

const TTL_7DAYS = 7 * 24 * 60 * 60 * 1000;

// fallback: Amadeus API 호출 전 빠른 응답용 정적 맵
const FALLBACK_IATA = {
    '서울': 'ICN', '인천': 'ICN', '김포': 'GMP',
    '제주': 'CJU', '제주도': 'CJU',
    '부산': 'PUS',
    '도쿄': 'NRT', '동경': 'NRT',
    '오사카': 'KIX',
    '뉴욕': 'JFK', '뉴 욕': 'JFK',
    '런던': 'LHR',
    '파리': 'CDG',
    '방콕': 'BKK',
    '싱가포르': 'SIN',
    '홍콩': 'HKG',
    '베이징': 'PEK', '북경': 'PEK',
    '상하이': 'PVG',
    '시드니': 'SYD',
    '로스앤젤레스': 'LAX', 'LA': 'LAX',
    '샌프란시스코': 'SFO',
};

function pickCandidates(amadeusData) {
    const items = amadeusData?.data ?? [];
    return items.slice(0, 5).map(loc => ({
        iataCode: loc.iataCode,
        name: loc.name,
        cityName: loc.address?.cityName,
        countryName: loc.address?.countryName,
        subType: loc.subType
    }));
}

async function resolveLocation({ text, iata }) {
    if (iata && iata.length === 3) {
        return { status: 'RESOLVED', iataCode: iata.toUpperCase(), label: iata.toUpperCase() };
    }

    if (!text) {
        return { status: 'MISSING' };
    }

    const normalizedText = text.trim();

    const fallback = FALLBACK_IATA[normalizedText] || FALLBACK_IATA[normalizedText.toUpperCase()];
    if (fallback) {
        return { status: 'RESOLVED', iataCode: fallback, label: `${normalizedText} (${fallback})`, source: 'fallback' };
    }

    const cacheKey = `loc:${normalizedText.toLowerCase()}`;
    const cached = getCache(cacheKey);
    if (cached) {
        return cached;
    }

    let amadeusData;
    try {
        amadeusData = await amadeusService.searchLocations(normalizedText);
    } catch (err) {
        const error = new Error(`위치 조회 실패: ${err.message}`);
        error.status = err.status || 503;
        throw error;
    }

    const candidates = pickCandidates(amadeusData);

    let result;
    if (candidates.length === 0) {
        result = { status: 'NO_MATCH', candidates: [] };
    } else if (candidates.length === 1) {
        result = { status: 'RESOLVED', iataCode: candidates[0].iataCode, label: candidates[0].name, candidates };
    } else {
        result = { status: 'AMBIGUOUS', candidates };
    }

    setCache(cacheKey, result, TTL_7DAYS);
    return result;
}

module.exports = { resolveLocation };
