import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'next-ezair', timestamp: new Date().toISOString() });
}
