import { NextResponse } from "next/server";
import { listConversations } from "@/lib/db";
import { getSession, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = getSession(request);
    return setSessionCookie(
      NextResponse.json({ conversations: await listConversations(session.id) }),
      session.setCookie
    );
  } catch (error) {
    console.error("Could not load MIT conversations:", error);
    return NextResponse.json({ error: "Could not load conversation history." }, { status: 500 });
  }
}
