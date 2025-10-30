import { NextRequest, NextResponse } from "next/server";

function buildTargetUrl(segments: string[], searchParams: URLSearchParams) {
  const base = (process.env.GATEWAY_URL || "http://localhost:3005/proxy").replace(/\/$/, "");
  const path = segments.join("/");
  const url = `${base}/api/${path}`;
  const qs = searchParams.toString();
  return qs ? `${url}?${qs}` : url;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params;
  const target = buildTargetUrl(segments || [], request.nextUrl.searchParams);
  try {
    const res = await fetch(target, {
      method: "GET",
      headers: {
        // Propagar encabezados relevantes, sin incluir los hop-by-hop
        "Content-Type": "application/json",
        Authorization: request.headers.get("authorization") || "",
        "x-callback-url": request.headers.get("x-callback-url") || "",
      },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Gateway request failed" }, { status: 502 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params;
  const target = buildTargetUrl(segments || [], request.nextUrl.searchParams);
  const body = await request.text();
  try {
    const res = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") || "application/json",
        Authorization: request.headers.get("authorization") || "",
        "x-callback-url": request.headers.get("x-callback-url") || "",
      },
      body,
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Gateway request failed" }, { status: 502 });
  }
}