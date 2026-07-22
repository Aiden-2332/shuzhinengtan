import { NextRequest, NextResponse } from 'next/server';
import { getMockOptimizationPath } from '@/data/ai-center-mock';

export async function POST(request: NextRequest) {
  const body = await request.json() as { constraints?: { budget?: number; minPayback?: number } };
  const budget = body.constraints?.budget || 500;
  const path = getMockOptimizationPath(budget);
  return NextResponse.json({ success: true, data: path });
}
