import { NextRequest, NextResponse } from 'next/server';
import { getMockPredictionCurve } from '@/data/ai-center-mock';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get('period') || '30d') as '30d' | '60d' | '90d';
  const data = getMockPredictionCurve(period);
  return NextResponse.json({ success: true, data });
}
