type Flight = {
  price?: { amount?: number; currency?: string };
  stops?: number;
  direct?: boolean;
  duration?: string;
  departureTime?: string;
  arrivalTime?: string;
  [key: string]: unknown;
};

type Intent = {
  nonStop?: boolean;
  purpose?: 'LEISURE' | 'BUSINESS' | 'FAMILY' | 'UNKNOWN';
};

function parseDurationMinutes(duration?: string): number {
  if (!duration) return 9999;
  const iso = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (iso) return Number(iso[1] || 0) * 60 + Number(iso[2] || 0);
  const ko = duration.match(/(?:(\d+)시간)?\s*(?:(\d+)분)?/);
  if (ko) return Number(ko[1] || 0) * 60 + Number(ko[2] || 0);
  return 9999;
}

function getHour(dateTime?: string): number | null {
  if (!dateTime) return null;
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return null;
  return date.getHours();
}

export function rankFlights<T extends Flight>(flights: T[], intent: Intent = {}) {
  if (!Array.isArray(flights) || flights.length === 0) return [];
  const prices = flights.map((flight) => Number(flight.price?.amount || 0)).filter((price) => price > 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = Math.max(maxPrice - minPrice, 1);

  return flights
    .map((flight) => {
      let score = 50;
      const price = Number(flight.price?.amount || maxPrice || 0);
      score += price > 0 ? 30 * (1 - (price - minPrice) / priceRange) : 0;

      const stops = Number(flight.stops ?? (flight.direct ? 0 : 1));
      score += Math.max(0, 15 - stops * 8);
      if (intent.nonStop && flight.direct) score += 10;

      const duration = parseDurationMinutes(flight.duration);
      score += Math.max(0, 10 - Math.min(duration / 120, 10));

      const arrivalHour = getHour(flight.arrivalTime);
      if (intent.purpose === 'BUSINESS' && arrivalHour !== null && arrivalHour <= 11) score += 8;

      const reasonParts = [];
      if (price === minPrice) reasonParts.push('가격이 가장 낮습니다');
      if (flight.direct) reasonParts.push('직항입니다');
      if (intent.purpose === 'BUSINESS' && arrivalHour !== null && arrivalHour <= 11) reasonParts.push('출장에 적합한 오전 도착입니다');
      if (reasonParts.length === 0) reasonParts.push('가격과 소요시간의 균형이 좋습니다');

      return {
        ...flight,
        recommendationScore: Math.round(score),
        recommendationReason: reasonParts.join(', '),
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
}
