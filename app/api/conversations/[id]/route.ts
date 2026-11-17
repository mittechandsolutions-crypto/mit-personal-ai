import { NextResponse } from "next/server";
import { deleteConversation, getConversation } from "@/lib/db";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    const conversation = getConversation(id);
    if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Could not load MIT conversation:", error);
    return NextResponse.json({ error: "Could not load this conversation." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    if (!deleteConversation(id)) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Could not delete MIT conversation:", error);
    return NextResponse.json({ error: "Could not delete this conversation." }, { status: 500 });
  }
}
