import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getTopLevelKeys(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return Object.keys(value);
}

export async function POST(request: Request) {
  const body = await request.text();
  let canParseJson = false;
  let parsedKeys: string[] = [];

  try {
    const parsed = JSON.parse(body) as unknown;
    canParseJson = true;
    parsedKeys = getTopLevelKeys(parsed);
  } catch {
    canParseJson = false;
  }

  return NextResponse.json({
    method: request.method,
    host: request.headers.get("host"),
    contentType: request.headers.get("content-type"),
    contentLength: request.headers.get("content-length"),
    bodyLength: body.length,
    bodyPrefix: body.slice(0, 30),
    canParseJson,
    parsedKeys,
  });
}
