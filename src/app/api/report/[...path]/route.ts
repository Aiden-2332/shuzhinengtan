/**
 * 合规碳排放报告 API 代理
 * 将前端请求转发到 Python FastAPI 后端服务
 */
import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND_URL = process.env.REPORT_BACKEND_URL || "http://localhost:8001";

async function proxyToPython(request: NextRequest, path: string) {
  const url = `${PYTHON_BACKEND_URL}/api/report/${path}`;
  
  const headers: Record<string, string> = {};
  if (request.headers.get("content-type")) {
    headers["content-type"] = request.headers.get("content-type")!;
  }

  try {
    const body = request.method !== "GET" && request.method !== "HEAD"
      ? await request.text()
      : undefined;

    const response = await fetch(url, {
      method: request.method,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      body,
    });

    // 如果是文件下载响应，直接返回
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/vnd.openxmlformats") || contentType.includes("application/pdf")) {
      const blob = await response.arrayBuffer();
      const filename = path.replace("download/", "");
      return new NextResponse(blob, {
        status: response.status,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`代理请求失败 [${path}]:`, error);
    return NextResponse.json(
      { error: "后端服务不可用，请确保 Python 报告服务已启动", detail: String(error) },
      { status: 503 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyToPython(request, path.join("/"));
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyToPython(request, path.join("/"));
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyToPython(request, path.join("/"));
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyToPython(request, path.join("/"));
}
