import { NextRequest, NextResponse } from 'next/server';
import { flightSearchRequestSchema } from '@/lib/schemas';
import { normalizeFlightOffers, searchFlights } from '@/lib/amadeus';

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = flightSearchRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'VALIDATION_ERROR', issues: parsed.error.issues }, { status: 400 });
  }
  try {
    const raw = await searchFlights(parsed.data);
    return NextResponse.json({ raw, flights: normalizeFlightOffers(raw) });
  } catch {
    return NextResponse.json({ error: 'FLIGHT_PROVIDER_ERROR', message: '항공권 검색 중 오류가 발생했습니다.' }, { status: 502 });
  }
}
