import { useState } from "react";
import { useLocation } from "wouter";
import {
  Trophy,
  Target,
  Layers,
  Zap,
  BookOpen,
  ChevronRight,
  Code2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Lock,
  RefreshCw,
  Flame,
  GraduationCap,
  Award,
  Download,
  Link2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetLearnProgress,
  getGetLearnProgressQueryKey,
  useGetLearnStreak,
  getGetLearnStreakQueryKey,
  useGetLearnActivity,
  getGetLearnActivityQueryKey,
  useListCertificates,
  getListCertificatesQueryKey,
} from "@workspace/api-client-react";
import type { LearnProgressItem, CertificateRecord } from "@workspace/api-client-react";

// ---------------------------------------------------------------------------
// Constants — keep in sync with learn.tsx
// ---------------------------------------------------------------------------

const TOTAL_LEVELS = 5;

const LEVEL_META = [
  { title: "Fundamentals", icon: GraduationCap, color: "text-teal-500 dark:text-teal-400",    bg: "bg-teal-500/10" },
  { title: "Introduction", icon: BookOpen,      color: "text-primary",                         bg: "bg-primary/10" },
  { title: "Hands-on",     icon: Zap,           color: "text-amber-500 dark:text-amber-400",   bg: "bg-amber-500/10" },
  { title: "Deep Dive",    icon: Layers,        color: "text-violet-500 dark:text-violet-400", bg: "bg-violet-500/10" },
  { title: "Challenge",    icon: Target,        color: "text-rose-500 dark:text-rose-400",     bg: "bg-rose-500/10" },
];

