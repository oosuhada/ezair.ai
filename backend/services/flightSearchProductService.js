const amadeusService = require('./amadeusService');
const { createDemoFlights } = require('./demoSearchService');

function parseDurationMinutes(value) {
  if (!value) return 0;
  const match = String(value).match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!match) return 0;
  return Number(match[1] || 0) * 60 + Number(match[2] || 0);
}

function normalizeAmadeusOffers(payload, intent) {
  const offers = Array.isArray(payload?.data) ? payload.data : [];
  const carriers = payload?.dictionaries?.carriers || {};
  return offers.map((offer, index) => {
    const itinerary = offer.itineraries?.[0] || {};
    const segments = itinerary.segments || [];
    const first = segments[0] || {};
    const last = segments[segments.length - 1] || first;
    const carrierCode = first.carrierCode || 'AIR';
    const durationMinutes = parseDurationMinutes(itinerary.duration);
    const amount = Number(offer.price?.grandTotal || offer.price?.total || 0);
    return {
      id: offer.id || `amadeus-${index + 1}`,
      airline: carriers[carrierCode] || carrierCode,
      airlineLogo: '/image/flightResult/result_airseoul.svg',
      flightNumber: `${carrierCode}${first.number || ''}`,
      origin: first.departure?.iataCode || intent.origin,
      destination: last.arrival?.iataCode || intent.destination,
      departureTime: first.departure?.at || `${intent.departDate}T00:00:00`,
      arrivalTime: last.arrival?.at || `${intent.departDate}T00:00:00`,
      durationMinutes,
      duration: durationMinutes ? `${Math.floor(durationMinutes / 60)}시간 ${durationMinutes % 60}분` : itinerary.duration || '시간 정보 확인 필요',
      stops: Math.max(0, segments.length - 1),
      direct: segments.length <= 1,
      price: {
        amount: Number.isFinite(amount) ? amount : 0,
        currency: offer.price?.currency || 'KRW',
      },
      travelClass: intent.travelClass || 'ECONOMY',
    };
  }).filter((flight) => flight.price.amount > 0);
}

async function searchFlightsForProduct(intent) {
  const hasAmadeus = Boolean(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET);
  if (hasAmadeus) {
    try {
      const payload = await amadeusService.searchFlights({
        origin: intent.origin,
        destination: intent.destination,
        departDate: intent.departDate,
        returnDate: intent.returnDate,
        adults: intent.adults || 1,
        travelClass: intent.travelClass || 'ECONOMY',
        nonStop: Boolean(intent.nonStop),
      });
      const flights = normalizeAmadeusOffers(payload, intent);
      if (flights.length > 0) {
        return { flights, sourceMode: 'amadeus', sourceLabel: 'Amadeus test API' };
      }
    } catch (error) {
      console.error('[AI Search] Amadeus search failed; using deterministic demo fallback:', error.message);
      return {
        flights: createDemoFlights(intent),
        sourceMode: 'demo',
        sourceLabel: '데모 데이터',
        providerWarning: '실시간 공급자 검색이 일시적으로 실패해 동일 조건의 재현 가능한 데모 결과를 보여드리고 있어요.',
      };
    }
  }

  return {
    flights: createDemoFlights(intent),
    sourceMode: 'demo',
    sourceLabel: '데모 데이터',
    providerWarning: 'Amadeus 자격 증명이 없는 환경이라 재현 가능한 데모 결과를 보여드리고 있어요.',
  };
}

module.exports = { searchFlightsForProduct, normalizeAmadeusOffers };
