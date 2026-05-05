import { NextRequest, NextResponse } from 'next/server';
import { parseFlightQuery } from '@/lib/gemini';
import { normalizeFlightOffers, searchFlights } from '@/lib/amadeus';
import { getCachedApiResponse, setCachedApiResponse } from '@/lib/repositories/cacheRepository';
import { saveFlightOfferSnapshots, saveSearchRequest } from '@/lib/repositories/searchRepository';
import { buildMockFlights } from '@/lib/mock';
import { rankFlights } from '@/lib/ranking';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const query = typeof body?.query === 'string' ? body.query.trim() : '';
  if (!query) {
    return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'query가 필요합니다.' }, { status: 400 });
  }

  if ((process.env.AI_SEARCH_MODE || 'mock') === 'mock') {
    const mock = buildMockFlights(query);
    const ranked = { ...mock, flights: rankFlights(mock.flights, mock.intent as any) };
    try {
      const saved = await saveSearchRequest({ queryText: query, parsedParams: ranked.intent });
      await saveFlightOfferSnapshots(saved.id, ranked.flights);
      return NextResponse.json({ ...ranked, searchRequestId: saved.id });
    } catch {
      return NextResponse.json(ranked);
    }
  }

  try {
    const intent = await parseFlightQuery(query);
    if (intent.needsClarification) {
      return NextResponse.json({
        mode: 'CLARIFICATION',
        question: intent.clarificationQuestion || '검색 조건을 조금 더 구체적으로 알려주세요.',
        intent,
        flights: [],
        followUpActions: [],
      });
    }

    if (!intent.originIata || !intent.destinationIata) {
      return NextResponse.json({
        mode: 'CLARIFICATION',
        question: '출발지와 도착 공항을 정확히 알려주세요.',
        intent,
        flights: [],
        followUpActions: [],
      });
    }

    const cacheKey = `ai:${intent.originIata}:${intent.destinationIata}:${intent.departDate}:${intent.returnDate || ''}:${intent.adults}:${intent.travelClass}:${intent.nonStop}`;
    const cached = await getCachedApiResponse<unknown>(cacheKey);
    if (cached) return NextResponse.json({ ...(cached as object), cached: true });

    const raw = await searchFlights({
      origin: intent.originIata,
      destination: intent.destinationIata,
      departDate: intent.departDate,
      returnDate: intent.returnDate,
      adults: intent.adults,
      travelClass: intent.travelClass,
      nonStop: intent.nonStop,
    });
    const flights = rankFlights(normalizeFlightOffers(raw), intent);
    const responseBody = {
      mode: 'RESULTS' as const,
      aiInsight: `${intent.originIata} → ${intent.destinationIata} 항공편 ${flights.length}개를 찾았습니다.`,
      intent,
      flights,
      followUpActions: ['더 저렴한 날짜 찾아줘', '직항만 보여줘', '하루 전후로 비교해줘'],
      cached: false,
    };

    try {
      const saved = await saveSearchRequest({
        queryText: query,
        parsedParams: intent,
        originIata: intent.originIata,
        destinationIata: intent.destinationIata,
        departDate: intent.departDate,
        returnDate: intent.returnDate,
        adults: intent.adults,
        travelClass: intent.travelClass,
        nonStop: intent.nonStop,
      });
      await saveFlightOfferSnapshots(saved.id, flights);
      await setCachedApiResponse(cacheKey, { ...responseBody, searchRequestId: saved.id }, 300);
      return NextResponse.json({ ...responseBody, searchRequestId: saved.id });
    } catch {
      await setCachedApiResponse(cacheKey, responseBody, 300);
      return NextResponse.json(responseBody);
    }
  } catch {
    return NextResponse.json({ error: 'AI_SEARCH_ERROR', message: 'AI 항공권 검색 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
