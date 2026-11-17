# MIT — Personal AI assistant

MIT is a Next.js and TypeScript personal AI assistant with a robot-style voice-first interface, 15 specialist agents, a local SQLite conversation database, and optional AI-provider integration.

## Run locally

Install Node.js 22.13 or newer, then open PowerShell in this folder:

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without AI settings, MIT runs in preview mode with example replies and still saves conversations to `data/mit.sqlite`.

## Connect an AI provider

Copy `.env.example` to `.env.local` and set your provider options:

```dotenv
MIT_AI_API_KEY=your-provider-api-key
MIT_AI_BASE_URL=https://api.openai.com/v1
MIT_AI_MODEL=gpt-4o-mini
```

Restart the development server after editing `.env.local`. MIT makes provider requests on the server, so API keys are never sent to the browser. Local OpenAI-compatible servers such as Ollama can be used without an API key:

```dotenv
MIT_AI_BASE_URL=http://127.0.0.1:11434/v1
MIT_AI_MODEL=llama3.2
```

## Backend

- `POST /api/chat` validates prompts, selects an agent, calls the configured provider (or creates a labeled preview reply), and saves both messages to SQLite.
- `GET /api/conversations` lists recent conversations.
- `GET /api/conversations/:id` loads a conversation and its messages.
- `DELETE /api/conversations/:id` deletes a conversation.
- `GET /api/status` reports whether a provider is configured.

MIT uses Node's built-in `node:sqlite` module; no separate database server or native package install is required. The local SQLite database is stored at `data/mit.sqlite`, and MIT creates the data folder automatically. A multi-instance or serverless deployment should use a shared database such as PostgreSQL instead of a local SQLite file.

## Available features

- 15 task-specific agents with search and category filters.
- Conversations and history stored by the backend in SQLite.
- Animated robot assistant with thinking, listening, and speaking states.
- Browser speech recognition and spoken replies when supported; browser microphone permission is required for voice input.
- Responsive layout for desktop and mobile.

MIT does not currently open apps, access local files, or control the computer. Connect an AI provider for live AI responses; preview replies are examples, not live AI responses. Spoken replies use the browser's built-in speech synthesis.

## Publish the source on GitHub

Sign in with GitHub CLI using `gh auth login`, then create and push a repository from this folder:

```powershell
gh repo create mit-personal-ai --source . --remote origin --push
```

Choose public or private visibility when GitHub CLI prompts. Never commit `.env.local` or provider API keys; they are ignored by Git.
