import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import {
  Send,
  Sparkles,
  BookOpen,
  GraduationCap,
  Flame,
  AlertCircle,
  Mic,
  MicOff,
  EyeOff,
  RotateCcw,
  Code2,
  Pencil,
  Search,
  UserRound,
  Pen,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useAskAi,
  useGetSuggestedTopics,
  getGetSuggestedTopicsQueryKey,
  useGetConversationHistory,
  getGetConversationHistoryQueryKey,
} from "@workspace/api-client-react";
import type { ChatMessage, Topic } from "@workspace/api-client-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSearch, useLocation } from "wouter";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EnrichedMessage = ChatMessage & { conversationId?: string };

type ChatMode = "normal" | "temporary";

// ---------------------------------------------------------------------------
// Guest username helpers (localStorage fallback for unauthenticated users)
// ---------------------------------------------------------------------------
const USERNAME_KEY = "companion-username";
const USERNAME_SET_KEY = "companion-username-set";
const GUEST_MSG_COUNT_KEY = "companion-guest-msg-count";
const GUEST_FREE_LIMIT = 5;

function getStoredUsername(): string {
  return localStorage.getItem(USERNAME_KEY) ?? "Learner";
}

function hasUserSetName(): boolean {
  return localStorage.getItem(USERNAME_SET_KEY) === "true";
}

function saveUsername(name: string) {
  const trimmed = name.trim() || "Learner";
  localStorage.setItem(USERNAME_KEY, trimmed);
  localStorage.setItem(USERNAME_SET_KEY, "true");
}

function getGuestMsgCount(): number {
  return parseInt(localStorage.getItem(GUEST_MSG_COUNT_KEY) ?? "0", 10);
}

function incrementGuestMsgCount(): number {
  const next = getGuestMsgCount() + 1;
  localStorage.setItem(GUEST_MSG_COUNT_KEY, String(next));
  return next;
}

// ---------------------------------------------------------------------------
// NamePrompt overlay — shown on first visit
// ---------------------------------------------------------------------------
function NamePrompt({ onSave }: { onSave: (name: string) => void }) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Small delay so the animation completes before focus
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = value.trim() || "Learner";
    saveUsername(name);
    onSave(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <UserRound className="w-6 h-6" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-lg font-bold text-foreground text-center mb-1">
          What should we call you?
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-5">
          Personalise your experience — you can change this any time.
        </p>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Your name or nickname…"
            className="h-11 text-sm rounded-xl border-input focus-visible:ring-primary/30"
            maxLength={30}
            data-testid="input-username"
          />
          <Button
            type="submit"
            className="h-11 rounded-xl gap-2 font-medium"
            data-testid="btn-save-username"
          >
            <Sparkles className="w-4 h-4" />
            {value.trim() ? `Let's go, ${value.trim()}!` : "Continue as Learner"}
          </Button>
        </form>

        {/* Skip */}
        <button
          className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
          onClick={() => handleSubmit()}
          data-testid="btn-skip-username"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Web Speech API — use loose types to avoid missing lib.dom declarations
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionAny = any;

// ---------------------------------------------------------------------------
// Topic quick-action chips (like ChatGPT's suggestion pills)
// ---------------------------------------------------------------------------
const QUICK_ACTIONS = [
  { icon: Code2,   label: "Learn to code",    prompt: "I want to learn programming. Where should I start?" },
  { icon: Pencil,  label: "Explain a concept", prompt: "Can you explain a concept I'm struggling with?" },
  { icon: Search,  label: "Explore a topic",   prompt: "I'd like to explore an interesting topic today." },
  { icon: BookOpen, label: "Study with me",    prompt: "Help me study and quiz me on a subject of my choice." },
];

// ---------------------------------------------------------------------------
// TopicCard component
// ---------------------------------------------------------------------------
function TopicCard({ topic, onClick }: { topic: Topic; onClick: () => void }) {
  const getDifficultyColor = (diff: string) => {
    if (diff === "beginner") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (diff === "intermediate") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };
  const getDifficultyIcon = (diff: string) => {
    if (diff === "beginner") return <BookOpen className="w-3 h-3" />;
    if (diff === "intermediate") return <Flame className="w-3 h-3" />;
    return <GraduationCap className="w-3 h-3" />;
  };
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 rounded-xl p-4 flex flex-col gap-2 text-left"
      data-testid={`card-topic-${topic.id}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{topic.category}</span>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${getDifficultyColor(topic.difficulty)}`}>
          {getDifficultyIcon(topic.difficulty)}
          <span className="capitalize">{topic.difficulty}</span>
        </div>
      </div>
      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{topic.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{topic.description}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// useDictation hook
// ---------------------------------------------------------------------------
function useDictation(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionAny>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);
  }, []);

  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript as string;
      onResult(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [onResult]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, isSupported, startListening, stopListening };
}

