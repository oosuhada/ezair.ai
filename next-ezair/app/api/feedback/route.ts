import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveFeedback } from '@/lib/repositories/searchRepository';

const feedbackSchema = z.object({
  searchRequestId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  selectedOfferId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'VALIDATION_ERROR', issues: parsed.error.issues }, { status: 400 });
  }
  await saveFeedback(parsed.data);
  return NextResponse.json({ ok: true });
}
