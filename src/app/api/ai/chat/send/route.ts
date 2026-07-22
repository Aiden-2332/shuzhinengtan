import { NextRequest, NextResponse } from 'next/server';
import { getMockChatResponse } from '@/data/ai-center-mock';

export async function POST(request: NextRequest) {
  const body = await request.json() as { message: string; conversationId?: string };
  const response = getMockChatResponse(body.message);
  return NextResponse.json({
    success: true,
    data: {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: response.answer,
      timestamp: new Date().toISOString(),
      sources: response.sources,
      confidence: response.confidence,
    },
  });
}