// ---------------------------------------------------------------------------
// Login prompt modal (shown after guest hits 5-message limit)
// ---------------------------------------------------------------------------
function GuestLimitPrompt({ login, onDismiss }: { login: () => void; onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <LogIn className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-foreground text-center mb-1">
          You've used {GUEST_FREE_LIMIT} free messages
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-5">
          Log in to keep chatting and save your conversation history to your account — it's free.
        </p>
        <div className="flex flex-col gap-2">
          <Button className="h-11 rounded-xl gap-2 font-medium" onClick={login} data-testid="btn-login-prompt">
            <LogIn className="w-4 h-4" />
            Log in to continue
          </Button>
          <button
            className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1"
            onClick={onDismiss}
            data-testid="btn-dismiss-limit"
          >
            Dismiss for now
          </button>
        </div>
      </div>
    </div>
  );
}

export function Chat() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(search);
  const resumeSessionId = params.get("resume") ?? undefined;

  const { user, isAuthenticated, login } = useAuth();

  // Derive display name: auth user name takes priority; fallback to stored guest name
  const authName = user ? ([user.firstName, user.lastName].filter(Boolean).join(" ") || user.email?.split("@")[0] || "Learner") : null;
  const [guestUsername, setGuestUsername] = useState(() => getStoredUsername());
  const username = authName ?? guestUsername;

  const [showNamePrompt, setShowNamePrompt] = useState(() => !isAuthenticated && !hasUserSetName());
  const [showGuestLimit, setShowGuestLimit] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("normal");

  const [messages, setMessages] = useState<EnrichedMessage[]>([]);
  const [input, setInput] = useState("");
  // In temporary mode we still send sessionId to maintain context within the
  // session, but we never read it back from storage — it vanishes on close.
  const [sessionId, setSessionId] = useState<string | undefined>(resumeSessionId);
  const [resumed, setResumed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Session storage for temporary chats — survive hot reloads but not browser close
  const TEMP_SESSION_KEY = "companion-temp-session";
  const TEMP_MSGS_KEY = "companion-temp-messages";

  // Load history when resuming a conversation
  const { data: resumeData, isLoading: isLoadingResume } = useGetConversationHistory(
    resumeSessionId ? { sessionId: resumeSessionId } : undefined,
    {
      query: {
        queryKey: getGetConversationHistoryQueryKey(
          resumeSessionId ? { sessionId: resumeSessionId } : undefined,
        ),
        enabled: !!resumeSessionId,
      },
    },
  );

  // Populate messages once resume data loads
  useEffect(() => {
    if (resumeSessionId && resumeData?.messages && !resumed) {
      const loaded = (resumeData.messages as EnrichedMessage[]).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }));
      setMessages(loaded);
      setSessionId(resumeSessionId);
      setResumed(true);
    }
  }, [resumeData, resumeSessionId, resumed]);

  // Restore temporary session from sessionStorage on mount
  useEffect(() => {
    if (chatMode === "temporary") {
      const savedSession = sessionStorage.getItem(TEMP_SESSION_KEY);
      const savedMsgs = sessionStorage.getItem(TEMP_MSGS_KEY);
      if (savedSession) setSessionId(savedSession);
      if (savedMsgs) {
        try { setMessages(JSON.parse(savedMsgs)); } catch { /* ignore */ }
      }
    }
  // Only run once on mount for initial temp restore
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist temp session to sessionStorage whenever messages change
  useEffect(() => {
    if (chatMode === "temporary") {
      if (sessionId) sessionStorage.setItem(TEMP_SESSION_KEY, sessionId);
      sessionStorage.setItem(TEMP_MSGS_KEY, JSON.stringify(messages));
    }
  }, [chatMode, messages, sessionId]);

  const { data: topicsData, isLoading: isLoadingTopics } = useGetSuggestedTopics({
    query: { queryKey: getGetSuggestedTopicsQueryKey() },
  });

  const askAi = useAskAi();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages, askAi.isPending]);


  const handleSubmit = useCallback((e?: React.FormEvent, customMessage?: string, customTopic?: string) => {
    e?.preventDefault();
    const messageToSend = customMessage || input;
    if (!messageToSend.trim()) return;

    // Enforce guest message limit (client-side UX gate)
    if (!isAuthenticated) {
      const newCount = incrementGuestMsgCount();
      if (newCount > GUEST_FREE_LIMIT) {
        setShowGuestLimit(true);
        return;
      }
    }

    const userMsg: EnrichedMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    if (chatMode === "temporary") {
      // Temporary mode: pass all prior messages for context, never persist
      const priorMessages = messages.map((m) => ({ role: m.role, content: m.content }));
      askAi.mutate(
        {
          data: {
            message: messageToSend.trim(),
            temporary: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(priorMessages.length > 0 ? { priorMessages } as any : {}),
          },
        },
        {
          onSuccess: (response) => {
            const aiMsg: EnrichedMessage = {
              id: Date.now().toString() + "-ai",
              role: "assistant",
              content: response.reply,
              timestamp: response.timestamp,
            };
            setMessages((prev) => [...prev, aiMsg]);
          },
        },
      );
      return;
    }

    // Normal mode: persist to DB via sessionId
    askAi.mutate(
      { data: { message: messageToSend.trim(), sessionId, topic: customTopic } },
      {
        onSuccess: (response) => {
          if (!sessionId && response.sessionId) {
            setSessionId(String(response.sessionId));
          }
          const aiMsg: EnrichedMessage = {
            id: Date.now().toString() + "-ai",
            role: "assistant",
            content: response.reply,
            timestamp: response.timestamp,
          };
          setMessages((prev) => [...prev, aiMsg]);
        },
      },
    );
  }, [input, sessionId, chatMode, messages, askAi]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDictationResult = useCallback((transcript: string) => {
    setInput((prev) => prev ? prev + " " + transcript : transcript);
  }, []);

  const { isListening, isSupported: dictationSupported, startListening, stopListening } = useDictation(handleDictationResult);

  const handleMicClick = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const resetChat = () => {
    setMessages([]);
    setSessionId(undefined);
    setResumed(false);
    if (chatMode === "temporary") {
      sessionStorage.removeItem(TEMP_SESSION_KEY);
      sessionStorage.removeItem(TEMP_MSGS_KEY);
    }
    window.history.replaceState(null, "", window.location.pathname);
  };

  const switchMode = (mode: ChatMode) => {
    setChatMode(mode);
    resetChat();
  };

  const isInitialState = messages.length === 0 && !isLoadingResume;

  const handleNameSave = (name: string) => {
    setGuestUsername(name);
    setShowNamePrompt(false);
  };

  return (
    <div className="flex flex-col h-full bg-background w-full relative">

      {/* ── Guest limit prompt (after 5 messages without login) ── */}
      {showGuestLimit && (
        <GuestLimitPrompt login={() => setLocation("/sign-in")} onDismiss={() => setShowGuestLimit(false)} />
      )}

      {/* ── Name prompt overlay (guest first visit) ── */}
      {!isAuthenticated && showNamePrompt && (
        <NamePrompt onSave={handleNameSave} />
      )}

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <header className="px-5 py-3 flex items-center justify-between shrink-0 border-b border-border/40 bg-background/95 backdrop-blur-sm">

        {/* Left: LearningCompanion brand */}
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          LearningCompanion
        </div>

        {/* Right: temporary chat toggle + edit name + reset */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 h-8 text-xs transition-colors ${
              chatMode === "temporary"
                ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/15"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => switchMode(chatMode === "temporary" ? "normal" : "temporary")}
            data-testid="btn-toggle-temporary"
            title={chatMode === "temporary" ? "Switch to normal chat (saves history)" : "Switch to temporary chat (not saved)"}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {chatMode === "temporary" ? "Temporary" : "Temporary"}
            </span>
          </Button>

          {!isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground h-8 text-xs hidden sm:flex"
              onClick={() => setShowNamePrompt(true)}
              data-testid="btn-edit-name"
              title="Change your display name"
            >
              <Pen className="w-3.5 h-3.5" />
              @{username}
            </Button>
          )}

          {(sessionId || messages.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground h-8 text-xs"
              onClick={resetChat}
              data-testid="btn-new-chat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New chat
            </Button>
          )}
        </div>
      </header>

      {/* Temporary mode banner */}
      {chatMode === "temporary" && (
        <div className="px-5 py-2 flex items-center gap-2 bg-amber-500/8 border-b border-amber-500/15 text-amber-700 dark:text-amber-400 text-xs">
          <EyeOff className="w-3.5 h-3.5 shrink-0" />
          <span>Temporary chat — this conversation will not appear in history and will disappear when you close the browser.</span>
        </div>
      )}

      {/* ── Messages area ────────────────────────────────────────────── */}
      <ScrollArea className="flex-1 pb-2" ref={scrollRef}>
        <div className="max-w-3xl mx-auto w-full px-5 py-6 min-h-[calc(100vh-220px)] flex flex-col gap-6">

          {/* Resume loading skeleton */}
          {isLoadingResume && (
            <div className="flex flex-col gap-4 animate-in fade-in">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 1 ? "justify-end" : "justify-start"}`}>
                  <div className={`h-14 rounded-2xl bg-muted/50 animate-pulse ${i % 2 === 1 ? "w-48" : "w-72"}`} />
                </div>
              ))}
              <p className="text-xs text-center text-muted-foreground">Loading conversation…</p>
            </div>
          )}

          {isInitialState ? (
            /* ── Initial / welcome state ── */
            <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 pt-12 pb-8 gap-10">

              {/* Welcome heading */}
              <h1 className="text-3xl font-bold tracking-tight text-foreground text-center">
                @{username}, which topic to learn today?
              </h1>

              {/* Quick-action chips */}
              <div className="grid grid-cols-2 gap-2.5 w-full max-w-md">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.label}
                      onClick={() => handleSubmit(undefined, action.prompt)}
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm transition-all duration-150 text-sm text-foreground text-left group"
                    >
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted/60 group-hover:bg-primary/10 transition-colors shrink-0">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </span>
                      <span className="font-medium text-xs">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Suggested topics grid */}
              {isLoadingTopics ? (
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-xl bg-muted/50 animate-pulse" />
                  ))}
                </div>
              ) : topicsData?.topics && topicsData.topics.length > 0 ? (
                <div className="w-full space-y-3">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">Suggested Topics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topicsData.topics.map((topic, i) => (
                      <div
                        key={topic.id}
                        className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <TopicCard
                          topic={topic}
                          onClick={() =>
                            handleSubmit(
                              undefined,
                              `I'd like to learn about ${topic.title}. Can we start with the basics?`,
                              topic.id,
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            /* ── Conversation ── */
            <div className="flex flex-col gap-6 w-full pb-8">
              {resumeSessionId && resumed && messages.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 text-sm text-muted-foreground animate-in fade-in">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <span>Previous conversation loaded — continue where you left off.</span>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-[85%] px-5 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border/50 text-card-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2 text-primary">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-semibold tracking-wide uppercase">Companion</span>
                      </div>
                    )}
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none font-sans
                        prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-3 prose-headings:mb-1.5
                        prose-h2:text-base prose-h3:text-sm
                        prose-p:text-[15px] prose-p:leading-relaxed prose-p:my-1.5
                        prose-ul:my-1.5 prose-ul:pl-4 prose-li:my-0.5
                        prose-ol:my-1.5 prose-ol:pl-4
                        prose-strong:text-foreground
                        prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-muted prose-pre:border prose-pre:border-border/50 prose-pre:rounded-lg prose-pre:text-xs prose-pre:overflow-x-auto
                        prose-blockquote:border-l-primary/40 prose-blockquote:text-muted-foreground
                      ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{msg.content}</div>
                    )}
                  </div>
                </div>
              ))}

              {askAi.isPending && (
                <div className="flex w-full justify-start animate-in fade-in">
                  <div className="max-w-[85%] px-5 py-4 rounded-2xl rounded-bl-sm bg-card border border-border/50 text-card-foreground shadow-sm flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <div className="flex gap-1.5 items-center">
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {askAi.isError && (() => {
                const err = askAi.error as { status?: number; data?: { message?: string }; message?: string } | null;
                const status = err?.status ?? 0;
                const bodyMessage = err?.data?.message;
                const isRateLimit = status === 429;
                const displayMessage = bodyMessage
                  ?? (isRateLimit
                    ? "AI keys are temporarily rate-limited. Please try again in a few minutes."
                    : "Failed to get a response. Please try again in a moment.");
                return (
                  <Alert
                    className={`max-w-md mx-auto my-4 ${
                      isRateLimit
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
                        : "bg-destructive/10 border-destructive/20 text-destructive"
                    }`}
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{displayMessage}</AlertDescription>
                  </Alert>
                );
              })()}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ── Input area ───────────────────────────────────────────────── */}
      <div className="p-4 bg-background border-t border-border/40 shrink-0 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 border border-input rounded-2xl bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200 px-4 py-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? "Listening…"
                  : resumed
                  ? "Continue the conversation…"
                  : "Ask anything…"
              }
              className={`flex-1 min-h-[28px] max-h-48 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0 text-base font-sans leading-relaxed ${isListening ? "text-primary placeholder:text-primary/60" : ""}`}
              disabled={askAi.isPending || isLoadingResume}
              data-testid="input-chat"
              rows={1}
            />

            <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
              {/* Mic / dictate button */}
              {dictationSupported && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={`h-9 w-9 rounded-xl transition-colors ${
                    isListening
                      ? "bg-primary/15 text-primary hover:bg-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={handleMicClick}
                  title={isListening ? "Stop dictating" : "Dictate your message"}
                  data-testid="btn-dictate"
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
              )}

              {/* Send button */}
              <Button
                size="icon"
                className="h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 shadow-sm transition-transform active:scale-95 shrink-0"
                onClick={() => handleSubmit()}
                disabled={!input.trim() || askAi.isPending || isLoadingResume}
                data-testid="btn-send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-center text-[11px] text-muted-foreground mt-2">
            {isListening
              ? "Speak now — click the mic again to stop"
              : "Press Enter to send · Shift+Enter for new line"}
          </p>
        </div>
      </div>
    </div>
  );
}
