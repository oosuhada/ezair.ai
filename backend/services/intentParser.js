const LOCATION_ALIASES = {
  '서울': { code: 'ICN', name: '서울' },
  '인천': { code: 'ICN', name: '서울' },
  '김포': { code: 'GMP', name: '서울(김포)' },
  '부산': { code: 'PUS', name: '부산' },
  '제주': { code: 'CJU', name: '제주' },
  '도쿄': { code: 'TYO', name: '도쿄' },
  '오사카': { code: 'KIX', name: '오사카' },
  '후쿠오카': { code: 'FUK', name: '후쿠오카' },
  '삿포로': { code: 'CTS', name: '삿포로' },
  '타이베이': { code: 'TPE', name: '타이베이' },
  '홍콩': { code: 'HKG', name: '홍콩' },
  '싱가포르': { code: 'SIN', name: '싱가포르' },
  '방콕': { code: 'BKK', name: '방콕' },
  '다낭': { code: 'DAD', name: '다낭' },
  '하노이': { code: 'HAN', name: '하노이' },
  '호치민': { code: 'SGN', name: '호치민' },
  '세부': { code: 'CEB', name: '세부' },
  '마닐라': { code: 'MNL', name: '마닐라' },
  '발리': { code: 'DPS', name: '발리' },
  '런던': { code: 'LON', name: '런던' },
  '파리': { code: 'CDG', name: '파리' },
  '바르셀로나': { code: 'BCN', name: '바르셀로나' },
  '로마': { code: 'FCO', name: '로마' },
  '뉴욕': { code: 'NYC', name: '뉴욕' },
  '로스앤젤레스': { code: 'LAX', name: '로스앤젤레스' },
  '엘에이': { code: 'LAX', name: '로스앤젤레스' },
  '샌프란시스코': { code: 'SFO', name: '샌프란시스코' },
  '시드니': { code: 'SYD', name: '시드니' },
  '괌': { code: 'GUM', name: '괌' },
  'seoul': { code: 'ICN', name: '서울' },
  'busan': { code: 'PUS', name: '부산' },
  'jeju': { code: 'CJU', name: '제주' },
  'tokyo': { code: 'TYO', name: '도쿄' },
  'osaka': { code: 'KIX', name: '오사카' },
  'fukuoka': { code: 'FUK', name: '후쿠오카' },
  'taipei': { code: 'TPE', name: '타이베이' },
  'hong kong': { code: 'HKG', name: '홍콩' },
  'singapore': { code: 'SIN', name: '싱가포르' },
  'bangkok': { code: 'BKK', name: '방콕' },
  'danang': { code: 'DAD', name: '다낭' },
  'da nang': { code: 'DAD', name: '다낭' },
  'hanoi': { code: 'HAN', name: '하노이' },
  'ho chi minh': { code: 'SGN', name: '호치민' },
  'cebu': { code: 'CEB', name: '세부' },
  'manila': { code: 'MNL', name: '마닐라' },
  'bali': { code: 'DPS', name: '발리' },
  'london': { code: 'LON', name: '런던' },
  'paris': { code: 'CDG', name: '파리' },
  'barcelona': { code: 'BCN', name: '바르셀로나' },
  'rome': { code: 'FCO', name: '로마' },
  'new york': { code: 'NYC', name: '뉴욕' },
  'los angeles': { code: 'LAX', name: '로스앤젤레스' },
  'san francisco': { code: 'SFO', name: '샌프란시스코' },
  'sydney': { code: 'SYD', name: '시드니' },
  'guam': { code: 'GUM', name: '괌' },
};

const WEEKDAYS = {
  '일요일': 0, '일': 0,
  '월요일': 1, '월': 1,
  '화요일': 2, '화': 2,
  '수요일': 3, '수': 3,
  '목요일': 4, '목': 4,
  '금요일': 5, '금': 5,
  '토요일': 6, '토': 6,
};

function toIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function shiftIso(value, days) {
  if (!value) return value;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  date.setDate(date.getDate() + days);
  return toIso(date);
}

function nextWeekday(base, weekday, weekOffset = 0) {
  const date = new Date(base);
  const start = new Date(date);
  start.setHours(12, 0, 0, 0);
  const deltaToMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - deltaToMonday + (weekOffset * 7));
  const mondayBased = weekday === 0 ? 6 : weekday - 1;
  start.setDate(start.getDate() + mondayBased);
  return start;
}

function findLocations(text) {
  const lower = text.toLowerCase();
  const hits = [];
  for (const [alias, value] of Object.entries(LOCATION_ALIASES)) {
    const index = lower.indexOf(alias.toLowerCase());
    if (index >= 0) hits.push({ index, alias, ...value });
  }
  hits.sort((a, b) => a.index - b.index || b.alias.length - a.alias.length);
  const deduped = [];
  for (const hit of hits) {
    if (deduped.some((item) => item.index === hit.index || item.code === hit.code)) continue;
    deduped.push(hit);
  }
  return deduped;
}

