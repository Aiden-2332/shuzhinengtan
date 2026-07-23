import { NextRequest, NextResponse } from 'next/server';
import { FetchClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new FetchClient(config, customHeaders);

    const response = await client.fetch(url);

    const textContent = response.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n');

    return NextResponse.json({
      title: response.title,
      text: textContent,
      status: response.status_code === 0 ? 'success' : 'failed',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
