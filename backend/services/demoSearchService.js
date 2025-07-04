const AIRLINES = {
  domestic: [
    { name: '대한항공', code: 'KE', logo: '/image/flightResult/koreanair.png' },
    { name: '아시아나항공', code: 'OZ', logo: '/image/flightResult/asiana.png' },
    { name: '티웨이항공', code: 'TW', logo: '/image/flightResult/tway.png' },
    { name: '에어부산', code: 'BX', logo: '/image/flightResult/airbusan.png' },
    { name: '이스타항공', code: 'ZE', logo: '/image/flightResult/eastar.png' },
    { name: '에어서울', code: 'RS', logo: '/image/flightResult/result_airseoul.svg' },
  ],
  regional: [
    { name: '대한항공', code: 'KE', logo: '/image/flightResult/koreanair.png' },
    { name: '아시아나항공', code: 'OZ', logo: '/image/flightResult/asiana.png' },
    { name: '티웨이항공', code: 'TW', logo: '/image/flightResult/tway.png' },
    { name: '에어부산', code: 'BX', logo: '/image/flightResult/airbusan.png' },
    { name: '이스타항공', code: 'ZE', logo: '/image/flightResult/eastar.png' },
    { name: '에어서울', code: 'RS', logo: '/image/flightResult/result_airseoul.svg' },
  ],
  longhaul: [
    { name: '대한항공', code: 'KE', logo: '/image/flightResult/koreanair.png' },
    { name: '아시아나항공', code: 'OZ', logo: '/image/flightResult/asiana.png' },
    { name: '에미레이트항공', code: 'EK', logo: '/image/flightResult/emirates.png' },
    { name: '카타르항공', code: 'QR', logo: '/image/flightResult/qutar.png' },
  ],
};

function hash(input) {
  let value = 2166136261;
  for (const char of String(input)) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value >>> 0);
}

function toIsoLocal(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function estimateTier(origin, destination) {
  const domestic = new Set(['ICN', 'GMP', 'PUS', 'CJU']);
  const regional = new Set(['TYO', 'NRT', 'HND', 'KIX', 'FUK', 'CTS', 'TPE', 'HKG', 'DAD', 'HAN', 'SGN', 'CEB', 'MNL', 'BKK', 'SIN', 'GUM']);
  if (domestic.has(origin) && domestic.has(destination)) return 'domestic';
  if ((domestic.has(origin) && regional.has(destination)) || (regional.has(origin) && domestic.has(destination))) return 'regional';
  return 'longhaul';
}

function createDemoFlights(intent) {
  const seed = hash(`${intent.origin}-${intent.destination}-${intent.departDate}-${intent.adults}-${intent.travelClass}-${intent.nonStop}`);
  const tier = estimateTier(intent.origin, intent.destination);
  const basePrice = tier === 'domestic' ? 68000 : tier === 'regional' ? 218000 : 728000;
  const baseDuration = tier === 'domestic' ? 65 : tier === 'regional' ? 185 : 700;
  const durationSpread = tier === 'domestic' ? 32 : tier === 'regional' ? 95 : 260;
  const airlinePool = AIRLINES[tier];
  const date = new Date(`${intent.departDate}T00:00:00`);
  const flights = [];

  for (let i = 0; i < 6; i += 1) {
    const airline = airlinePool[(seed + i) % airlinePool.length];
    const departure = new Date(date);
    departure.setHours(6 + ((seed + i * 3) % 14), ((seed >> (i % 8)) % 4) * 15, 0, 0);
    const stopCount = intent.nonStop || tier === 'domestic' ? 0 : (i === 4 || (tier === 'longhaul' && i === 5) ? 1 : 0);
    const durationMinutes = baseDuration + ((seed + i * 19) % durationSpread) + (stopCount * (tier === 'regional' ? 75 : 120));
    const arrival = new Date(departure.getTime() + durationMinutes * 60_000);
    const cabinMultiplier = intent.travelClass === 'BUSINESS' ? 2.4 : intent.travelClass === 'FIRST' ? 4.2 : intent.travelClass === 'PREMIUM_ECONOMY' ? 1.45 : 1;
    const amount = Math.round((basePrice + ((seed + i * 19391) % Math.round(basePrice * 0.55))) * cabinMultiplier / 1000) * 1000;
    flights.push({
      id: `demo-${intent.origin}-${intent.destination}-${i + 1}`,
      airline: airline.name,
      airlineLogo: airline.logo,
      flightNumber: `${airline.code}${100 + ((seed + i * 37) % 800)}`,
      origin: intent.origin,
      destination: intent.destination,
      departureTime: toIsoLocal(departure),
      arrivalTime: toIsoLocal(arrival),
      durationMinutes,
      duration: `${Math.floor(durationMinutes / 60)}시간 ${durationMinutes % 60}분`,
      stops: stopCount,
      direct: stopCount === 0,
      price: { amount, currency: 'KRW' },
      travelClass: intent.travelClass || 'ECONOMY',
    });
  }

  return flights.sort((a, b) => a.price.amount - b.price.amount);
}

module.exports = { createDemoFlights };
