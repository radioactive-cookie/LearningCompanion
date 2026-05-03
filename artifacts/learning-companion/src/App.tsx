import { Link, useLocation } from "wouter";
import { MessageSquare, History, Moon, Sun, Code2, Trophy, Zap, Key, LogIn, LogOut, User, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Chat } from "@/pages/chat";
import { History as HistoryPage } from "@/pages/history";
import { Conversation } from "@/pages/conversation";
import { Learn } from "@/pages/learn";
import { Landing } from "@/pages/landing";
import { Progress } from "@/pages/progress";
import { CertificatePage } from "@/pages/certificate";
import { SignIn } from "@/pages/sign-in";
import { AdminPage } from "@/pages/admin";
import { IdePage } from "@/pages/ide";
import NotFound from "@/pages/not-found";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { useGetAiUsage, getGetAiUsageQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import brandIcon from "@assets/neural-network_1777788855132.png";

// ---------------------------------------------------------------------------
// AI Usage Indicator
// ---------------------------------------------------------------------------
function UsageIndicator() {
  const { data } = useGetAiUsage({
    query: {
      queryKey: getGetAiUsageQueryKey(),
      refetchInterval: 60_000,
      staleTime: 30_000,
    },
  });

  if (!data) return null;

  const {
    primaryTokensUsed, backupTokensUsed, dailyLimit,
    activeKey, primaryExhausted, backupExhausted,
    primaryRetryAfter, backupRetryAfter,
    hasBackupKey, resetAtUtc,
  } = data;

  const primaryPct = Math.min((primaryTokensUsed / dailyLimit) * 100, 100);
  const backupPct  = Math.min((backupTokensUsed  / dailyLimit) * 100, 100);

  const msUntilReset = new Date(resetAtUtc).getTime() - Date.now();
  const hoursLeft = Math.floor(msUntilReset / 3_600_000);
  const minsLeft  = Math.floor((msUntilReset % 3_600_000) / 60_000);
  const resetLabel = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m` : `${minsLeft}m`;

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  const minsUntil = (iso: string | null) => {
    if (!iso) return null;
    const ms = new Date(iso).getTime() - Date.now();
    if (ms <= 0) return null;
    const m = Math.ceil(ms / 60_000);
    return m < 60 ? `${m}m` : `${Math.ceil(m / 60)}h`;
  };

  const barColor = (pct: number, exhausted: boolean) =>
    exhausted ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";

  const bothBlocked = primaryExhausted && (backupExhausted || !hasBackupKey);
  const soonestRetry = primaryRetryAfter && backupRetryAfter
    ? (new Date(primaryRetryAfter) < new Date(backupRetryAfter) ? primaryRetryAfter : backupRetryAfter)
    : (primaryRetryAfter ?? backupRetryAfter);

  const statusLabel =
    bothBlocked
      ? `Rate limited — retry in ${minsUntil(soonestRetry) ?? "…"}`
      : primaryExhausted ? "Switched to backup key" :
        backupExhausted  ? "Backup limited — using primary" :
        activeKey === "backup" ? "Backup key active" :
        activeKey === "primary" ? "Primary key active" : "No requests yet";

  const statusColor =
    bothBlocked ? "text-red-500" :
    primaryExhausted || backupExhausted ? "text-amber-500" :
    activeKey !== "none" ? "text-emerald-500" : "text-muted-foreground";

  const KeyRow = ({
    label, isActive, isExhausted, retryAfter, pct, used,
  }: { label: string; isActive: boolean; isExhausted: boolean; retryAfter: string | null; pct: number; used: number }) => {
    const countdown = minsUntil(retryAfter);
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Key className="w-2.5 h-2.5" />
            {label}
            {isActive && !isExhausted && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block ml-0.5" />
            )}
            {isExhausted && countdown && (
              <span className="ml-1 text-[9px] font-medium text-amber-500 bg-amber-500/10 rounded px-1 leading-[14px]">
                retry in {countdown}
              </span>
            )}
            {isExhausted && !countdown && (
              <span className="ml-1 text-[9px] font-medium text-red-500 bg-red-500/10 rounded px-1 leading-[14px]">
                exhausted
              </span>
            )}
          </span>
          <span>{fmt(used)} / {fmt(dailyLimit)}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-sidebar-accent overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor(pct, isExhausted)}`}
            style={{ width: `${Math.max(pct, isExhausted ? 100 : 0)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 pb-3 pt-1 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-sidebar-foreground/60 uppercase tracking-wider">
          <Zap className="w-3 h-3" />
          AI Usage
        </div>
        <span className="text-[10px] text-muted-foreground">resets in {resetLabel}</span>
      </div>

      <KeyRow
        label="Primary"
        isActive={activeKey === "primary"}
        isExhausted={primaryExhausted}
        retryAfter={primaryRetryAfter}
        pct={primaryPct}
        used={primaryTokensUsed}
      />

      {hasBackupKey && (
        <KeyRow
          label="Backup"
          isActive={activeKey === "backup"}
          isExhausted={backupExhausted}
          retryAfter={backupRetryAfter}
          pct={backupPct}
          used={backupTokensUsed}
        />
      )}

      <p className={`text-[10px] ${statusColor}`}>{statusLabel}</p>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ---------------------------------------------------------------------------
// User panel in sidebar
// ---------------------------------------------------------------------------
function UserPanel() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="px-4 pb-4">
        <div className="h-9 w-full rounded-lg bg-sidebar-accent/50 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="px-4 pb-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/80 border-sidebar-border hover:bg-sidebar-accent"
          onClick={() => setLocation("/sign-in")}
          data-testid="btn-login"
        >
          <LogIn className="w-4 h-4" />
          Log in
        </Button>
      </div>
    );
  }

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email?.split("@")[0] || "User";
  const initials = [(user.firstName ?? "")[0], (user.lastName ?? "")[0]].filter(Boolean).join("").toUpperCase() || displayName[0]?.toUpperCase() || "U";

  return (
    <div className="px-4 pb-4 space-y-2">
      <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-sidebar-accent/30">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold overflow-hidden">
          {user.profileImageUrl ? (
            <img src={user.profileImageUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-sidebar-foreground truncate">{displayName}</p>
          {user.email && (
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 text-xs"
        onClick={logout}
        data-testid="btn-logout"
      >
        <LogOut className="w-3.5 h-3.5" />
        Log out
      </Button>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const isHistoryActive = location === "/history" || location.startsWith("/history/");
  const isLearnActive = location === "/learn" || location.startsWith("/learn");
  const isChatActive = location === "/chat";
  const isProgressActive = location === "/progress";
  const isIdeActive = location === "/ide";

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      <nav className="flex flex-col w-64 border-r border-border bg-sidebar shrink-0 relative">
        <div className="p-6">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer text-sidebar-foreground group" data-testid="link-home">
              <div className="bg-white p-1.5 rounded-lg border border-border/50 shadow-sm group-hover:shadow transition-shadow">
                <img src={brandIcon} alt="Companion" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-semibold tracking-tight text-lg">Companion</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-4 py-2 space-y-1">
          <Link href="/chat">
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${isChatActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"}`}
              data-testid="nav-chat"
            >
              <MessageSquare className="w-4 h-4" />
              <span>New Chat</span>
            </div>
          </Link>
          <Link href="/history">
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${isHistoryActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"}`}
              data-testid="nav-history"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </div>
          </Link>
          <Link href="/learn">
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${isLearnActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"}`}
              data-testid="nav-learn"
            >
              <Code2 className="w-4 h-4" />
              <span>Learn to Code</span>
            </div>
          </Link>
          <Link href="/progress">
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${isProgressActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"}`}
              data-testid="nav-progress"
            >
              <Trophy className="w-4 h-4" />
              <span>My Progress</span>
            </div>
          </Link>
          <Link href="/ide">
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${isIdeActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"}`}
              data-testid="nav-ide"
            >
              <Terminal className="w-4 h-4" />
              <span>Coding IDE</span>
            </div>
          </Link>
        </div>

        <div className="mt-auto">
          <div className="border-t border-sidebar-border pt-3">
            <UsageIndicator />
          </div>
          <div className="px-4 pb-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </Button>
          </div>
          <div className="border-t border-sidebar-border pt-3">
            <UserPanel />
          </div>
        </div>
      </nav>
      <main className="flex-1 flex flex-col min-w-0 bg-background relative z-0">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/chat">
        <Layout><Chat /></Layout>
      </Route>
      <Route path="/history">
        <Layout><HistoryPage /></Layout>
      </Route>
      <Route path="/history/:sessionId">
        <Layout><Conversation /></Layout>
      </Route>
      <Route path="/learn">
        <Layout><Learn /></Layout>
      </Route>
      <Route path="/progress">
        <Layout><Progress /></Layout>
      </Route>
      <Route path="/ide">
        <Layout><IdePage /></Layout>
      </Route>
      <Route path="/certificate/:id" component={CertificatePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="learning-companion-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