function resolveLocation(raw) {
  const cleaned = String(raw || '')
    .trim()
    .replace(/[,.!?"'“”‘’]+$/g, '')
    .replace(/(?:으?로|행|가는|가고\s*싶어|가고싶어|가줘)$/g, '')
    .trim();
  if (!cleaned) return null;
  const direct = LOCATION_ALIASES[cleaned.toLowerCase()] || LOCATION_ALIASES[cleaned];
  if (direct) return direct;
  const iata = cleaned.match(/\b([A-Za-z]{3})\b/);
  if (iata) return { code: iata[1].toUpperCase(), name: iata[1].toUpperCase() };
  return null;
}

function parseDate(text, now = new Date()) {
  const iso = text.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (iso) return `${iso[1]}-${String(iso[2]).padStart(2, '0')}-${String(iso[3]).padStart(2, '0')}`;

  const monthDay = text.match(/(?:(20\d{2})년\s*)?(\d{1,2})월\s*(\d{1,2})일/);
  if (monthDay) {
    const year = Number(monthDay[1] || now.getFullYear());
    const date = new Date(year, Number(monthDay[2]) - 1, Number(monthDay[3]), 12);
    if (!monthDay[1] && date < now) date.setFullYear(date.getFullYear() + 1);
    return toIso(date);
  }

  if (/모레/.test(text)) return toIso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 12));
  if (/내일/.test(text)) return toIso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12));
  if (/오늘/.test(text)) return toIso(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12));

  const weekdayMatch = text.match(/(다음\s*주|이번\s*주)?\s*(월요일|화요일|수요일|목요일|금요일|토요일|일요일)/);
  if (weekdayMatch) {
    const weekOffset = weekdayMatch[1] && /다음/.test(weekdayMatch[1]) ? 1 : 0;
    let date = nextWeekday(now, WEEKDAYS[weekdayMatch[2]], weekOffset);
    if (!weekdayMatch[1] && date < now) date.setDate(date.getDate() + 7);
    return toIso(date);
  }

  const daysLater = text.match(/(\d+)\s*일\s*(?:뒤|후)/);
  if (daysLater) return toIso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + Number(daysLater[1]), 12));
  if (/다음\s*주/.test(text)) return toIso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 12));
  return null;
}

function parseBaseIntent(query, now = new Date()) {
  const text = String(query || '').trim();
  const lower = text.toLowerCase();
  const intent = {
    origin: null,
    originName: null,
    destination: null,
    destinationName: null,
    departDate: parseDate(text, now),
    returnDate: null,
    adults: 1,
    travelClass: 'ECONOMY',
    nonStop: false,
    budget: null,
    originalQuery: text,
  };

  const koreanRoute = text.match(/([^,]+?)(?:에서|출발(?:해서|해)?)[\s,]+([^,]+?)(?:으?로|행|가는|가고\s*싶어|가고싶어)(?:\s|$)/);
  const englishRoute = text.match(/([^,]+?)\s+(?:to|→)\s+([^,]+?)(?:\s+(?:on|next|this|tomorrow|today|for|with|direct|nonstop)|,|$)/i);
  if (koreanRoute) {
    const origin = resolveLocation(koreanRoute[1]);
    const destination = resolveLocation(koreanRoute[2]);
    if (origin) Object.assign(intent, { origin: origin.code, originName: origin.name });
    if (destination) Object.assign(intent, { destination: destination.code, destinationName: destination.name });
  } else if (englishRoute) {
    const origin = resolveLocation(englishRoute[1]);
    const destination = resolveLocation(englishRoute[2]);
    if (origin) Object.assign(intent, { origin: origin.code, originName: origin.name });
    if (destination) Object.assign(intent, { destination: destination.code, destinationName: destination.name });
  }

  if (!intent.origin || !intent.destination) {
    const locations = findLocations(text);
    if (!intent.origin && locations[0]) Object.assign(intent, { origin: locations[0].code, originName: locations[0].name });
    if (!intent.destination && locations[1]) Object.assign(intent, { destination: locations[1].code, destinationName: locations[1].name });
  }

  const passenger = text.match(/(?:^|\s)([1-9])\s*(?:명|인|people|persons?|passengers?|travell?ers?|adults?|pax)(?:으로|이|을|은|과|만)?(?:\s|$)/i);
  if (passenger) intent.adults = Number(passenger[1]);

  if (/(?:비즈니스|business)/i.test(text)) intent.travelClass = 'BUSINESS';
  else if (/(?:퍼스트|일등석|first\s*class)/i.test(text)) intent.travelClass = 'FIRST';
  else if (/(?:프리미엄\s*이코노미|premium\s*economy)/i.test(text)) intent.travelClass = 'PREMIUM_ECONOMY';

  if (/(?:직항(?:\s*(?:만|으로))?|non[- ]?stop|direct\s*only)/i.test(text)) intent.nonStop = true;

  const budget = text.match(/(?:최대|예산|이하|아래|under|below|max(?:imum)?)\s*([₩￦$€£]?\s*[\d,.]+\s*(?:만원|만)?)/i)
    || text.match(/([₩￦$€£]\s*[\d,.]+|\d+\s*만원)\s*(?:이하|아래|미만)/i);
  if (budget) intent.budget = budget[1].replace(/\s+/g, '').trim();

  if (/(?:왕복|round\s*trip)/i.test(text) && intent.departDate) {
    const nights = text.match(/(\d+)\s*박/);
    intent.returnDate = shiftIso(intent.departDate, nights ? Number(nights[1]) : 3);
  }

  return intent;
}

