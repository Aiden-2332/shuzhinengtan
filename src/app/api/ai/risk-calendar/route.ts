import { NextResponse } from 'next/server';
import { getMockRiskCalendar } from '@/data/ai-center-mock';

export async function GET() {
  return NextResponse.json({ success: true, data: getMockRiskCalendar() });
}
