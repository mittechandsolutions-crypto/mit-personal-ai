import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const baseUrl = process.env.MIT_AI_BASE_URL || "https://api.openai.com/v1";
  const isLocalProvider = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i.test(baseUrl);
  const connected = Boolean(process.env.MIT_AI_API_KEY) ||
    (Boolean(process.env.MIT_AI_BASE_URL) && isLocalProvider);

  return NextResponse.json({ mode: connected ? "connected" : "preview" });
}