const LANGUAGE_META: Record<string, { label: string; icon: string; color: string }> = {
  python:     { label: "Python",     icon: "🐍", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" },
  javascript: { label: "JavaScript", icon: "⚡", color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20" },
  html:       { label: "HTML",       icon: "🌐", color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20" },
  css:        { label: "CSS",        icon: "🎨", color: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20" },
  java:       { label: "Java",       icon: "☕", color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" },
  "c++":      { label: "C++",        icon: "⚙️", color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20" },
  typescript: { label: "TypeScript", icon: "💙", color: "bg-blue-600/10 text-blue-800 dark:text-blue-300 border-blue-600/20" },
  react:      { label: "React",      icon: "⚛️", color: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20" },
  sql:        { label: "SQL",        icon: "🗄️", color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" },
  php:        { label: "PHP",        icon: "🐘", color: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20" },
  go:         { label: "Go",         icon: "🔵", color: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20" },
  ruby:       { label: "Ruby",       icon: "💎", color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20" },
};

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ---------------------------------------------------------------------------
// Anonymous user ID helper
// ---------------------------------------------------------------------------
function getUserId(): string {
  const KEY = "learn-user-id";
  const stored = localStorage.getItem(KEY);
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem(KEY, id);
  return id;
}

// ---------------------------------------------------------------------------
// Heatmap
// ---------------------------------------------------------------------------

function buildWeekGrid(startDate: string, endDate: string): string[][] {
  // Returns array of weeks; each week is an array of 7 date strings (Sun–Sat).
  // Dates outside the range are empty strings.
  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");

  // Rewind start to the Sunday of its week
  const startDay = start.getUTCDay();
  const gridStart = new Date(start.getTime() - startDay * 86_400_000);

  const weeks: string[][] = [];
  let cursor = new Date(gridStart);

  while (cursor <= end) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10);
      week.push(iso >= startDate && iso <= endDate ? iso : "");
      cursor = new Date(cursor.getTime() + 86_400_000);
    }
    weeks.push(week);
  }

  return weeks;
}

function ActivityHeatmap({
  dates,
  startDate,
  endDate,
}: {
  dates: string[];
  startDate: string;
  endDate: string;
}) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const activeSet = new Set(dates);
  const weeks = buildWeekGrid(startDate, endDate);

  // Build month label positions: for each week column, record the month if it's the first week that month appears
  const monthPositions: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const firstDay = week.find((d) => d !== "");
    if (!firstDay) return;
    const month = new Date(firstDay + "T00:00:00Z").getUTCMonth();
    if (month !== lastMonth) {
      monthPositions.push({ label: MONTH_LABELS[month], col });
      lastMonth = month;
    }
  });

  const today = new Date().toISOString().slice(0, 10);
  const CELL = 13;
  const GAP = 3;
  const STEP = CELL + GAP;

  return (
    <div className="p-5 rounded-xl border border-border/50 bg-card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-foreground">Learning Activity</p>
        <p className="text-xs text-muted-foreground">{dates.length} active {dates.length === 1 ? "day" : "days"} in the past 26 weeks</p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1 pl-8">
            {monthPositions.map(({ label, col }, i) => {
              const nextCol = monthPositions[i + 1]?.col ?? weeks.length;
              const widthPx = (nextCol - col) * STEP;
              return (
                <div
                  key={`${label}-${col}`}
                  className="text-[10px] text-muted-foreground shrink-0 overflow-hidden"
                  style={{ width: widthPx, minWidth: 0 }}
                >
                  {label}
                </div>
              );
            })}
          </div>

          <div className="flex gap-0">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-[3px] mr-1 shrink-0">
              {DAY_LABELS.map((d, i) => (
                <div
                  key={d}
                  className="text-[9px] text-muted-foreground/60 flex items-center"
                  style={{ height: CELL, visibility: i % 2 === 0 ? "hidden" : "visible" }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div
              className="flex gap-[3px] relative"
              onMouseLeave={() => setTooltip(null)}
            >
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((dateStr, di) => {
                    if (!dateStr) {
                      return <div key={di} style={{ width: CELL, height: CELL }} />;
                    }
                    const active = activeSet.has(dateStr);
                    const isToday = dateStr === today;
                    const d = new Date(dateStr + "T00:00:00Z");
                    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
                    return (
                      <div
                        key={dateStr}
                        style={{ width: CELL, height: CELL }}
                        className={`rounded-sm cursor-default transition-opacity
                          ${active
                            ? "bg-primary opacity-90 hover:opacity-100"
                            : "bg-muted/60 hover:bg-muted"
                          }
                          ${isToday ? "ring-1 ring-primary ring-offset-1 ring-offset-card" : ""}
                        `}
                        onMouseEnter={(e) => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          const parent = (e.target as HTMLElement).closest(".overflow-x-auto")!.getBoundingClientRect();
                          setTooltip({
                            text: active ? `${label} — lesson completed` : label,
                            x: rect.left - parent.left + CELL / 2,
                            y: rect.top - parent.top - 6,
                          });
                        }}
                      />
                    );
                  })}
                </div>
              ))}

              {/* Floating tooltip */}
              {tooltip && (
                <div
                  className="pointer-events-none absolute z-20 px-2 py-1 rounded-md bg-popover border border-border shadow-md text-[11px] text-popover-foreground whitespace-nowrap -translate-x-1/2 -translate-y-full"
                  style={{ left: tooltip.x, top: tooltip.y }}
                >
                  {tooltip.text}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 pl-8">
            <span className="text-[10px] text-muted-foreground mr-0.5">Less</span>
            {[false, false, true, true, true].map((a, i) => (
              <div
                key={i}
                style={{ width: CELL, height: CELL }}
                className={`rounded-sm ${a ? `bg-primary opacity-${40 + i * 30}` : "bg-muted/60"}`}
              />
            ))}
            <span className="text-[10px] text-muted-foreground ml-0.5">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Streak card
// ---------------------------------------------------------------------------

function StreakCard({ currentStreak, longestStreak, todayActive }: {
  currentStreak: number;
  longestStreak: number;
  todayActive: boolean;
}) {
  const isActive = currentStreak > 0;
  const flameColor = todayActive
    ? "text-orange-500"
    : isActive
      ? "text-orange-400/70"
      : "text-muted-foreground";
  const bgColor = todayActive
    ? "bg-orange-500/10"
    : isActive
      ? "bg-orange-400/10"
      : "bg-muted/40";

  return (
    <div className={`p-4 rounded-xl border transition-all
      ${todayActive
        ? "border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-amber-500/5"
        : isActive
          ? "border-orange-400/20 bg-card"
          : "border-border/50 bg-card"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${bgColor}`}>
          <Flame className={`w-4 h-4 ${flameColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-end gap-1.5">
            <span className="text-2xl font-bold text-foreground leading-tight">
              {currentStreak}
            </span>
            <span className="text-sm text-muted-foreground mb-0.5">
              {currentStreak === 1 ? "day" : "days"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Current streak</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-foreground">{longestStreak}</p>
          <p className="text-[10px] text-muted-foreground">Best streak</p>
        </div>
      </div>

      <p className={`text-[11px] mt-2.5 font-medium
        ${todayActive
          ? "text-orange-600 dark:text-orange-400"
          : isActive
            ? "text-amber-600 dark:text-amber-400"
            : "text-muted-foreground"
        }`}
      >
        {todayActive
          ? "You've learned today — streak active!"
          : isActive
            ? "Complete a lesson today to keep the streak alive"
            : "Start learning to build your streak"
        }
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Topic progress card
// ---------------------------------------------------------------------------

function TopicCard({ item, onContinue }: { item: LearnProgressItem; onContinue: () => void }) {
  const completedCount = item.completedLevels.length;
  const isMastered = completedCount >= TOTAL_LEVELS;
  const nextLevel = Math.min(TOTAL_LEVELS, completedCount + 1);
  const nextMeta = LEVEL_META[nextLevel - 1];
  const NextIcon = nextMeta?.icon ?? CheckCircle2;

  return (
    <div className={`p-4 rounded-xl border bg-card transition-all hover:shadow-sm group
      ${isMastered ? "border-green-500/30 hover:border-green-500/50" : "border-border/50 hover:border-primary/30"}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${isMastered ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
            {item.topic}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
              {DIFFICULTY_LABEL[item.difficulty] ?? item.difficulty}
            </Badge>
          </div>
        </div>
        {isMastered ? (
          <div className="shrink-0 p-1.5 rounded-lg bg-green-500/10">
            <Trophy className="w-4 h-4 text-green-500" />
          </div>
        ) : (
          <div className={`shrink-0 p-1.5 rounded-lg ${nextMeta.bg}`}>
            <NextIcon className={`w-4 h-4 ${nextMeta.color}`} />
          </div>
        )}
      </div>

      <div className="flex gap-1 mb-2.5">
        {Array.from({ length: TOTAL_LEVELS }, (_, i) => {
          const level = i + 1;
          const isComplete = item.completedLevels.includes(level);
          const m = LEVEL_META[i];
          return (
            <div
              key={level}
              title={`Level ${level}: ${m.title}`}
              className={`h-1.5 flex-1 rounded-full transition-all
                ${isComplete
                  ? isMastered ? "bg-green-500" : "bg-primary"
                  : "bg-muted"
                }`}
            />
          );
        })}
      </div>

      <div className="flex gap-1.5 mb-3">
        {LEVEL_META.map((m, i) => {
          const level = i + 1;
          const isComplete = item.completedLevels.includes(level);
          const isNext = level === nextLevel && !isMastered;
          const Icon = m.icon;
          return (
            <div
              key={level}
              title={`${m.title}${isComplete ? " ✓" : isNext ? " (next)" : " (locked)"}`}
              className={`w-6 h-6 rounded-md flex items-center justify-center
                ${isComplete ? "bg-green-500/15" : isNext ? m.bg : "bg-muted/40 opacity-40"}`}
            >
              {isComplete
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                : <Icon className={`w-3 h-3 ${isNext ? m.color : "text-muted-foreground"}`} />
              }
            </div>
          );
        })}
        <span className={`text-xs ml-auto font-medium self-center ${isMastered ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
          {completedCount}/{TOTAL_LEVELS} levels
        </span>
      </div>

      <Button
        size="sm"
        variant={isMastered ? "outline" : "default"}
        className="w-full gap-2 h-8 text-xs"
        onClick={onContinue}
        data-testid={`continue-${item.topic.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {isMastered ? (
          <><RotateCcw className="w-3.5 h-3.5" />Review topic</>
        ) : (
          <><ChevronRight className="w-3.5 h-3.5" />Continue — Level {nextLevel}: {nextMeta.title}</>
        )}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Certificate mini-card
// ---------------------------------------------------------------------------

const LANG_ICON: Record<string, string> = {
  python: "🐍", javascript: "⚡", html: "🌐", css: "🎨", java: "☕",
  "c++": "⚙️", typescript: "💙", react: "⚛️", sql: "🗄️", php: "🐘", go: "🔵", ruby: "💎",
};

function CertMiniCard({ cert }: { cert: CertificateRecord }) {
  const [copied, setCopied] = useState(false);
  const base = window.location.origin + (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
  const shareUrl = `${base}/certificate/${cert.id}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleView = () => {
    window.open(shareUrl, "_blank");
  };

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
      <div className="p-2 rounded-lg bg-amber-500/15 shrink-0">
        <Award className="w-4 h-4 text-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{LANG_ICON[cert.language] ?? "💻"}</span>
          <p className="text-sm font-semibold text-foreground truncate">{cert.topic}</p>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Issued {new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          {" · "}ID: {cert.id.slice(0, 6).toUpperCase()}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs" onClick={handleView}>
          <Download className="w-3 h-3" />
          View
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs" onClick={handleCopy}>
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Link2 className="w-3 h-3" />}
          {copied ? "Copied" : "Share"}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string;
  value: number;
  sub: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card">
      <div className={`p-2 rounded-lg ${color} shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress page
// ---------------------------------------------------------------------------

export function Progress() {
  const [, navigate] = useLocation();
  const [userId] = useState(() => getUserId());

  const { data, isLoading, isError, refetch } = useGetLearnProgress(
    { userId },
    { query: { queryKey: getGetLearnProgressQueryKey({ userId }), enabled: !!userId } },
  );

  const { data: streakData, isLoading: streakLoading } = useGetLearnStreak(
    { userId },
    { query: { queryKey: getGetLearnStreakQueryKey({ userId }), enabled: !!userId } },
  );

  const { data: activityData, isLoading: activityLoading } = useGetLearnActivity(
    { userId, weeks: 26 },
    { query: { queryKey: getGetLearnActivityQueryKey({ userId, weeks: 26 }), enabled: !!userId } },
  );

  const { data: certsData, isLoading: certsLoading } = useListCertificates(
    { userId },
    { query: { queryKey: getListCertificatesQueryKey({ userId }), enabled: !!userId, staleTime: 30_000 } },
  );

  const items = data?.items ?? [];

  const totalStarted = items.length;
  const totalMastered = items.filter(i => i.completedLevels.length >= TOTAL_LEVELS).length;
  const totalLevels = items.reduce((sum, i) => sum + i.completedLevels.length, 0);

  const grouped = items.reduce<Record<string, LearnProgressItem[]>>((acc, item) => {
    const lang = item.language;
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(item);
    return acc;
  }, {});

  for (const lang of Object.keys(grouped)) {
    grouped[lang].sort((a, b) => {
      const aMastered = a.completedLevels.length >= TOTAL_LEVELS ? 1 : 0;
      const bMastered = b.completedLevels.length >= TOTAL_LEVELS ? 1 : 0;
      return aMastered - bMastered || b.completedLevels.length - a.completedLevels.length;
    });
  }

  const handleContinue = (item: LearnProgressItem) => {
    const completedCount = item.completedLevels.length;
    const nextLevel = Math.min(TOTAL_LEVELS, completedCount + 1);
    const params = new URLSearchParams({
      resumeLanguage: item.language,
      resumeDifficulty: item.difficulty,
      resumeTopic: item.topic,
      resumeLevel: String(nextLevel),
    });
    navigate(`/learn?${params.toString()}`);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/40 flex items-center gap-3 sticky top-0 bg-background z-10">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Trophy className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-bold text-foreground leading-tight">My Progress</h1>
          <p className="text-xs text-muted-foreground">All topics you've started or mastered</p>
        </div>
        {!isLoading && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8" onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        )}
      </div>

      <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">

        {/* Streak + Stats row */}
        {isLoading || streakLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StreakCard
              currentStreak={streakData?.currentStreak ?? 0}
              longestStreak={streakData?.longestStreak ?? 0}
              todayActive={streakData?.todayActive ?? false}
            />
            <StatCard
              label="Topics started"
              value={totalStarted}
              sub={totalStarted === 1 ? "topic in progress" : "topics in progress"}
              icon={BookOpen}
              color="bg-primary/10 text-primary"
            />
            <StatCard
              label="Topics mastered"
              value={totalMastered}
              sub="all 5 levels complete"
              icon={Trophy}
              color="bg-green-500/10 text-green-500"
            />
            <StatCard
              label="Levels completed"
              value={totalLevels}
              sub={`out of ${totalStarted * TOTAL_LEVELS || "—"} total`}
              icon={CheckCircle2}
              color="bg-violet-500/10 text-violet-500"
            />
          </div>
        )}

        {/* Activity heatmap */}
        {activityLoading ? (
          <Skeleton className="h-36 rounded-xl" />
        ) : activityData ? (
          <ActivityHeatmap
            dates={activityData.dates}
            startDate={activityData.startDate}
            endDate={activityData.endDate}
          />
        ) : null}

        {/* Certificates section */}
        {certsLoading ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : certsData && certsData.items.length > 0 ? (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-foreground">My Certificates</h2>
              <span className="text-xs text-muted-foreground ml-1">{certsData.items.length} earned</span>
            </div>
            <div className="flex flex-col gap-2">
              {certsData.items.map((cert) => (
                <CertMiniCard key={cert.id} cert={cert} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Topic content */}
        {isLoading ? (
          <div className="flex flex-col gap-6">
            {[1, 2].map(g => (
              <div key={g}>
                <Skeleton className="h-6 w-32 mb-3 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-muted-foreground text-sm">Failed to load progress.</p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
            <div className="relative">
              <div className="p-5 rounded-2xl bg-primary/10 text-primary">
                <Code2 className="w-10 h-10" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                <Lock className="w-2.5 h-2.5 text-muted-foreground" />
              </div>
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">No progress yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Start a topic in Learn to Code and your progress will appear here automatically.
              </p>
            </div>
            <Button className="gap-2" onClick={() => navigate("/learn")}>
              <Sparkles className="w-4 h-4" />
              Start your first topic
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {Object.entries(grouped).map(([lang, langItems]) => {
              const meta = LANGUAGE_META[lang] ?? { label: lang, icon: "💻", color: "bg-muted/50 text-muted-foreground border-border/50" };
              const mastered = langItems.filter(i => i.completedLevels.length >= TOTAL_LEVELS).length;

              return (
                <section key={lang}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold ${meta.color}`}>
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {langItems.length} topic{langItems.length !== 1 ? "s" : ""}
                      {mastered > 0 && ` · ${mastered} mastered`}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {langItems.map(item => (
                      <TopicCard
                        key={item.id}
                        item={item}
                        onContinue={() => handleContinue(item)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            <div className="p-5 rounded-xl border border-dashed border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/10">
              <div>
                <p className="text-sm font-semibold text-foreground">Keep the streak going</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pick a new topic or continue where you left off.</p>
              </div>
              <Button className="gap-2 shrink-0" onClick={() => navigate("/learn")}>
                <Sparkles className="w-4 h-4" />
                Learn something new
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
