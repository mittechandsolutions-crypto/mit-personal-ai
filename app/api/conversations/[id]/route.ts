import { NextResponse } from "next/server";
import { deleteConversation, getConversation } from "@/lib/db";
import { getSession, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const session = getSession(_request);
  try {
    const conversation = await getConversation(id, session.id);
    if (!conversation) return setSessionCookie(NextResponse.json({ error: "Conversation not found." }, { status: 404 }), session.setCookie);
    return setSessionCookie(NextResponse.json({ conversation }), session.setCookie);
  } catch (error) {
    console.error("Could not load MIT conversation:", error);
    return setSessionCookie(NextResponse.json({ error: "Could not load this conversation." }, { status: 500 }), session.setCookie);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const session = getSession(request);
  try {
    if (!await deleteConversation(id, session.id)) {
      return setSessionCookie(NextResponse.json({ error: "Conversation not found." }, { status: 404 }), session.setCookie);
    }
    return setSessionCookie(NextResponse.json({ success: true }), session.setCookie);
  } catch (error) {
    console.error("Could not delete MIT conversation:", error);
    return setSessionCookie(NextResponse.json({ error: "Could not delete this conversation." }, { status: 500 }), session.setCookie);
  }
}
