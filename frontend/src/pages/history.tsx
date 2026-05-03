import { useState } from "react";
import { History as HistoryIcon, MessageSquare, ChevronRight, Inbox, Trash2, LogIn } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetConversationHistory,
  getGetConversationHistoryQueryKey,
  useDeleteConversation,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[=\-]{2,}\s*$/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .trim();
}

type EnrichedMessage = {
  id: string;
  role: string;
  content: string;
  timestamp: string;
  conversationId?: string;
};

type ConversationCard = {
  sessionId: string;
  firstUserMessage: string;
  lastTimestamp: string;
  messageCount: number;
  preview: string;
};

function groupByConversation(messages: EnrichedMessage[]): ConversationCard[] {
  const map = new Map<string, EnrichedMessage[]>();

  for (const msg of messages) {
    const cid = msg.conversationId ?? "unknown";
    if (!map.has(cid)) map.set(cid, []);
    map.get(cid)!.push(msg);
  }

  const cards: ConversationCard[] = [];

  for (const [sessionId, msgs] of map.entries()) {
    const firstUser = msgs.find((m) => m.role === "user");
    const lastMsg = msgs[msgs.length - 1];
    const firstAssistant = msgs.find((m) => m.role === "assistant");

    cards.push({
      sessionId,
      firstUserMessage: firstUser?.content ?? "Untitled conversation",
      lastTimestamp: lastMsg?.timestamp ?? new Date().toISOString(),
      messageCount: msgs.length,
      preview: firstAssistant?.content ?? "",
    });
  }

  return cards.sort(
    (a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime(),
  );
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="inline-flex items-center justify-center p-5 bg-muted/50 rounded-2xl mb-2">
        <Inbox className="w-10 h-10 text-muted-foreground/50" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">No conversations yet</h2>
      <p className="text-muted-foreground max-w-sm text-sm">
        Start a new chat to begin your learning journey. Your conversation history will appear here.
      </p>
    </div>
  );
}

function LoginPrompt({ login }: { login: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="inline-flex items-center justify-center p-5 bg-primary/10 rounded-2xl mb-2">
        <HistoryIcon className="w-10 h-10 text-primary/60" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">Your conversation history</h2>
      <p className="text-muted-foreground max-w-sm text-sm">
        Log in to see your past conversations. Your history is saved privately to your account.
      </p>
      <Button onClick={login} className="gap-2 mt-2">
        <LogIn className="w-4 h-4" />
        Log in to view history
      </Button>
    </div>
  );
}

export function History() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<ConversationCard | null>(null);
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();

  const { data, isLoading } = useGetConversationHistory(undefined, {
    query: {
      queryKey: getGetConversationHistoryQueryKey(),
      enabled: isAuthenticated,
    },
  });

  const deleteConversation = useDeleteConversation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetConversationHistoryQueryKey() });
        setPendingDelete(null);
      },
    },
  });

  const messages = (data?.messages ?? []) as EnrichedMessage[];
  const conversations = groupByConversation(messages);

  const handleDeleteClick = (e: React.MouseEvent, conv: ConversationCard) => {
    e.stopPropagation();
    setPendingDelete(conv);
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      deleteConversation.mutate({ sessionId: pendingDelete.sessionId });
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-background max-w-3xl mx-auto w-full">
        <header className="px-6 py-5 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <HistoryIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Conversation History</h1>
              <p className="text-xs text-muted-foreground">
                {isAuthenticated && conversations.length > 0
                  ? `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`
                  : "Browse past sessions"}
              </p>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 px-4 py-4">
          {authLoading || (isAuthenticated && isLoading) ? (
            <div className="space-y-3 p-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : !isAuthenticated ? (
            <LoginPrompt login={login} />
          ) : conversations.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2 py-2">
              {conversations.map((conv, i) => (
                <div
                  key={conv.sessionId}
                  className="group flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200 cursor-pointer animate-in fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => navigate(`/history/${conv.sessionId}`)}
                  data-testid={`history-conversation-${conv.sessionId}`}
                >
                  <div className="mt-0.5 p-2.5 rounded-lg shrink-0 bg-primary/10 text-primary">
                    <MessageSquare className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {conv.firstUserMessage}
                      </p>
                      <span className="text-xs text-muted-foreground/70 shrink-0">
                        {formatRelativeTime(conv.lastTimestamp)}
                      </span>
                    </div>

                    {conv.preview && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {stripMarkdown(conv.preview)}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground/60 font-medium">
                        {Math.ceil(conv.messageCount / 2)} exchange{Math.ceil(conv.messageCount / 2) !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDeleteClick(e, conv)}
                      data-testid={`btn-delete-${conv.sessionId}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && (
                <>
                  <span className="font-medium text-foreground">
                    "{pendingDelete.firstUserMessage.length > 60
                      ? pendingDelete.firstUserMessage.slice(0, 60) + "…"
                      : pendingDelete.firstUserMessage}"
                  </span>
                  <br /><br />
                  This will permanently delete the conversation and all its messages. This cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteConversation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteConversation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteConversation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
