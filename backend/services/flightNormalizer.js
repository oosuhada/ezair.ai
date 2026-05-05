// services/flightNormalizer.js

// 항공사 코드 → 로고 파일명 맵 (프론트 image/flightResult/ 기준)
const AIRLINE_LOGO_MAP = {
    'BX': 'airbusan.png',
    'OZ': 'asiana.png',
    'ZE': 'eastar.png',
    'EK': 'emirates.png',
    'KE': 'koreanair.png',
    'QR': 'qutar.png',
    'RS': 'result_airseoul.svg',
    'TW': 'tway.png'
};
const LOGO_BASE = '../image/flightResult/';
const DEFAULT_LOGO = `${LOGO_BASE}EZAIR_bk.svg`;

function getLogoPath(airlineCode) {
    const file = AIRLINE_LOGO_MAP[airlineCode];
    return file ? `${LOGO_BASE}${file}` : DEFAULT_LOGO;
}

function parseDuration(isoDuration) {
    if (!isoDuration) return '';
    const m = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!m) return isoDuration;
    const h = m[1] ? `${m[1]}시간 ` : '';
    const min = m[2] ? `${m[2]}분` : '';
    return (h + min).trim();
}

function normalizeFlightOffers(amadeusResponse) {
    const offers = amadeusResponse?.data;
    if (!Array.isArray(offers) || offers.length === 0) return [];

    const carriers = amadeusResponse?.dictionaries?.carriers ?? {};

    // 최저가 금액 (recommendation 판단용)
    const minPrice = Math.min(
        ...offers.map(o => parseFloat(o?.price?.grandTotal ?? o?.price?.total ?? Infinity))
    );

    return offers.map((offer, idx) => {
        const itinerary = offer?.itineraries?.[0];
        const segments = itinerary?.segments ?? [];
        const first = segments[0] ?? {};
        const last = segments[segments.length - 1] ?? first;

        const airlineCode = first?.carrierCode ?? '';
        const airline = carriers[airlineCode] ?? airlineCode;
        const flightNumber = first?.number ? `${airlineCode}${first.number}` : '';

        const origin = first?.departure?.iataCode ?? '';
        const destination = last?.arrival?.iataCode ?? '';
        const departureTime = first?.departure?.at ?? '';
        const arrivalTime = last?.arrival?.at ?? '';
        const duration = parseDuration(itinerary?.duration);
        const stops = Math.max(segments.length - 1, 0);
        const direct = stops === 0;

        const priceAmount = parseFloat(offer?.price?.grandTotal ?? offer?.price?.total ?? 0);
        const currency = offer?.price?.currency ?? 'KRW';

        let recommendation = '';
        if (priceAmount !== 0 && priceAmount === minPrice && idx === offers.findIndex(
            o => parseFloat(o?.price?.grandTotal ?? o?.price?.total ?? Infinity) === minPrice
        )) {
            recommendation = 'special';
        } else if (direct) {
            recommendation = 'direct';
        }

        return {
            id: offer?.id ?? String(idx),
            airline,
            airlineCode,
            airlineLogo: getLogoPath(airlineCode),
            flightNumber,
            origin,
            destination,
            departureTime,
            arrivalTime,
            duration,
            stops,
            direct,
            price: { amount: priceAmount, currency },
            recommendation
        };
    });
}

module.exports = { normalizeFlightOffers };
