export type FlightResult = {
  id: string;
  airline: string;
  flightNumber?: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price?: { amount?: number; currency?: string };
  recommendationReason?: string;
  recommendationScore?: number;
};

function formatPrice(flight: FlightResult) {
  const amount = flight.price?.amount;
  if (!amount) return '가격 정보 없음';
  return `${amount.toLocaleString('ko-KR')} ${flight.price?.currency || 'KRW'}`;
}

export function FlightResults({ flights }: { flights: FlightResult[] }) {
  if (!flights.length) return <p style={{ color: '#64748b' }}>검색 결과가 아직 없습니다.</p>;
  return (
    <div className="grid" style={{ marginTop: 16 }}>
      {flights.map((flight) => (
        <article className="card" key={flight.id}>
          <strong>{flight.airline}</strong>
          <p>{flight.flightNumber}</p>
          <p>{flight.origin} → {flight.destination}</p>
          <p>{flight.departureTime} / {flight.arrivalTime}</p>
          <p>{flight.duration}</p>
          <strong>{formatPrice(flight)}</strong>
          {flight.recommendationReason ? <p style={{ color: '#2563eb' }}>{flight.recommendationReason}</p> : null}
        </article>
      ))}
    </div>
  );
}
