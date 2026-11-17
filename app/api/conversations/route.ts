import { NextResponse } from "next/server";
import { listConversations } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ conversations: listConversations() });
  } catch (error) {
    console.error("Could not load MIT conversations:", error);
    return NextResponse.json({ error: "Could not load conversation history." }, { status: 500 });
  }
}
