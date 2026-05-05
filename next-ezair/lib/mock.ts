export function buildMockFlights(query: string) {
  const normalized = query.toLowerCase();
  const isJeju = normalized.includes('제주');
  const origin = normalized.includes('부산') ? 'PUS' : 'GMP';
  const destination = isJeju ? 'CJU' : normalized.includes('오사카') ? 'KIX' : normalized.includes('도쿄') ? 'HND' : 'JFK';
  const departDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return {
    mode: 'MOCK' as const,
    aiInsight: `${origin} → ${destination} mock 항공편을 찾았습니다.`,
    intent: { originIata: origin, destinationIata: destination, departDate, adults: 1, travelClass: 'ECONOMY', nonStop: true },
    flights: [
      {
        id: `mock-${origin}-${destination}-1`,
        airline: '대한항공',
        airlineCode: 'KE',
        flightNumber: 'KE1201',
        origin,
        destination,
        departureTime: `${departDate}T07:00:00`,
        arrivalTime: `${departDate}T08:10:00`,
        duration: '1시간 10분',
        stops: 0,
        direct: true,
        price: { amount: 59000, currency: 'KRW' },
        recommendation: 'direct',
      },
      {
        id: `mock-${origin}-${destination}-2`,
        airline: '티웨이항공',
        airlineCode: 'TW',
        flightNumber: 'TW301',
        origin,
        destination,
        departureTime: `${departDate}T12:00:00`,
        arrivalTime: `${departDate}T13:10:00`,
        duration: '1시간 10분',
        stops: 0,
        direct: true,
        price: { amount: 39000, currency: 'KRW' },
        recommendation: 'special',
      },
    ],
    followUpActions: ['더 저렴한 날짜 찾아줘', '직항만 보여줘', '하루 전후로 비교해줘'],
    cached: false,
  };
}
