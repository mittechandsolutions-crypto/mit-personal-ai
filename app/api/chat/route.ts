import { NextResponse } from "next/server";
import { addMessage, createConversation, getConversation } from "@/lib/db";
import { agents, detectAgent, previewReply } from "@/lib/agents";

export const runtime = "nodejs";
export const maxDuration = 60;

const systemPrompt = [
  "You are MIT, a helpful personal AI assistant.",
  "Reply in the user's language and style, including Roman Urdu when appropriate.",
  "Be clear, friendly, and practical. Ask a brief clarifying question when needed.",
  "Never claim to have opened apps, accessed files, or performed real-world actions unless a connected tool confirms it.",
  "You can provide advice and drafts, but you cannot directly control the user's device."
].join(" ");

function isChatBody(value: unknown): value is { prompt: string; agent?: string; conversationId?: string | null } {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return typeof body.prompt === "string" && body.prompt.trim().length > 0 &&
    body.prompt.length <= 8000 &&
    (body.agent === undefined || (typeof body.agent === "string" && body.agent.length <= 80)) &&
    (body.conversationId === undefined || body.conversationId === null ||
      (typeof body.conversationId === "string" && body.conversationId.length <= 80));
}

async function getAIReply(agent: string, messages: Array<{ role: "user" | "assistant"; content: string }>) {
  const apiKey = process.env.MIT_AI_API_KEY;
  const baseUrl = (process.env.MIT_AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = process.env.MIT_AI_MODEL || "gpt-4o-mini";
  const localProvider = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i.test(baseUrl);
  const configured = Boolean(apiKey) || (Boolean(process.env.MIT_AI_BASE_URL) && localProvider);

  if (!configured) return { reply: previewReply(messages[messages.length - 1].content), mode: "preview" as const };

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: `${systemPrompt} You are currently acting as the ${agent}.` }, ...messages]
      }),
      signal: AbortSignal.timeout(60000)
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") throw new Error("The AI service timed out.");
    throw new Error("The AI service could not be reached.");
  }

  if (!response.ok) throw new Error(`The AI provider returned HTTP ${response.status}. Check your provider settings.`);

  let result: { choices?: Array<{ message?: { content?: unknown } }> };
  try {
    result = await response.json();
  } catch {
    throw new Error("The AI provider returned an invalid response.");
  }
  const reply = result.choices?.[0]?.message?.content;
  if (typeof reply !== "string" || !reply.trim()) throw new Error("The AI provider response did not contain a reply.");
  return { reply, mode: "connected" as const };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!isChatBody(body)) {
    return NextResponse.json({ error: "Provide a message under 8,000 characters." }, { status: 400 });
  }

  const agent = body.agent || "Auto agent";
  if (agent !== "Auto agent" && !agents.some((item) => item.name === agent)) {
    return NextResponse.json({ error: "Select one of MIT's available agents." }, { status: 400 });
  }
  const selectedAgent = agent === "Auto agent" ? detectAgent(body.prompt) : agent;
  let conversationId = body.conversationId ?? undefined;

  try {
    if (conversationId && !getConversation(conversationId)) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }
    if (!conversationId) {
      const title = body.prompt.length > 50 ? `${body.prompt.slice(0, 47)}...` : body.prompt;
      conversationId = createConversation(title);
    }

    addMessage(conversationId, "user", body.prompt);
    const conversation = getConversation(conversationId);
    if (!conversation) throw new Error("Conversation could not be loaded after saving.");
    const messages = conversation.messages.slice(-40).map(({ role, content }) => ({ role, content }));
    const result = await getAIReply(selectedAgent, messages);
    addMessage(conversationId, "assistant", result.reply, selectedAgent);

    return NextResponse.json({
      conversationId,
      reply: result.reply,
      agent: selectedAgent,
      mode: result.mode
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The AI request failed.";
    console.error("MIT chat request failed:", error);
    return NextResponse.json({ error: message, ...(conversationId ? { conversationId } : {}) }, { status: 502 });
  }
}
