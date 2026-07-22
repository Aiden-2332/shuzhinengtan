import { NextRequest, NextResponse } from 'next/server';
import { getMockAnomalyTimeline } from '@/data/ai-center-mock';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const anomalyId = url.pathname.split('/').pop() || '';
  return NextResponse.json({ success: true, data: getMockAnomalyTimeline(anomalyId) });
}
