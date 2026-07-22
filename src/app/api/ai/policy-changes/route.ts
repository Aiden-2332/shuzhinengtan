import { NextResponse } from 'next/server';
import { getMockPolicyChanges } from '@/data/ai-center-mock';

export async function GET() {
  return NextResponse.json({ success: true, data: getMockPolicyChanges() });
}
