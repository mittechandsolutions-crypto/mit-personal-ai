# MIT — Personal AI assistant

MIT is a Next.js and TypeScript personal AI assistant with a robot-style voice-first interface, 15 specialist agents, SQLite/PostgreSQL conversation storage, and optional AI-provider integration.

## Run locally

Install Node.js 22.13 or newer, then open PowerShell in this folder:

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without AI settings, MIT runs in preview mode with example replies and still saves conversations to `data/mit.sqlite`.

## Connect Gemini AI

For natural, live AI replies, create an API key in [Google AI Studio](https://aistudio.google.com/apikey). Add it to `.env.local`:

```dotenv
MIT_AI_API_KEY=your-gemini-api-key
MIT_AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
MIT_AI_MODEL=gemini-3.5-flash-lite
```

The Gemini API has a free tier with usage limits; check Google's current [pricing and limits](https://ai.google.dev/gemini-api/docs/pricing). On its free tier, Google may use submitted content to improve its products. Keep API keys in hosting environment settings or `.env.local` only; MIT makes provider requests on the server and never sends the key to the browser. Restart the development server after changing `.env.local`.

Other OpenAI-compatible providers can be configured by changing `MIT_AI_BASE_URL` and `MIT_AI_MODEL`. Local servers such as Ollama can be used without an API key:

```dotenv
MIT_AI_BASE_URL=http://127.0.0.1:11434/v1
MIT_AI_MODEL=llama3.2
```

## Backend

- `POST /api/chat` validates prompts, selects an agent, calls the configured provider (or creates a labeled preview reply), and saves both messages.
- `GET /api/conversations` lists recent conversations.
- `GET /api/conversations/:id` loads a conversation and its messages.
- `DELETE /api/conversations/:id` deletes a conversation.
- `GET /api/status` reports whether a provider is configured.

MIT uses Node's built-in `node:sqlite` module for local development and automatically uses PostgreSQL when `DATABASE_URL` is set. The local SQLite database is stored at `data/mit.sqlite`; MIT creates the data folder automatically. Cloud deployments should set `DATABASE_URL` to a hosted PostgreSQL connection string so conversations persist across serverless instances.

## Available features

- 15 task-specific agents with search and category filters.
- Conversations and history stored by the backend in SQLite locally or PostgreSQL when deployed.
- Animated robot assistant with thinking, listening, and speaking states.
- Browser speech recognition and spoken replies when supported; browser microphone permission is required for voice input.
- Public-link conversations are isolated by an anonymous, HttpOnly browser session.
- Responsive layout for desktop and mobile.

MIT does not currently open apps, access local files, or control the computer. Without an AI provider key, it runs in preview mode; preview replies are examples, not live AI responses. Spoken replies use the browser's built-in speech synthesis.

## Deploy for free

This project is ready for Vercel and a hosted PostgreSQL database such as Neon's free tier. Conversation history is isolated per browser session, but the live site is public and the free AI provider quota is shared by everyone who uses the link.

1. Sign up for a free [Vercel](https://vercel.com/signup) account and import [this GitHub repository](https://github.com/mittechandsolutions-crypto/mit-personal-ai).
2. Create a free PostgreSQL project at [Neon](https://neon.tech/) and copy its connection string (`DATABASE_URL`).
3. In Vercel, open **Project Settings → Environment Variables** and add `DATABASE_URL`.
4. To turn on natural AI replies, also add `MIT_AI_API_KEY`, `MIT_AI_BASE_URL`, and `MIT_AI_MODEL` from the Gemini setup above.
5. Redeploy from Vercel. Open the production URL it gives you.

Vercel's Hobby plan and Neon's free plan have usage limits and terms; review their current plans before deploying. Without a Gemini API key, the site still opens but uses preview replies. Never commit `.env.local`, database connection strings, or provider API keys; secret files are ignored by Git.
