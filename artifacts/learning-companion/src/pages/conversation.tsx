import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Sparkles, MessageSquare, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetConversationHistory, getGetConversationHistoryQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";

type EnrichedMessage = {
  id: string;
  role: string;
  content: string;
  timestamp: string;
};

function MessageBubble({ msg }: { msg: EnrichedMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div
        className={`max-w-[85%] px-5 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card border border-border/50 text-card-foreground rounded-bl-sm"
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wide uppercase">Companion</span>
          </div>
        )}
        {!isUser ? (
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
        <div className={`mt-2 text-[11px] ${isUser ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
          {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`flex ${i % 2 === 1 ? "justify-end" : "justify-start"}`}>
          <Skeleton className={`h-16 rounded-2xl ${i % 2 === 1 ? "w-48" : "w-72"}`} />
        </div>
      ))}
    </div>
  );
}

export function Conversation() {
  const params = useParams<{ sessionId: string }>();
  const [, navigate] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionId = params.sessionId;

  const { data, isLoading, isError } = useGetConversationHistory(
    { sessionId },
    { query: { queryKey: getGetConversationHistoryQueryKey({ sessionId }) } },
  );

  const messages = (data?.messages ?? []) as EnrichedMessage[];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const firstUserMessage = messages.find((m) => m.role === "user")?.content ?? "Conversation";
  const title = firstUserMessage.length > 60
    ? firstUserMessage.slice(0, 60) + "…"
    : firstUserMessage;

  return (
    <div className="flex flex-col h-full bg-background max-w-4xl mx-auto w-full">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/history")}
          data-testid="btn-back-to-history"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold tracking-tight truncate">{title}</h2>
          {messages.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {Math.ceil(messages.length / 2)} exchange{Math.ceil(messages.length / 2) !== 1 ? "s" : ""} &middot; {new Date(messages[0]?.timestamp).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
        <Button
          size="sm"
          className="shrink-0 gap-2"
          onClick={() => navigate(`/chat?resume=${sessionId}`)}
          data-testid="btn-continue-conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Continue
        </Button>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 pb-6" ref={scrollRef}>
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full py-24 gap-3 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">Could not load this conversation.</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/history")}>
              Back to History
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-24 gap-3 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">No messages in this conversation.</p>
          </div>
        ) : (
          <div className="py-6 flex flex-col gap-5 max-w-3xl mx-auto w-full">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {/* Continue CTA at the bottom */}
            <div className="pt-6 border-t border-border/40 flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">Want to keep learning from here?</p>
              <Button
                className="gap-2"
                onClick={() => navigate(`/chat?resume=${sessionId}`)}
                data-testid="btn-continue-bottom"
              >
                <RotateCcw className="w-4 h-4" />
                Continue this conversation
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
