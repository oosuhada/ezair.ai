// services/mockFlightService.js

const FOLLOW_UP_ACTIONS = ['더 저렴한 날짜 찾아줘', '직항만 보여줘', '하루 전후로 비교해줘'];

function futureDate(daysAhead) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().slice(0, 10);
}

function addMinutes(isoDate, minutes) {
    return new Date(new Date(isoDate).getTime() + minutes * 60000).toISOString().replace('.000Z', '+09:00');
}

function makeDepTime(daysAhead, hour, minute = 0) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString().replace('.000Z', '+09:00');
}

const ROUTES = {
    'ICN-JFK': {
        origin: 'ICN', destination: 'JFK',
        label: '서울(인천) → 뉴욕(JFK)',
        flights: [
            { airlineCode: 'KE', airline: '대한항공', logo: '../image/flightResult/koreanair.png', flightNo: 'KE081', durationMin: 810, depHour: 10, price: 1290000 },
            { airlineCode: 'OZ', airline: '아시아나항공', logo: '../image/flightResult/asiana.png', flightNo: 'OZ221', durationMin: 820, depHour: 13, price: 1180000 },
            { airlineCode: 'EK', airline: '에미레이트항공', logo: '../image/flightResult/emirates.png', flightNo: 'EK322', durationMin: 920, depHour: 22, stops: 1, price: 980000 }
        ]
    },
    'GMP-CJU': {
        origin: 'GMP', destination: 'CJU',
        label: '서울(김포) → 제주',
        flights: [
            { airlineCode: 'KE', airline: '대한항공', logo: '../image/flightResult/koreanair.png', flightNo: 'KE1201', durationMin: 65, depHour: 7, price: 59000 },
            { airlineCode: 'OZ', airline: '아시아나항공', logo: '../image/flightResult/asiana.png', flightNo: 'OZ8901', durationMin: 70, depHour: 9, price: 55000 },
            { airlineCode: 'TW', airline: '티웨이항공', logo: '../image/flightResult/tway.png', flightNo: 'TW301', durationMin: 70, depHour: 12, price: 39000 }
        ]
    },
    'ICN-KIX': {
        origin: 'ICN', destination: 'KIX',
        label: '서울(인천) → 오사카(간사이)',
        flights: [
            { airlineCode: 'OZ', airline: '아시아나항공', logo: '../image/flightResult/asiana.png', flightNo: 'OZ111', durationMin: 130, depHour: 8, price: 289000 },
            { airlineCode: 'KE', airline: '대한항공', logo: '../image/flightResult/koreanair.png', flightNo: 'KE723', durationMin: 130, depHour: 10, price: 310000 },
            { airlineCode: 'TW', airline: '티웨이항공', logo: '../image/flightResult/tway.png', flightNo: 'TW291', durationMin: 140, depHour: 15, price: 199000 }
        ]
    },
    'ICN-NRT': {
        origin: 'ICN', destination: 'NRT',
        label: '서울(인천) → 도쿄(나리타)',
        flights: [
            { airlineCode: 'KE', airline: '대한항공', logo: '../image/flightResult/koreanair.png', flightNo: 'KE703', durationMin: 145, depHour: 9, price: 320000 },
            { airlineCode: 'OZ', airline: '아시아나항공', logo: '../image/flightResult/asiana.png', flightNo: 'OZ101', durationMin: 145, depHour: 12, price: 298000 },
            { airlineCode: 'TW', airline: '티웨이항공', logo: '../image/flightResult/tway.png', flightNo: 'TW201', durationMin: 155, depHour: 17, price: 229000 }
        ]
    },
    'PUS-CJU': {
        origin: 'PUS', destination: 'CJU',
        label: '부산 → 제주',
        flights: [
            { airlineCode: 'KE', airline: '대한항공', logo: '../image/flightResult/koreanair.png', flightNo: 'KE1401', durationMin: 55, depHour: 8, price: 48000 },
            { airlineCode: 'BX', airline: '에어부산', logo: '../image/flightResult/airbusan.png', flightNo: 'BX8711', durationMin: 55, depHour: 10, price: 39000 },
            { airlineCode: 'TW', airline: '티웨이항공', logo: '../image/flightResult/tway.png', flightNo: 'TW501', durationMin: 60, depHour: 14, price: 35000 }
        ]
    }
};

