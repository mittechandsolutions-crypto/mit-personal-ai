import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const databaseDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(databaseDirectory, "mit.sqlite");
mkdirSync(databaseDirectory, { recursive: true });

const globalForDatabase = globalThis as typeof globalThis & { mitDatabase?: DatabaseSync };

export const db = globalForDatabase.mitDatabase ?? new DatabaseSync(databasePath);

if (process.env.NODE_ENV !== "production") globalForDatabase.mitDatabase = db;

db.exec("PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    agent TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id, id);
`);

export type ConversationSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
};

export type ConversationMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  agent: string | null;
  createdAt: string;
};

export function listConversations(): ConversationSummary[] {
  const rows = db.prepare(`
    SELECT c.id, c.title, c.created_at AS createdAt, c.updated_at AS updatedAt,
      COUNT(m.id) AS messageCount
    FROM conversations c LEFT JOIN messages m ON m.conversation_id = c.id
    GROUP BY c.id ORDER BY c.updated_at DESC LIMIT 50
  `).all();
  return rows.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
    messageCount: Number(row.messageCount)
  }));
}

export function getConversation(id: string) {
  const row = db.prepare(`
    SELECT id, title, created_at AS createdAt, updated_at AS updatedAt
    FROM conversations WHERE id = ?
  `).get(id);
  if (!row) return null;

  const messageRows = db.prepare(`
    SELECT id, role, content, agent, created_at AS createdAt
    FROM messages WHERE conversation_id = ? ORDER BY id
  `).all(id);
  const messages: ConversationMessage[] = messageRows.map((message) => ({
    id: Number(message.id),
    role: String(message.role) as ConversationMessage["role"],
    content: String(message.content),
    agent: message.agent === null ? null : String(message.agent),
    createdAt: String(message.createdAt)
  }));
  return {
    id: String(row.id),
    title: String(row.title),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
    messages
  };
}

export function createConversation(title: string) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare("INSERT INTO conversations (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)")
    .run(id, title, now, now);
  return id;
}

export function addMessage(conversationId: string, role: "user" | "assistant", content: string, agent: string | null = null) {
  const now = new Date().toISOString();
  db.prepare("INSERT INTO messages (conversation_id, role, content, agent, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(conversationId, role, content, agent, now);
  db.prepare("UPDATE conversations SET updated_at = ? WHERE id = ?").run(now, conversationId);
}

export function deleteConversation(id: string) {
  return db.prepare("DELETE FROM conversations WHERE id = ?").run(id).changes > 0;
}
