import { NextRequest, NextResponse } from 'next/server';
import { searchLocations } from '@/lib/amadeus';

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get('keyword') || '';
  if (keyword.trim().length < 2) {
    return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'keyword는 최소 2글자 이상이어야 합니다.' }, { status: 400 });
  }
  try {
    const data = await searchLocations(keyword);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'LOCATION_PROVIDER_ERROR', message: '공항/도시 검색 중 오류가 발생했습니다.' }, { status: 502 });
  }
}
