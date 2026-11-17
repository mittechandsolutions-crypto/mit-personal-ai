"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type Ref } from "react";
import { agents, categories, type Agent } from "@/lib/agents";

type View = "home" | "chat" | "agents" | "history";
type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  agent: string | null;
  createdAt: string;
};
type ConversationSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
};
type Conversation = ConversationSummary & { messages: Message[] };
type ApiResult<T> = T & { error?: string };

const suggestions = [
  { icon: "◷", label: "Plan my day", prompt: "Help me organize my day. I have a lot on my plate." },
  { icon: "↗", label: "Write an email", prompt: "Write a friendly, professional email asking to reschedule a meeting." },
  { icon: "⌘", label: "Explain something", prompt: "Explain compound interest in simple terms with an example." },
  { icon: "✳", label: "Brainstorm ideas", prompt: "Give me five creative ideas for a small weekend project." }
];

function AgentIcon({ agent }: { agent: Pick<Agent, "icon" | "color" | "tint"> }) {
  return <span className="agent-icon" style={{ background: agent.color, color: agent.tint }}>{agent.icon}</span>;
}

function RobotAvatar({ state }: { state: "idle" | "listening" | "thinking" | "speaking" }) {
  return (
    <div className={`robot-avatar robot-${state}`} role="img" aria-label={`MIT assistant ${state}`}>
      <div className="robot-antenna"><i /></div>
      <div className="robot-head">
        <div className="robot-ear robot-ear-left" />
        <div className="robot-face">
          <div className="robot-eyes"><i /><i /></div>
          <div className="robot-mouth" />
        </div>
        <div className="robot-ear robot-ear-right" />
      </div>
      <div className="robot-neck" />
      <div className="robot-shoulders" />
    </div>
  );
}

