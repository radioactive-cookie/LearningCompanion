import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSearch } from "wouter";
import {
  Code2,
  Lightbulb,
  BookOpen,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Send,
  RefreshCw,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Lock,
  Trophy,
  Zap,
  Layers,
  Target,
  Save,
  RotateCcw,
  GraduationCap,
  Award,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  useGetLearnSuggestions,
  getGetLearnSuggestionsQueryKey,
  useGetLearnLesson,
  useGetLearnProgress,
  getGetLearnProgressQueryKey,
  useSaveLearnProgress,
  useCreateCertificate,
} from "@workspace/api-client-react";
import type {
  LearnSuggestion,
  LearnLessonResponse,
  GetLearnSuggestionsDifficulty,
  CertificateRecord,
} from "@workspace/api-client-react";
import { CertificateModal } from "@/components/CertificateModal";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

interface Language {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const LANGUAGES: Language[] = [
  { id: "python",     label: "Python",     icon: "🐍", color: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/15" },
  { id: "javascript", label: "JavaScript", icon: "⚡", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/15" },
  { id: "html",       label: "HTML",       icon: "🌐", color: "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/15" },
  { id: "css",        label: "CSS",        icon: "🎨", color: "bg-sky-500/10 text-sky-600 border-sky-500/20 hover:bg-sky-500/15" },
  { id: "java",       label: "Java",       icon: "☕", color: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/15" },
  { id: "c++",        label: "C++",        icon: "⚙️", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/15" },
  { id: "typescript", label: "TypeScript", icon: "💙", color: "bg-blue-600/10 text-blue-700 border-blue-600/20 hover:bg-blue-600/15" },
  { id: "react",      label: "React",      icon: "⚛️", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 hover:bg-cyan-500/15" },
  { id: "sql",        label: "SQL",        icon: "🗄️", color: "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/15" },
  { id: "php",        label: "PHP",        icon: "🐘", color: "bg-violet-500/10 text-violet-600 border-violet-500/20 hover:bg-violet-500/15" },
  { id: "go",         label: "Go",         icon: "🔵", color: "bg-teal-500/10 text-teal-600 border-teal-500/20 hover:bg-teal-500/15" },
  { id: "ruby",       label: "Ruby",       icon: "💎", color: "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/15" },
];

const DIFFICULTIES: { id: GetLearnSuggestionsDifficulty; label: string; desc: string }[] = [
  { id: "beginner",     label: "Beginner",     desc: "New to coding" },
  { id: "intermediate", label: "Intermediate", desc: "Know the basics" },
  { id: "advanced",     label: "Advanced",     desc: "Ready for challenges" },
];

const TOTAL_LEVELS = 5;
const LEVEL_META = [
  { title: "Fundamentals",   icon: GraduationCap, color: "text-teal-500 dark:text-teal-400",   bg: "bg-teal-500/10",   ring: "ring-teal-500/30" },
  { title: "Introduction",   icon: BookOpen,      color: "text-primary",                        bg: "bg-primary/10",    ring: "ring-primary/30" },
  { title: "Hands-on",       icon: Zap,           color: "text-amber-500 dark:text-amber-400",  bg: "bg-amber-500/10",  ring: "ring-amber-500/30" },
  { title: "Deep Dive",      icon: Layers,        color: "text-violet-500 dark:text-violet-400",bg: "bg-violet-500/10", ring: "ring-violet-500/30" },
  { title: "Challenge",      icon: Target,        color: "text-rose-500 dark:text-rose-400",    bg: "bg-rose-500/10",   ring: "ring-rose-500/30" },
];

// ---------------------------------------------------------------------------
// Fundamentals courses — one per language, always shown first for beginners
// ---------------------------------------------------------------------------

const LANGUAGE_FUNDAMENTALS: Record<string, { title: string; description: string }> = {
  python:     { title: "Python Fundamentals",     description: "Variables, data types, conditionals, loops, and functions — everything you need to write your first Python programs from scratch." },
  javascript: { title: "JavaScript Fundamentals", description: "Variables, functions, DOM basics, and events — the essential building blocks of web programming." },
  html:       { title: "HTML Fundamentals",       description: "Document structure, essential tags, links, images, and forms — the backbone of every webpage." },
  css:        { title: "CSS Fundamentals",        description: "Selectors, the box model, colors, fonts, and layouts — how to make webpages look great." },
  java:       { title: "Java Fundamentals",       description: "Classes, primitive types, control flow, and methods — the core concepts of Java programming." },
  "c++":      { title: "C++ Fundamentals",        description: "Variables, pointers, functions, and memory management — the essentials of C++ programming." },
  typescript: { title: "TypeScript Fundamentals", description: "Types, interfaces, functions, and type inference — adding safety and clarity to JavaScript code." },
  react:      { title: "React Fundamentals",      description: "Components, props, state, and hooks — the building blocks of modern React applications." },
  sql:        { title: "SQL Fundamentals",        description: "SELECT, INSERT, UPDATE, DELETE, and WHERE clauses — querying and managing relational databases." },
  php:        { title: "PHP Fundamentals",        description: "Variables, arrays, functions, and form handling — building dynamic web pages with PHP." },
  go:         { title: "Go Fundamentals",         description: "Variables, functions, structs, and goroutines — the essentials of Go programming." },
  ruby:       { title: "Ruby Fundamentals",       description: "Variables, methods, blocks, and classes — the elegant basics of Ruby programming." },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function topicKey(language: string, difficulty: string, topic: string) {
  return `${language}::${difficulty}::${topic}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LanguageCard({ lang, isSelected, onClick }: { lang: Language; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-150 text-sm font-medium group
        ${isSelected
          ? "border-primary bg-primary/10 text-primary shadow-sm scale-[1.03] ring-1 ring-primary/20"
          : `${lang.color} border hover:scale-[1.02] hover:shadow-sm`
        }`}
      data-testid={`lang-${lang.id}`}
    >
      <span className="text-xl leading-none transition-transform duration-150 group-hover:scale-110 group-active:scale-95">{lang.icon}</span>
      <span className="text-xs leading-tight">{lang.label}</span>
    </button>
  );
}

function TopicProgressBadge({ completedCount }: { completedCount: number }) {
  if (completedCount === 0) return null;
  if (completedCount >= TOTAL_LEVELS) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full shrink-0">
        <Trophy className="w-2.5 h-2.5" />
        Mastered
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full shrink-0">
      <RotateCcw className="w-2.5 h-2.5" />
      {completedCount}/{TOTAL_LEVELS}
    </span>
  );
}

function TopicCard({
  suggestion,
  completedCount,
  onClick,
}: {
  suggestion: LearnSuggestion;
  completedCount: number;
  onClick: () => void;
}) {
  const isMastered = completedCount >= TOTAL_LEVELS;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border bg-card hover:shadow-md hover:-translate-y-px transition-all duration-200 group
        ${isMastered
          ? "border-green-500/30 hover:border-green-500/50"
          : completedCount > 0
            ? "border-amber-500/30 hover:border-amber-500/50"
            : "border-border/50 hover:border-primary/40 hover:bg-primary/5"
        }`}
      data-testid={`topic-${suggestion.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-semibold transition-colors ${isMastered ? "text-green-600 dark:text-green-400" : "text-foreground group-hover:text-primary"}`}>
          {suggestion.title}
        </p>
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          <TopicProgressBadge completedCount={completedCount} />
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{suggestion.description}</p>
      {completedCount > 0 && completedCount < TOTAL_LEVELS && (
        <div className="mt-2.5 flex gap-1">
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i < completedCount ? "bg-amber-500" : "bg-muted"}`}
            />
          ))}
        </div>
      )}
      {isMastered && (
        <div className="mt-2.5 flex gap-1">
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full bg-green-500" />
          ))}
        </div>
      )}
    </button>
  );
}