function applyContextModification(base, query, now = new Date()) {
  const text = String(query || '').trim();
  const parsed = parseBaseIntent(text, now);
  const next = { ...base };
  const applied = [];

  if (parsed.origin && parsed.destination) {
    Object.assign(next, {
      origin: parsed.origin,
      originName: parsed.originName,
      destination: parsed.destination,
      destinationName: parsed.destinationName,
    });
    if (parsed.departDate) next.departDate = parsed.departDate;
    applied.push('route');
  }

  const passenger = text.match(/(?:^|\s)([1-9])\s*(?:명|인|people|persons?|passengers?|travell?ers?|adults?|pax)(?:으로|이|을|은|과|만)?(?:\s|$)/i);
  if (passenger) {
    next.adults = Number(passenger[1]);
    applied.push('adults');
  }

  const later = text.match(/(?:(\d+)\s*)?(?:일\s*)?(?:늦춰|늦게|미뤄|뒤로|later)/i);
  const earlier = text.match(/(?:(\d+)\s*)?(?:일\s*)?(?:당겨|일찍|앞으로|earlier)/i);
  if (later && next.departDate) {
    const days = Math.max(1, Number(later[1] || 1));
    next.departDate = shiftIso(next.departDate, days);
    next.returnDate = shiftIso(next.returnDate, days);
    applied.push('date');
  } else if (earlier && next.departDate) {
    const days = Math.max(1, Number(earlier[1] || 1));
    next.departDate = shiftIso(next.departDate, -days);
    next.returnDate = shiftIso(next.returnDate, -days);
    applied.push('date');
  } else if (parsed.departDate && !parsed.origin && !parsed.destination) {
    next.departDate = parsed.departDate;
    applied.push('date');
  }

  if (/(?:직항\s*(?:아니어도|아니라도)|경유\s*(?:가능|괜찮)|stops?\s*(?:ok|okay|fine))/i.test(text)) {
    next.nonStop = false;
    applied.push('nonStop');
  } else if (/(?:직항(?:\s*(?:만|으로))?|non[- ]?stop|direct\s*only)/i.test(text)) {
    next.nonStop = true;
    applied.push('nonStop');
  }

  if (/(?:비즈니스|business)/i.test(text)) {
    next.travelClass = 'BUSINESS';
    applied.push('travelClass');
  } else if (/(?:퍼스트|일등석|first\s*class)/i.test(text)) {
    next.travelClass = 'FIRST';
    applied.push('travelClass');
  } else if (/(?:이코노미|일반석|economy)/i.test(text)) {
    next.travelClass = 'ECONOMY';
    applied.push('travelClass');
  }

  const replace = text.match(/([^,]+?)\s*말고\s*([^,]+?)(?:으?로)(?:\s|$)/);
  if (replace) {
    const oldLocation = resolveLocation(replace[1]);
    const newLocation = resolveLocation(replace[2]);
    if (oldLocation && newLocation) {
      if (oldLocation.code === next.origin) {
        next.origin = newLocation.code;
        next.originName = newLocation.name;
        applied.push('origin');
      } else {
        next.destination = newLocation.code;
        next.destinationName = newLocation.name;
        applied.push('destination');
      }
    }
  }

  next.originalQuery = text;
  return { intent: next, applied: [...new Set(applied)] };
}

function parseIntent(query, context = null, now = new Date()) {
  if (context && context.origin && context.destination) {
    return applyContextModification(context, query, now);
  }
  return { intent: parseBaseIntent(query, now), applied: [] };
}

function summarizeIntent(intent) {
  const parts = [];
  if (intent.origin) parts.push({ key: 'origin', label: '출발', value: `${intent.originName || intent.origin} · ${intent.origin}` });
  if (intent.destination) parts.push({ key: 'destination', label: '도착', value: `${intent.destinationName || intent.destination} · ${intent.destination}` });
  if (intent.departDate) parts.push({ key: 'date', label: '가는 날', value: intent.departDate });
  if (intent.returnDate) parts.push({ key: 'return', label: '오는 날', value: intent.returnDate });
  if (intent.adults) parts.push({ key: 'adults', label: '인원', value: `${intent.adults}명` });
  if (intent.nonStop) parts.push({ key: 'stops', label: '경유', value: '직항만' });
  if (intent.travelClass && intent.travelClass !== 'ECONOMY') {
    const label = intent.travelClass === 'BUSINESS' ? '비즈니스' : intent.travelClass === 'FIRST' ? '일등석' : '프리미엄 이코노미';
    parts.push({ key: 'cabin', label: '좌석', value: label });
  }
  if (intent.budget) parts.push({ key: 'budget', label: '예산', value: intent.budget });
  return parts;
}

module.exports = {
  LOCATION_ALIASES,
  parseIntent,
  parseBaseIntent,
  summarizeIntent,
  shiftIso,
};
