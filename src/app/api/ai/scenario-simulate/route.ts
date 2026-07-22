import { NextRequest, NextResponse } from 'next/server';
import { getMockScenarioResults } from '@/data/ai-center-mock';
import type { ScenarioConfig } from '@/stores/ai-center-store';

export async function POST(request: NextRequest) {
  const body = await request.json() as ScenarioConfig[];
  const results = getMockScenarioResults(body);
  return NextResponse.json({ success: true, data: results });
}