function FundamentalsCard({
  language,
  completedCount,
  onClick,
}: {
  language: Language;
  completedCount: number;
  onClick: () => void;
}) {
  const fund = LANGUAGE_FUNDAMENTALS[language.id];
  if (!fund) return null;

  const isMastered = completedCount >= TOTAL_LEVELS;
  const inProgress = completedCount > 0 && !isMastered;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 group
        ${isMastered
          ? "border-green-500/40 bg-green-500/5 hover:border-green-500/60"
          : "border-teal-500/30 bg-teal-500/5 hover:border-teal-500/50 hover:bg-teal-500/8"
        }`}
      data-testid="fundamentals-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className={`p-1.5 rounded-lg shrink-0 ${isMastered ? "bg-green-500/15" : "bg-teal-500/15"}`}>
            <GraduationCap className={`w-4 h-4 ${isMastered ? "text-green-500" : "text-teal-500 dark:text-teal-400"}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-sm font-bold leading-snug ${isMastered ? "text-green-600 dark:text-green-400" : "text-teal-700 dark:text-teal-300"}`}>
                {fund.title}
              </p>
              {isMastered ? (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                  <Trophy className="w-2.5 h-2.5" />Mastered
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                  ★ Start Here
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${isMastered ? "text-green-500" : "text-teal-500 group-hover:text-teal-600"}`} />
      </div>

      <p className="text-xs text-muted-foreground mt-2 leading-relaxed pl-[2.375rem]">
        {fund.description}
      </p>

      {(inProgress || isMastered) && (
        <div className="mt-2.5 flex gap-1 pl-[2.375rem]">
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < completedCount
                  ? isMastered ? "bg-green-500" : "bg-teal-500"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </button>
  );
}

function TopicSuggestionSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
      {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-[72px] w-full rounded-xl" />)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson progression stepper
// ---------------------------------------------------------------------------

function LevelStepper({
  currentLevel,
  highestUnlocked,
  completedLevels,
  onSelectLevel,
}: {
  currentLevel: number;
  highestUnlocked: number;
  completedLevels: Set<number>;
  onSelectLevel: (level: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {LEVEL_META.map((meta, i) => {
        const level = i + 1;
        const isCompleted = completedLevels.has(level);
        const isActive = level === currentLevel;
        const isLocked = level > highestUnlocked;
        const Icon = meta.icon;

        return (
          <button
            key={level}
            disabled={isLocked}
            onClick={() => !isLocked && onSelectLevel(level)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-150 text-left w-full
              ${isActive
                ? `border-primary/40 bg-primary/8 ring-1 ${meta.ring}`
                : isCompleted
                  ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
                  : isLocked
                    ? "border-border/20 bg-muted/20 opacity-40 cursor-not-allowed"
                    : "border-border/40 hover:border-primary/30 hover:bg-muted/40 cursor-pointer"
              }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ? "bg-green-500/15" : isActive ? meta.bg : "bg-muted/50"}`}>
              {isCompleted
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                : isLocked
                  ? <Lock className="w-3 h-3 text-muted-foreground" />
                  : <Icon className={`w-3.5 h-3.5 ${isActive ? meta.color : "text-muted-foreground"}`} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${isActive ? "text-foreground" : isCompleted ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                Level {level} — {meta.title}
              </p>
            </div>
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

function LessonSkeleton() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="px-6 py-4 border-b border-border/40 flex items-center gap-3">
        <Skeleton className="h-8 w-16 rounded-md" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 p-6 flex flex-col gap-4 lg:border-r border-border/40">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
        <div className="lg:w-80 xl:w-96 shrink-0 p-6 flex flex-col gap-3">
          <Skeleton className="h-5 w-32" />
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          <Skeleton className="h-24 w-full rounded-xl mt-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LessonView
// ---------------------------------------------------------------------------

function LessonView({
  language,
  difficulty,
  topic,
  lesson,
  currentLevel,
  highestUnlocked,
  completedLevels,
  isLoadingLevel,
  isSaving,
  onSelectLevel,
  onCompleteLevel,
  onBack,
  onViewCertificate,
}: {
  language: Language;
  difficulty: GetLearnSuggestionsDifficulty;
  topic: string;
  lesson: LearnLessonResponse;
  currentLevel: number;
  highestUnlocked: number;
  completedLevels: Set<number>;
  isLoadingLevel: boolean;
  isSaving: boolean;
  onSelectLevel: (level: number) => void;
  onCompleteLevel: () => void;
  onBack: () => void;
  onViewCertificate?: () => void;
}) {
  const [showHint, setShowHint] = useState(false);
  const diffLabel = DIFFICULTIES.find((d) => d.id === difficulty)?.label ?? difficulty;
  const meta = LEVEL_META[currentLevel - 1];
  const LevelIcon = meta.icon;
  const isCompleted = completedLevels.has(currentLevel);
  const isLastLevel = currentLevel === TOTAL_LEVELS;
  const allComplete = completedLevels.size === TOTAL_LEVELS;

  return (
    <div className="flex-1 overflow-y-auto flex flex-col animate-in fade-in duration-200">
      {/* Top bar */}
      <div className="px-6 py-3 border-b border-border/40 flex items-center gap-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 transition-all duration-150 hover:bg-muted/60" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          {/* Progress dots */}
          <div className="flex items-center gap-1 mr-2">
            {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((l) => (
              <div key={l} className={`w-2 h-2 rounded-full transition-all ${completedLevels.has(l) ? "bg-green-500" : l === currentLevel ? "bg-primary" : l <= highestUnlocked ? "bg-muted-foreground/40" : "bg-muted-foreground/20"}`} />
            ))}
          </div>
          {isSaving && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground animate-pulse">
              <Save className="w-3 h-3" /> Saving…
            </span>
          )}
          <Badge variant="outline" className={`text-xs ${language.color}`}>{language.icon} {language.label}</Badge>
          <Badge variant="outline" className="text-xs capitalize">{diffLabel}</Badge>
        </div>
      </div>

      {/* Two-column body */}
      <div className="flex-1 flex flex-col lg:flex-row">

        {/* LEFT — Explanation + Code */}
        <div className="flex-1 p-6 flex flex-col gap-5 min-w-0 lg:border-r border-border/40">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${meta.bg} shrink-0 mt-0.5`}>
              <LevelIcon className={`w-4 h-4 ${meta.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{topic}</h2>
              <p className={`text-xs font-medium uppercase tracking-wide mt-0.5 ${meta.color}`}>
                Level {currentLevel} — {lesson.levelTitle}
              </p>
            </div>
          </div>

          {isLoadingLevel ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-44 w-full rounded-xl" />
            </div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${topic}-${currentLevel}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col gap-5"
              >
              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-primary">
                    <BookOpen className="w-4 h-4" />
                    Explanation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none font-sans
                    prose-p:text-sm prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:my-1.5
                    prose-ul:my-1.5 prose-ul:pl-4 prose-li:my-0.5 prose-li:text-sm prose-li:text-foreground/90
                    prose-ol:my-1.5 prose-ol:pl-4
                    prose-strong:text-foreground
                    prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                  ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {lesson.explanation}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              {lesson.codeExample && (
                <Card className="border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <Terminal className="w-4 h-4" />
                      Code Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted/70 rounded-lg p-4 font-mono whitespace-pre-wrap text-foreground/90 leading-relaxed overflow-x-auto">
                      {lesson.codeExample}
                    </pre>
                  </CardContent>
                </Card>
              )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* RIGHT — Progress tracker + Task + Hint + CTA */}
        <div className="lg:w-80 xl:w-96 shrink-0 p-6 flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Progress</p>
            <LevelStepper
              currentLevel={currentLevel}
              highestUnlocked={highestUnlocked}
              completedLevels={completedLevels}
              onSelectLevel={onSelectLevel}
            />
          </div>

          {!isLoadingLevel && (
            <>
              <motion.div layout>
                <Card className={`border-border/60 ${isCompleted ? "opacity-60" : ""}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm flex items-center gap-2 ${meta.color}`}>
                      <Code2 className="w-4 h-4" />
                      Your Task
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/90 leading-relaxed">{lesson.task}</p>
                  </CardContent>
                </Card>
              </motion.div>

              {lesson.hint && !isCompleted && (
                <>
                  {!showHint ? (
                    <Button variant="outline" size="sm" className="gap-2 text-muted-foreground w-full" onClick={() => setShowHint(true)} data-testid="btn-show-hint">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Show hint
                    </Button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                      <Card className="border-amber-200/50 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2 text-amber-600 dark:text-amber-400">
                            <Lightbulb className="w-4 h-4" />Hint
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-foreground/80 leading-relaxed">{lesson.hint}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </>
              )}

              <div className="mt-auto">
                {allComplete ? (
                  <div className="flex flex-col items-center gap-2 py-4 text-center">
                    <div className="p-3 rounded-full bg-green-500/15">
                      <Trophy className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">Topic mastered!</p>
                    <p className="text-xs text-muted-foreground">All {TOTAL_LEVELS} levels complete.</p>
                    <div className="flex flex-col gap-2 w-full mt-1">
                      {onViewCertificate && (
                        <Button size="sm" className="gap-1.5 w-full bg-amber-500 hover:bg-amber-600 text-white" onClick={onViewCertificate}>
                          <Award className="w-3.5 h-3.5" />
                          View Certificate
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="gap-1.5 w-full" onClick={onBack}>
                        <Sparkles className="w-3.5 h-3.5" />
                        Choose another topic
                      </Button>
                    </div>
                  </div>
                ) : isCompleted ? (
                  <Button className="w-full gap-2" onClick={() => onSelectLevel(currentLevel + 1)}>
                    Next Level: {LEVEL_META[currentLevel]?.title}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    className="w-full gap-2"
                    onClick={onCompleteLevel}
                    disabled={isSaving}
                    data-testid="btn-mark-complete"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isSaving ? "Saving…" : `Mark complete & ${isLastLevel ? "finish" : "unlock next"}`}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Learn page
// ---------------------------------------------------------------------------

export function Learn() {
  const search = useSearch();
  const { user } = useAuth();
  const userId = user?.id ?? "";

  // Parse resume params from URL (?resumeLanguage=python&resumeDifficulty=beginner&resumeTopic=X)
  const resumeParams = useState(() => {
    const p = new URLSearchParams(search);
    const lang = p.get("resumeLanguage") ?? "";
    const diff = p.get("resumeDifficulty") ?? "";
    const topic = p.get("resumeTopic") ?? "";
    const matchedLang = LANGUAGES.find(l => l.id === lang.toLowerCase()) ?? null;
    const validDiff = (["beginner", "intermediate", "advanced"] as GetLearnSuggestionsDifficulty[]).includes(diff as GetLearnSuggestionsDifficulty)
      ? (diff as GetLearnSuggestionsDifficulty)
      : null;
    const rawLevel = parseInt(p.get("resumeLevel") ?? "1", 10);
    const level = rawLevel >= 1 && rawLevel <= TOTAL_LEVELS ? rawLevel : 1;
    return matchedLang && validDiff && topic ? { lang: matchedLang, diff: validDiff, topic, level } : null;
  })[0];

  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    resumeParams?.lang ?? LANGUAGES[0],
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<GetLearnSuggestionsDifficulty>(
    resumeParams?.diff ?? "beginner",
  );
  const [customTopic, setCustomTopic] = useState("");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [topicSearch, setTopicSearch] = useState("");

  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedByTopic, setCompletedByTopic] = useState<Map<string, Set<number>>>(new Map());
  const [loadedLessons, setLoadedLessons] = useState<Map<string, Map<number, LearnLessonResponse>>>(new Map());
  const [lessonError, setLessonError] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const resumeApplied = useRef(false);

  // Certificate modal state
  const [certModalData, setCertModalData] = useState<{ cert: CertificateRecord; shareUrl: string } | null>(null);
  const certIssuedRef = useRef<Set<string>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);

  // ------------------------------------------------------------------
  // Load saved progress on mount
  // ------------------------------------------------------------------
  const { data: progressData } = useGetLearnProgress(
    { userId },
    { query: { queryKey: getGetLearnProgressQueryKey({ userId }), enabled: !!userId, staleTime: 30_000 } },
  );

  // Hydrate completedByTopic once from DB
  useEffect(() => {
    if (!progressData || progressLoaded) return;
    const map = new Map<string, Set<number>>();
    for (const item of progressData.items) {
      const key = topicKey(item.language, item.difficulty, item.topic);
      map.set(key, new Set(item.completedLevels));
    }
    if (map.size > 0) setCompletedByTopic(map);
    setProgressLoaded(true);
  }, [progressData, progressLoaded]);

  // Auto-open topic when navigated from My Progress page
  const loadLevelRef = useRef<((topic: string, level: number) => void) | null>(null);
  useEffect(() => {
    if (!resumeParams || resumeApplied.current) return;
    resumeApplied.current = true;
    setActiveTopic(resumeParams.topic);
    setCurrentLevel(resumeParams.level);
    // loadLevel will be ready after first render; call via ref
    setTimeout(() => loadLevelRef.current?.(resumeParams.topic, resumeParams.level), 0);
  }, [resumeParams]);

  // ------------------------------------------------------------------
  // Certificate mutation
  // ------------------------------------------------------------------
  const createCertMutation = useCreateCertificate({
    mutation: {
      onSuccess: (cert) => {
        const base = window.location.origin + (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
        const shareUrl = `${base}/certificate/${cert.id}`;
        setCertModalData({ cert, shareUrl });
      },
    },
  });

  const tryIssueCertificate = useCallback((topic: string, language: string) => {
    if (!userId) return; // requires authentication
    const key = `${language}::${topic}`;
    if (certIssuedRef.current.has(key)) return;
    certIssuedRef.current.add(key);
    createCertMutation.mutate({
      data: { userId, language, topic },
    });
  }, [userId, createCertMutation]);

  // ------------------------------------------------------------------
  // Save progress mutation
  // ------------------------------------------------------------------
  const saveProgressMutation = useSaveLearnProgress();

  const persistProgress = (topic: string, newCompletedSet: Set<number>) => {
    if (!userId) return; // requires authentication
    saveProgressMutation.mutate({
      data: {
        userId,
        language: selectedLanguage.id,
        difficulty: selectedDifficulty,
        topic,
        completedLevels: Array.from(newCompletedSet),
      },
    });
  };

  // ------------------------------------------------------------------
  // Topic suggestions
  // ------------------------------------------------------------------
  const suggestionsQueryKey = getGetLearnSuggestionsQueryKey({ language: selectedLanguage.id, difficulty: selectedDifficulty });
  const { data: suggestionsData, isLoading: isLoadingSuggestions, isError: isSuggestionsError, refetch: refetchSuggestions } =
    useGetLearnSuggestions({ language: selectedLanguage.id, difficulty: selectedDifficulty }, { query: { queryKey: suggestionsQueryKey } });

  // ------------------------------------------------------------------
  // Lesson loading
  // ------------------------------------------------------------------
  const getLessonMutation = useGetLearnLesson({
    mutation: {
      onSuccess: (data, variables) => {
        const key = topicKey(selectedLanguage.id, selectedDifficulty, variables.data.topic);
        setLoadedLessons((prev) => {
          const next = new Map(prev);
          const levelMap = new Map(next.get(key) ?? []);
          levelMap.set(variables.data.level, data);
          next.set(key, levelMap);
          return next;
        });
        setLessonError(false);
      },
      onError: () => setLessonError(true),
    },
  });

  const loadLevel = useCallback((topic: string, level: number) => {
    const key = topicKey(selectedLanguage.id, selectedDifficulty, topic);
    const already = loadedLessons.get(key)?.get(level);
    if (already) { setCurrentLevel(level); return; }
    setCurrentLevel(level);
    getLessonMutation.mutate({
      data: { language: selectedLanguage.id, difficulty: selectedDifficulty, topic, level },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage.id, selectedDifficulty]);

  // Keep the ref in sync so the deep-link effect can call the latest version
  useEffect(() => { loadLevelRef.current = loadLevel; }, [loadLevel]);

  const handleBack = () => {
    setActiveTopic(null);
    setCurrentLevel(1);
    setLessonError(false);
    setCustomTopic("");
  };

  const handleSelectTopic = (topic: string) => {
    setActiveTopic(topic);
    setCurrentLevel(1);
    setLessonError(false);
    loadLevel(topic, 1);
  };

  const handleCompleteLevel = () => {
    if (!activeTopic) return;
    const key = topicKey(selectedLanguage.id, selectedDifficulty, activeTopic);
    setCompletedByTopic((prev) => {
      const next = new Map(prev);
      const newSet = new Set(next.get(key) ?? []);
      newSet.add(currentLevel);
      next.set(key, newSet);
      return next;
    });
    // Persist after state update
    setTimeout(() => {
      const existing = completedByTopic.get(key) ?? new Set<number>();
      const updated = new Set([...existing, currentLevel]);
      persistProgress(activeTopic, updated);
    }, 0);

    const willBeAllDone = currentLevel === TOTAL_LEVELS;
    if (currentLevel < TOTAL_LEVELS) {
      const nextLevel = currentLevel + 1;
      loadLevel(activeTopic, nextLevel);
      setCurrentLevel(nextLevel);
    }

    // Issue certificate when all 5 levels of a fundamentals course are complete
    if (willBeAllDone && LANGUAGE_FUNDAMENTALS[selectedLanguage.id]?.title === activeTopic) {
      tryIssueCertificate(activeTopic, selectedLanguage.id);
    }
  };

  const handleSelectLevel = (level: number) => {
    if (!activeTopic) return;
    loadLevel(activeTopic, level);
  };

  const handleLanguageChange = (lang: Language) => { setSelectedLanguage(lang); handleBack(); setTopicSearch(""); };
  const handleDifficultyChange = (d: GetLearnSuggestionsDifficulty) => { setSelectedDifficulty(d); handleBack(); setTopicSearch(""); };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = customTopic.trim();
    if (!t) return;
    handleSelectTopic(t);
  };

  // Derived state
  const activeKey = activeTopic ? topicKey(selectedLanguage.id, selectedDifficulty, activeTopic) : null;
  const completedLevels = (activeKey ? completedByTopic.get(activeKey) : null) ?? new Set<number>();
  const highestUnlocked = Math.min(TOTAL_LEVELS, completedLevels.size + 1);
  const currentLesson = activeKey ? (loadedLessons.get(activeKey)?.get(currentLevel) ?? null) : null;
  const isLoadingLevel = getLessonMutation.isPending &&
    getLessonMutation.variables?.data?.topic === activeTopic &&
    getLessonMutation.variables?.data?.level === currentLevel;

  // Helper: completed count for a suggestion topic
  const getTopicCompletedCount = (topicTitle: string) => {
    const key = topicKey(selectedLanguage.id, selectedDifficulty, topicTitle);
    return completedByTopic.get(key)?.size ?? 0;
  };

  // Search filtering
  const searchTerm = topicSearch.toLowerCase().trim();
  const allSuggestions = suggestionsData?.suggestions ?? [];
  const filteredSuggestions = searchTerm
    ? allSuggestions.filter(
        (s) =>
          s.title.toLowerCase().includes(searchTerm) ||
          s.description.toLowerCase().includes(searchTerm),
      )
    : allSuggestions;
  const fundInfo = LANGUAGE_FUNDAMENTALS[selectedLanguage.id];
  const showFundamentals =
    selectedDifficulty === "beginner" &&
    !!fundInfo &&
    (!searchTerm ||
      fundInfo.title.toLowerCase().includes(searchTerm) ||
      fundInfo.description.toLowerCase().includes(searchTerm));
  const noResults = searchTerm && !showFundamentals && filteredSuggestions.length === 0;

  // ------------------------------------------------------------------
  // Lesson view
  // ------------------------------------------------------------------
  if (activeTopic) {
    if (!currentLesson && !lessonError) return <LessonSkeleton />;

    if (lessonError && !currentLesson) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="p-4 rounded-2xl bg-destructive/10 text-destructive"><AlertCircle className="w-8 h-8" /></div>
          <p className="text-muted-foreground text-sm">Failed to load this lesson. Please try again.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleBack}><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back</Button>
            <Button size="sm" onClick={() => { setLessonError(false); loadLevel(activeTopic, currentLevel); }}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Retry</Button>
          </div>
        </div>
      );
    }

    if (currentLesson) {
      const isFundamentals = LANGUAGE_FUNDAMENTALS[selectedLanguage.id]?.title === activeTopic;
      return (
        <>
          <LessonView
            language={selectedLanguage}
            difficulty={selectedDifficulty}
            topic={activeTopic}
            lesson={currentLesson}
            currentLevel={currentLevel}
            highestUnlocked={highestUnlocked}
            completedLevels={completedLevels}
            isLoadingLevel={isLoadingLevel}
            isSaving={saveProgressMutation.isPending}
            onSelectLevel={handleSelectLevel}
            onCompleteLevel={handleCompleteLevel}
            onBack={handleBack}
            onViewCertificate={isFundamentals && completedLevels.size >= TOTAL_LEVELS
              ? () => tryIssueCertificate(activeTopic, selectedLanguage.id)
              : undefined}
          />
          {certModalData && (
            <CertificateModal
              cert={certModalData.cert}
              shareUrl={certModalData.shareUrl}
              onClose={() => setCertModalData(null)}
              onNameSave={(name) => {
                localStorage.setItem("certificate-user-name", name);
              }}
            />
          )}
        </>
      );
    }
  }

  // ------------------------------------------------------------------
  // Topic selection landing
  // ------------------------------------------------------------------
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-3.5 border-b border-border/40 flex items-center gap-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="p-2 rounded-lg bg-primary/10 text-primary"><Code2 className="w-4 h-4" /></div>
        <div>
          <h1 className="text-sm font-bold text-foreground leading-tight tracking-tight">Learn to Code</h1>
          <p className="text-xs text-muted-foreground">Choose a language, difficulty, and topic to get started</p>
        </div>
        {completedByTopic.size > 0 && (
          <Badge variant="outline" className="ml-auto gap-1 text-xs text-green-600 border-green-500/30 bg-green-500/5">
            <Trophy className="w-3 h-3" />
            {Array.from(completedByTopic.values()).filter(s => s.size >= TOTAL_LEVELS).length} mastered
          </Badge>
        )}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start">
        {/* LEFT — Language, Difficulty, Custom input */}
        <aside className="lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-[61px] lg:self-start border-b lg:border-b-0 lg:border-r border-border/40 p-5 flex flex-col gap-5">
          <section>
            <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Language</h2>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => (
                <LanguageCard key={lang.id} lang={lang} isSelected={selectedLanguage.id === lang.id} onClick={() => handleLanguageChange(lang)} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Difficulty</h2>
            <div className="flex flex-col gap-1.5">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleDifficultyChange(d.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all duration-150 text-left ${
                    selectedDifficulty === d.id
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-muted/40"
                  }`}
                  data-testid={`diff-${d.id}`}
                >
                  <span className="text-sm font-semibold">{d.label}</span>
                  <span className="text-[11px] opacity-60">{d.desc}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Custom Topic</h2>
            <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2">
              <Input
                ref={inputRef}
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder={`e.g. "Async/Await in ${selectedLanguage.label}"…`}
                className="text-sm"
                data-testid="custom-topic-input"
              />
              <Button type="submit" disabled={!customTopic.trim()} size="sm" className="gap-1.5 w-full">
                <Send className="w-3.5 h-3.5" />
                Start Learning
              </Button>
            </form>
          </section>
        </aside>

        {/* RIGHT — Suggestions + progress info */}
        <div className="flex-1 p-5 flex flex-col gap-4 min-w-0">

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              placeholder={`Search topics for ${selectedLanguage.label}…`}
              className="pl-8 pr-8 text-sm h-9"
            />
            {topicSearch && (
              <button
                onClick={() => setTopicSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Pinned fundamentals course — beginners only, filtered by search */}
          {showFundamentals && (
            <div className="flex flex-col gap-2">
              <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-teal-500" />
                Recommended First
              </h2>
              <FundamentalsCard
                language={selectedLanguage}
                completedCount={getTopicCompletedCount(LANGUAGE_FUNDAMENTALS[selectedLanguage.id].title)}
                onClick={() => handleSelectTopic(LANGUAGE_FUNDAMENTALS[selectedLanguage.id].title)}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {searchTerm
                ? `Results for "${topicSearch}"`
                : `Suggested for ${selectedLanguage.label} · ${DIFFICULTIES.find(d => d.id === selectedDifficulty)?.label}`}
            </h2>
            {!isLoadingSuggestions && !searchTerm && (
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-muted-foreground" onClick={() => refetchSuggestions()} data-testid="btn-refresh-suggestions">
                <RefreshCw className="w-3 h-3" />
                Refresh
              </Button>
            )}
          </div>

          {isLoadingSuggestions ? (
            <TopicSuggestionSkeleton />
          ) : isSuggestionsError ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Failed to load suggestions.{" "}
              <button className="underline text-primary" onClick={() => refetchSuggestions()}>Try again</button>
            </div>
          ) : noResults ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="p-3 rounded-full bg-muted/50">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No topics match "{topicSearch}"</p>
                <p className="text-xs text-muted-foreground mt-0.5">You can learn it anyway — just click below</p>
              </div>
              <Button
                size="sm"
                className="gap-1.5 mt-1"
                onClick={() => { handleSelectTopic(topicSearch); setTopicSearch(""); }}
              >
                <Send className="w-3.5 h-3.5" />
                Start learning "{topicSearch}"
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {filteredSuggestions.map((s) => (
                  <TopicCard
                    key={s.id}
                    suggestion={s}
                    completedCount={getTopicCompletedCount(s.title)}
                    onClick={() => handleSelectTopic(s.title)}
                  />
                ))}
              </div>

              {/* Progression explainer */}
              <div className="mt-2 p-4 rounded-xl border border-border/40 bg-muted/20 flex flex-col gap-2">
                <p className="text-xs font-semibold text-foreground">How the progression system works</p>
                <div className="grid grid-cols-2 gap-2">
                  {LEVEL_META.map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${m.bg}`}>
                          <Icon className={`w-3 h-3 ${m.color}`} />
                        </div>
                        <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{i + 1}.</span> {m.title}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Complete each task to unlock the next level. Progress is saved automatically.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
