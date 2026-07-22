import { NextResponse } from 'next/server';
import { getMockReductionBubbles } from '@/data/ai-center-mock';

export async function GET() {
  return NextResponse.json({ success: true, data: getMockReductionBubbles() });
}