const QUERY_PATTERNS = [
    { keys: ['뉴욕', 'jfk', 'new york'], route: 'ICN-JFK' },
    { keys: ['제주', '제주도', 'cju'], exclude: ['부산', 'pus'], route: 'GMP-CJU' },
    { keys: ['제주', '제주도', 'cju'], include: ['부산', 'pus'], route: 'PUS-CJU' },
    { keys: ['오사카', 'kix', 'osaka'], route: 'ICN-KIX' },
    { keys: ['도쿄', '동경', 'nrt', 'hnd', 'tokyo'], route: 'ICN-NRT' },
    { keys: ['부산', 'pus'], route: 'PUS-CJU' }
];

function detectRoute(query) {
    const q = query.toLowerCase();
    for (const pattern of QUERY_PATTERNS) {
        const hasKey = pattern.keys.some(k => q.includes(k));
        if (!hasKey) continue;
        if (pattern.include && !pattern.include.some(k => q.includes(k))) continue;
        if (pattern.exclude && pattern.exclude.some(k => q.includes(k))) continue;
        return pattern.route;
    }
    return null;
}

function formatDuration(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}시간 ${m > 0 ? m + '분' : ''}`.trim() : `${m}분`;
}

function buildFlights(routeKey, daysAhead = 14) {
    const route = ROUTES[routeKey];
    const prices = route.flights.map(f => f.price);
    const minPrice = Math.min(...prices);

    return route.flights.map((f, idx) => {
        const depTime = makeDepTime(daysAhead, f.depHour);
        const arrTime = addMinutes(depTime, f.durationMin);
        const stops = f.stops ?? 0;
        return {
            id: `mock-${routeKey}-${idx + 1}`,
            airline: f.airline,
            airlineCode: f.airlineCode,
            airlineLogo: f.logo,
            flightNumber: f.flightNo,
            origin: route.origin,
            destination: route.destination,
            departureTime: depTime,
            arrivalTime: arrTime,
            duration: formatDuration(f.durationMin),
            stops,
            direct: stops === 0,
            price: { amount: f.price, currency: 'KRW' },
            recommendation: f.price === minPrice ? 'special' : (stops === 0 ? 'direct' : '')
        };
    });
}

function buildMockAiFlightSearchResponse(query) {
    const routeKey = detectRoute(query);

    if (!routeKey) {
        return {
            mode: 'MOCK',
            aiInsight: `"${query}" 노선은 현재 데모에서 지원되지 않습니다. 서울-뉴욕, 서울-제주, 서울-오사카, 서울-도쿄, 부산-제주 검색을 시도해 보세요.`,
            intent: null,
            flights: [],
            followUpActions: FOLLOW_UP_ACTIONS,
            cached: false
        };
    }

    const route = ROUTES[routeKey];
    const flights = buildFlights(routeKey);
    const cheapest = flights.reduce((a, b) => a.price.amount < b.price.amount ? a : b);

    return {
        mode: 'MOCK',
        aiInsight: `${route.label} 항공편 ${flights.length}개를 찾았습니다. 최저가는 ${cheapest.airline} ${cheapest.flightNumber} (${cheapest.price.amount.toLocaleString()}원)입니다.`,
        intent: { originIata: route.origin, destinationIata: route.destination, departDate: futureDate(14), adults: 1, travelClass: 'ECONOMY', nonStop: false },
        flights,
        followUpActions: FOLLOW_UP_ACTIONS,
        cached: false
    };
}

module.exports = { buildMockAiFlightSearchResponse };
