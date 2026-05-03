import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  BookOpen,
  Zap,
  Layers,
  Target,
  ChevronRight,
  MessageSquare,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import brandIcon from "@assets/image_1777788437108.png";

const FEATURES = [
  {
    icon: BookOpen,
    color: "text-primary bg-primary/10",
    title: "Introduction",
    desc: "Learn concepts from scratch with clear, beginner-friendly explanations.",
  },
  {
    icon: Zap,
    color: "text-amber-500 bg-amber-500/10",
    title: "Hands-on Practice",
    desc: "Build real patterns through worked examples and guided coding tasks.",
  },
  {
    icon: Layers,
    color: "text-violet-500 bg-violet-500/10",
    title: "Deep Dive",
    desc: "Master edge cases, best practices, and professional-grade techniques.",
  },
  {
    icon: Target,
    color: "text-rose-500 bg-rose-500/10",
    title: "Challenge",
    desc: "Prove your skills with a concrete mini-project. All unlocked in order.",
  },
];

const LANGUAGES = ["Python", "JavaScript", "TypeScript", "React", "Java", "C++", "Go", "SQL", "Ruby", "PHP"];

export function Landing() {
  const [, navigate] = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col overflow-y-auto">

      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-white p-1.5 rounded-lg border border-border/50 shadow-sm">
              <img src={brandIcon} alt="Companion" className="w-4 h-4 object-contain" />
            </div>
            <span className="font-semibold text-base tracking-tight text-foreground">Companion</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => navigate("/chat")}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              AI Chat
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative">
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center gap-6 max-w-3xl mx-auto">
            <Badge variant="outline" className="gap-1.5 text-xs text-primary border-primary/30 bg-primary/5 px-3 py-1">
              <Zap className="w-3 h-3" />
              AI-powered · 4-level progression · 12 languages
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08]">
              Your AI{" "}
              <span className="text-primary">Coding</span>
              {" "}Mentor
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Learn any programming language through a structured 4-level progression —
              from first concepts to real-world challenges. All content generated fresh by AI,
              just for you.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <Button
                size="lg"
                className="h-12 px-8 text-base font-semibold gap-2 shadow-sm"
                onClick={() => navigate("/learn")}
                data-testid="btn-start-learning"
              >
                Start Learning
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base gap-2"
                onClick={() => navigate("/chat")}
                data-testid="btn-open-chat"
              >
                <MessageSquare className="w-4 h-4" />
                Open AI Chat
              </Button>
            </div>

            {/* Language pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-lg">
              {LANGUAGES.map((lang) => (
                <span
                  key={lang}
                  className="text-xs px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground bg-muted/30"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 4-level feature grid */}
        <section className="px-6 py-16 bg-muted/20 border-t border-border/40">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-foreground">Structured to take you from zero to mastery</h2>
              <p className="text-muted-foreground mt-2 text-sm">Each topic unlocks level by level. You can't skip ahead — every stage builds on the last.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="p-5 rounded-2xl border border-border/50 bg-card flex flex-col gap-3 hover:shadow-sm transition-shadow">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Level {i + 1} — {f.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA strip */}
        <section className="px-6 py-14 border-t border-border/40 text-center">
          <div className="max-w-xl mx-auto flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-foreground">Ready to start?</h2>
            <p className="text-muted-foreground text-sm">Pick a language and difficulty — your first lesson is one click away.</p>
            <Button
              size="lg"
              className="h-12 px-10 text-base font-semibold gap-2"
              onClick={() => navigate("/learn")}
            >
              Start Learning
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </section>

        <footer className="border-t border-border/40 py-5 text-center text-xs text-muted-foreground">
          Companion · Your AI Coding Mentor
        </footer>
      </main>
    </div>
  );
}