function Icon({ name }: { name: "grid" | "agents" | "history" | "plus" | "menu" | "search" | "mic" | "send" | "settings" }) {
  const paths = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    agents: <><circle cx="12" cy="8" r="3.25" /><path d="M5.5 19c.6-3.1 3-5 6.5-5s5.9 1.9 6.5 5M19 8v5M16.5 10.5h5" /></>,
    history: <><path d="M3.5 12a8.5 8.5 0 1 0 2.2-5.7L3.5 8.5" /><path d="M3.5 4.5v4h4M12 7v5l3 2" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    mic: <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3m-4 0h8" /></>,
    send: <><path d="m5 12 14-7-4.5 14-2.8-5.7L5 12Z" /><path d="m11.7 13.3 4.8-4.8" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1 1.7-1.6 2.8-2-.5a7.7 7.7 0 0 1-1.5.9l-.5 2h-3.2l-.5-2a7.7 7.7 0 0 1-1.5-.9l-2 .5-1.6-2.8 1.1-1.7a7 7 0 0 1 0-1.8l-1.1-1.7 1.6-2.8 2 .5a7.7 7.7 0 0 1 1.5-.9l.5-2h3.2l.5 2a7.7 7.7 0 0 1 1.5.9l2-.5 1.6 2.8-1.1 1.7a7 7 0 0 1 0 1.8Z" /></>
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function Composer({
  value,
  onChange,
  onSubmit,
  selectedAgent,
  onAgentClick,
  agentMenuOpen,
  onAgentSelect,
  onVoice,
  isRecording,
  isLoading,
  inputRef,
  compact = false
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  selectedAgent: string;
  onAgentClick?: () => void;
  agentMenuOpen?: boolean;
  onAgentSelect?: (name: string) => void;
  onVoice?: () => void;
  isRecording?: boolean;
  isLoading: boolean;
  inputRef?: Ref<HTMLTextAreaElement>;
  compact?: boolean;
}) {
  const options = useMemo(() => [
    { name: "Auto agent", icon: "✳", color: "#30273d", tint: "#cfadff", description: "MIT picks the best fit for your task." },
    ...agents
  ], []);

  function resizeTextarea(element: HTMLTextAreaElement) {
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 145)}px`;
  }

  return (
    <div className={`composer-wrap${compact ? " conversation-composer" : ""}`}>
      <form className={`composer${compact ? " compact-composer" : ""}`} onSubmit={onSubmit}>
        <label className="sr-only" htmlFor={compact ? "reply-input" : "prompt-input"}>
          {compact ? "Continue your conversation with MIT" : "Tell MIT what you need"}
        </label>
        <textarea
          id={compact ? "reply-input" : "prompt-input"}
          ref={inputRef}
          rows={1}
          required
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            resizeTextarea(event.target);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={compact ? "Keep the conversation going..." : "Ask MIT anything, or tell it what you need..."}
        />
        <div className="composer-footer">
          {compact ? (
            <div className="composer-tools">
              <span className="conversation-agent">✳ {selectedAgent}</span>
              {onVoice && <button className={`tool-button voice-button${isRecording ? " recording" : ""}`} type="button" onClick={onVoice} aria-label="Use voice input"><Icon name="mic" /><span>Voice</span></button>}
            </div>
          ) : (
            <div className="composer-tools">
              <button className={`tool-button agent-trigger${agentMenuOpen ? " selected" : ""}`} type="button" onClick={onAgentClick} aria-expanded={agentMenuOpen}>
                <span className="tool-spark">✳</span><span>{selectedAgent}</span><span className="chevron">⌄</span>
              </button>
              <span className="tool-divider" />
              <button className={`tool-button voice-button${isRecording ? " recording" : ""}`} type="button" onClick={onVoice} aria-label="Use voice input">
                <Icon name="mic" /><span>Voice</span>
              </button>
            </div>
          )}
          <button className="send-button" type="submit" aria-label="Send message" disabled={isLoading || !value.trim()}>
            {isLoading ? <span className="loading-spinner" /> : <Icon name="send" />}
          </button>
        </div>
      </form>
      {agentMenuOpen && onAgentSelect && (
        <div className="agent-menu" role="listbox" aria-label="Choose an AI agent">
          {options.map((agent) => (
            <button
              className={`agent-option${selectedAgent === agent.name ? " selected" : ""}`}
              key={agent.name}
              role="option"
              aria-selected={selectedAgent === agent.name}
              type="button"
              onClick={() => onAgentSelect(agent.name)}
            >
              <AgentIcon agent={agent} />
              <span className="agent-option-copy"><strong>{agent.name}</strong><small>{agent.description}</small></span>
            </button>
          ))}
        </div>
      )}
      {!compact && <div className="composer-note"><span className="lock-icon">◇</span>Your conversations are saved in MIT&apos;s local database.</div>}
    </div>
  );
}

export default function MITWorkspace() {
  const [view, setView] = useState<View>("home");
  const [selectedAgent, setSelectedAgent] = useState("Auto agent");
  const [agentMenuOpen, setAgentMenuOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [aiMode, setAiMode] = useState<"preview" | "connected">("preview");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [disclaimer, setDisclaimer] = useState("Preview replies are generated locally and may not always be accurate.");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3300);
  }, []);

  const refreshConversations = useCallback(async () => {
    const response = await fetch("/api/conversations");
    const data = await response.json() as ApiResult<{ conversations: ConversationSummary[] }>;
    if (!response.ok) throw new Error(data.error || "Could not load conversation history.");
    setConversations(data.conversations);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/status").then(async (response) => {
        if (!response.ok) throw new Error("Could not check the AI service.");
        return response.json() as Promise<{ mode: "preview" | "connected" }>;
      }),
      fetch("/api/conversations").then(async (response) => {
        const data = await response.json() as ApiResult<{ conversations: ConversationSummary[] }>;
        if (!response.ok) throw new Error(data.error || "Could not load conversation history.");
        return data.conversations;
      })
    ]).then(([status, savedConversations]) => {
      if (!active) return;
      setAiMode(status.mode);
      setConversations(savedConversations);
      if (status.mode === "connected") setDisclaimer("AI replies come from your connected provider and may not always be accurate.");
    }).catch((error: unknown) => {
      if (active) showToast(error instanceof Error ? error.message : "MIT could not connect to its backend.");
    });
    return () => {
      active = false;
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [showToast]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        startNewChat();
        window.setTimeout(() => promptRef.current?.focus(), 0);
      }
      if (event.key === "Escape") {
        setAgentMenuOpen(false);
        setSidebarOpen(false);
      }
    }
    function handlePointerDown(event: MouseEvent) {
      if (event.target instanceof Node && !composerRef.current?.contains(event.target)) setAgentMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  });

  const filteredAgents = agents.filter((agent) =>
    (filter === "All" || agent.category === filter) &&
    `${agent.name} ${agent.description} ${agent.category}`.toLowerCase().includes(directoryQuery.trim().toLowerCase())
  );

  function navigate(nextView: View) {
    setView(nextView);
    setSidebarOpen(false);
    setAgentMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (nextView === "history") refreshConversations().catch((error: unknown) => {
      showToast(error instanceof Error ? error.message : "Could not load conversation history.");
    });
  }

  function startNewChat() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setConversationId(null);
    setMessages([]);
    setReply("");
    setView("home");
    setSidebarOpen(false);
    setAgentMenuOpen(false);
  }

  async function openConversation(id: string) {
    try {
      const response = await fetch(`/api/conversations/${encodeURIComponent(id)}`);
      const data = await response.json() as ApiResult<{ conversation: Conversation }>;
      if (!response.ok) throw new Error(data.error || "Could not open this conversation.");
      setConversationId(data.conversation.id);
      setMessages(data.conversation.messages);
      const lastAgent = [...data.conversation.messages].reverse().find((message) => message.role === "assistant")?.agent;
      if (lastAgent) setSelectedAgent(lastAgent);
      navigate("chat");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not open this conversation.");
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>, content: string, clear: () => void) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || loading) return;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    clear();
    setLoading(true);
    const optimisticMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmed,
      agent: null,
      createdAt: new Date().toISOString()
    };
    const previousMessages = messages;
    setMessages((current) => [...current, optimisticMessage]);
    navigate("chat");
    let persisted = Boolean(conversationId);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, agent: selectedAgent, conversationId })
      });
      const data = await response.json() as ApiResult<{ conversationId: string; reply: string; agent: string; mode: "preview" | "connected" }>;
      if (!response.ok) {
        if (data.conversationId) {
          setConversationId(data.conversationId);
          persisted = true;
        }
        throw new Error(data.error || "MIT could not complete that request.");
      }
      setConversationId(data.conversationId);
      persisted = true;
      setAiMode(data.mode);
      if (data.mode === "connected") setDisclaimer("AI replies come from your connected provider and may not always be accurate.");
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply,
        agent: data.agent,
        createdAt: new Date().toISOString()
      };
      setMessages((current) => [...current, assistantMessage]);
      setSelectedAgent(data.agent);
      speakReply(data.reply);
      await refreshConversations();
    } catch (error) {
      if (!persisted) setMessages(previousMessages);
      showToast(error instanceof Error ? error.message : "MIT could not complete that request.");
    } finally {
      setLoading(false);
    }
  }

  function chooseAgent(name: string) {
    setSelectedAgent(name);
    setAgentMenuOpen(false);
  }

  function speakReply(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = navigator.language || "en-US";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  function startVoiceInput(setValue: (value: string) => void = setPrompt) {
    type Recognition = {
      lang: string;
      interimResults: boolean;
      onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
      onerror: ((event: { error: string }) => void) | null;
      onend: (() => void) | null;
      start: () => void;
    };
    type RecognitionConstructor = new () => Recognition;
    const browserWindow = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    const SpeechRecognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Voice input isn't supported in this browser. Try a current version of Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => setValue(event.results[0][0].transcript);
    recognition.onerror = (event) => showToast(`Voice input couldn't start: ${event.error}.`);
    recognition.onend = () => setIsRecording(false);
    setIsRecording(true);
    try {
      recognition.start();
    } catch {
      setIsRecording(false);
      showToast("Voice input couldn't start. Please try again.");
    }
  }

  const currentLabel = view === "chat" ? "MIT assistant" : view === "agents" ? "AI agents" : view === "history" ? "History" : "Overview";
  const latestAssistantMessage = [...messages].reverse().find((message) => message.role === "assistant");
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const robotState = isRecording ? "listening" : loading ? "thinking" : isSpeaking ? "speaking" : "idle";

  return (
    <div className="app-shell">
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`} id="sidebar">
        <a className="brand" href="#" aria-label="MIT home" onClick={(event) => { event.preventDefault(); startNewChat(); }}>
          <span className="brand-mark">M<span>I</span>T</span><span className="brand-caption">PERSONAL AI</span>
        </a>
        <button className="new-chat-button" onClick={startNewChat}>
          <Icon name="plus" /><span>New conversation</span><kbd>⌘ K</kbd>
        </button>
        <div className="side-section">
          <div className="section-label">WORKSPACE</div>
          <button className={`nav-item${view === "home" || view === "chat" ? " active" : ""}`} onClick={() => navigate("home")}><Icon name="grid" /><span>Overview</span></button>
          <button className={`nav-item${view === "agents" ? " active" : ""}`} onClick={() => navigate("agents")}><Icon name="agents" /><span>AI agents</span><span className="nav-count">15</span></button>
          <button className={`nav-item${view === "history" ? " active" : ""}`} onClick={() => navigate("history")}><Icon name="history" /><span>History</span></button>
        </div>
        <div className="side-section recent-section">
          <div className="section-label">RECENT</div>
          {conversations.slice(0, 3).map((conversation) => (
            <button className="recent-link" key={conversation.id} onClick={() => void openConversation(conversation.id)}>{conversation.title}</button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="upgrade-card"><div className="upgrade-icon">✳</div><div><strong>Make MIT yours</strong><p>Your workspace, your way.</p></div><button className="icon-button settings-button" aria-label="Settings" onClick={() => showToast("AI provider settings are managed through the local .env file.")}><Icon name="settings" /></button></div>
          <button className="profile-button" onClick={() => showToast("MIT is running as a personal workspace on this device.")}><span className="avatar">M</span><span className="profile-copy"><strong>My workspace</strong><small>Personal plan</small></span><span className="profile-more">···</span></button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button className="icon-button menu-button" aria-label="Toggle menu" onClick={() => setSidebarOpen((open) => !open)}><Icon name="menu" /></button>
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{currentLabel}</strong></div>
          <div className="topbar-actions"><span className={`demo-pill${aiMode === "connected" ? " connected" : ""}`}><i />{aiMode === "connected" ? "AI connected" : "Preview mode"}</span><button className="top-avatar" aria-label="My profile" onClick={() => showToast("MIT is running as a personal workspace on this device.")}>M</button></div>
        </header>

        {view === "home" && (
          <div className="content">
            <section className="robot-console">
              <div className="eyebrow"><span className="eyebrow-line" /> YOUR PERSONAL AI ASSISTANT</div>
              <div className={`robot-stage robot-stage-${robotState}`}><div className="robot-halo" /><RobotAvatar state={robotState} /></div>
              <div className="robot-state-label" aria-live="polite">
                <i className={`state-dot state-${robotState}`} />
                {isRecording ? "I'm listening..." : loading ? "I'm working on it..." : isSpeaking ? "Speaking..." : aiMode === "connected" ? "Ready when you are" : "Ready · preview mode"}
              </div>
              <h1>{messages.length ? "I'm here to help." : "Hi, I'm MIT."}</h1>
              <p className="welcome-copy">{messages.length ? "Tell me what to do next, or ask me to explain my answer." : "Talk to me or give me a task. What can I help you get done?"}</p>
              {latestAssistantMessage && (
                <div className="assistant-result" aria-live="polite">
                  {latestUserMessage && <p className="assistant-request"><span>Your request</span>{latestUserMessage.content}</p>}
                  <div className="assistant-result-heading"><span>MIT · {latestAssistantMessage.agent || "Everyday Assistant"}</span><button className="speak-button" onClick={() => isSpeaking ? (window.speechSynthesis.cancel(), setIsSpeaking(false)) : speakReply(latestAssistantMessage.content)}>{isSpeaking ? "Stop speaking" : "▶ Hear response"}</button></div>
                  <p className="assistant-result-content">{latestAssistantMessage.content}</p>
                </div>
              )}
              <div ref={composerRef}>
                <Composer
                  value={prompt}
                  onChange={setPrompt}
                  onSubmit={(event) => void sendMessage(event, prompt, () => setPrompt(""))}
                  selectedAgent={selectedAgent}
                  onAgentClick={() => setAgentMenuOpen((open) => !open)}
                  agentMenuOpen={agentMenuOpen}
                  onAgentSelect={chooseAgent}
                  onVoice={startVoiceInput}
                  isRecording={isRecording}
                  isLoading={loading}
                  inputRef={promptRef}
                />
              </div>
              {!messages.length && <div className="suggestions"><span className="suggestion-label">GIVE ME A STARTING POINT</span><div className="suggestion-list">
                {suggestions.map((item) => <button className="suggestion-chip" key={item.label} onClick={() => { setPrompt(item.prompt); promptRef.current?.focus(); }}><span>{item.icon}</span>{item.label}</button>)}
              </div></div>}
            </section>
            <section className="agents-section">
              <div className="section-heading"><div><div className="eyebrow">A LITTLE HELP GOES A LONG WAY</div><h2>Meet your AI agents<span className="heading-period">.</span></h2></div><button className="text-link" onClick={() => navigate("agents")}>Explore all 15 <span>↗</span></button></div>
              <div className="agent-grid">{agents.slice(0, 4).map((agent) => <button className="agent-card" key={agent.name} onClick={() => { chooseAgent(agent.name); showToast(`${agent.name} is ready. Tell MIT what you need.`); }}><AgentIcon agent={agent} /><strong>{agent.name}</strong><p>{agent.description}</p></button>)}</div>
            </section>
            <footer className="footer-note"><span>MIT</span> is your personal AI workspace. <span className="footer-dot">·</span> Built to help you do more of what matters.</footer>
          </div>
        )}

        {view === "chat" && (
          <section className="conversation-view">
            <div className="robot-console conversation-console">
              <div className="eyebrow">YOUR PERSONAL AI ASSISTANT</div>
              <div className={`robot-stage robot-stage-${robotState}`}><div className="robot-halo" /><RobotAvatar state={robotState} /></div>
              <div className="robot-state-label" aria-live="polite"><i className={`state-dot state-${robotState}`} />{isRecording ? "I'm listening..." : loading ? "I'm working on it..." : isSpeaking ? "Speaking..." : "Ready when you are"}</div>
              {latestAssistantMessage ? (
                <div className="assistant-result conversation-result" aria-live="polite">
                  {latestUserMessage && <p className="assistant-request"><span>Your request</span>{latestUserMessage.content}</p>}
                  <div className="assistant-result-heading"><span>MIT · {latestAssistantMessage.agent || "Everyday Assistant"}</span><button className="speak-button" onClick={() => isSpeaking ? (window.speechSynthesis.cancel(), setIsSpeaking(false)) : speakReply(latestAssistantMessage.content)}>{isSpeaking ? "Stop speaking" : "▶ Hear response"}</button></div>
                  <p className="assistant-result-content">{latestAssistantMessage.content}</p>
                </div>
              ) : loading ? <p className="assistant-working">MIT is thinking through your request...</p> : null}
              {messages.length > 2 && <details className="transcript-details"><summary>Show conversation history</summary><div className="transcript-list">{messages.map((message) => <p key={message.id}><strong>{message.role === "user" ? "You" : `MIT · ${message.agent || "Assistant"}`}</strong>{message.content}</p>)}</div></details>}
            </div>
            <Composer
              compact
              value={reply}
              onChange={setReply}
              onSubmit={(event) => void sendMessage(event, reply, () => setReply(""))}
              selectedAgent={selectedAgent}
              onVoice={() => startVoiceInput(setReply)}
              isRecording={isRecording}
              isLoading={loading}
            />
            <p className="composer-note">{disclaimer}</p>
          </section>
        )}

        {view === "agents" && (
          <section className="directory-view">
            <div className="directory-header"><div className="eyebrow">YOUR SPECIALIST TEAM</div><h1>Meet your AI agents<span className="heading-period">.</span></h1><p>Fifteen focused helpers, ready to jump in wherever you need them.</p></div>
            <div className="directory-toolbar"><div className="agent-search"><Icon name="search" /><input type="search" value={directoryQuery} onChange={(event) => setDirectoryQuery(event.target.value)} placeholder="Find an agent..." aria-label="Find an agent" /></div><div className="filter-pills">{categories.map((category) => <button className={`filter-pill${filter === category ? " active" : ""}`} key={category} onClick={() => setFilter(category)}>{category}</button>)}</div></div>
            <div className="directory-grid">{filteredAgents.length ? filteredAgents.map((agent) => <button className="directory-card" key={agent.name} onClick={() => { chooseAgent(agent.name); navigate("home"); showToast(`${agent.name} is ready. Tell MIT what you need.`); }}><span className="directory-card-top"><AgentIcon agent={agent} /><span className="agent-category">{agent.category}</span></span><strong>{agent.name}</strong><p>{agent.description}</p></button>) : <div className="history-empty">No agents match that search. Try another name or category.</div>}</div>
          </section>
        )}

        {view === "history" && (
          <section className="history-view">
            <div className="directory-header"><div className="eyebrow">PICK UP WHERE YOU LEFT OFF</div><h1>Your history<span className="heading-period">.</span></h1><p>Your conversations are saved in MIT&apos;s local database.</p></div>
            <div className="history-list">{conversations.length ? conversations.map((conversation) => <button className="history-item" key={conversation.id} onClick={() => void openConversation(conversation.id)}><span className="history-item-icon">✳</span><span className="history-item-copy"><strong>{conversation.title}</strong><small>{new Date(conversation.updatedAt).toLocaleString()} · {conversation.messageCount} messages</small></span><span className="profile-more">›</span></button>) : <div className="history-empty">No conversations yet. Start a chat with MIT and it will appear here.</div>}</div>
          </section>
        )}
      </main>
      <div className={`toast${toast ? " visible" : ""}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
