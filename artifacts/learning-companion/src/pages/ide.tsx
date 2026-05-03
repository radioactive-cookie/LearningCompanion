import { useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "@/components/theme-provider";
import {
  Play,
  Send,
  RotateCcw,
  Terminal,
  Sparkles,
  Loader2,
  Copy,
  Check,
  ChevronDown,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function api(path: string, options?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
}

const STARTER_CODE: Record<string, string> = {
  javascript: `// Welcome to the Coding IDE!
// Write your JavaScript code here and click "Run Code"

function greet(name) {
  return \`Hello, \${name}! 🎉\`;
}

console.log(greet("World"));

// Try some math
const nums = [1, 2, 3, 4, 5];
const sum = nums.reduce((a, b) => a + b, 0);
console.log("Sum:", sum);
console.log("Average:", sum / nums.length);
`,
};

const LANGUAGE_OPTIONS = [
  { id: "javascript", label: "JavaScript", icon: "⚡" },
];

// ---------------------------------------------------------------------------
// Output console
// ---------------------------------------------------------------------------
function OutputConsole({
  output,
  error,
  isRunning,
}: {
  output: string | null;
  error: string | null;
  isRunning: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const text = error ?? output;

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Output</span>
          {error && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Error</Badge>
          )}
          {output && !error && (
            <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-0">OK</Badge>
          )}
        </div>
        {text && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-[#0d1117] dark:bg-[#0d1117] rounded-b-none font-mono text-sm">
        {isRunning ? (
          <div className="flex items-center gap-2 p-4 text-emerald-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-xs">Running…</span>
          </div>
        ) : text ? (
          <pre
            className={`p-4 whitespace-pre-wrap leading-relaxed text-xs ${
              error ? "text-red-400" : "text-emerald-300"
            }`}
          >
            {error ? `✗ ${error}` : text}
          </pre>
        ) : (
          <div className="p-4 text-muted-foreground/40 text-xs">
            Click <span className="text-primary font-medium">Run Code</span> to see output here…
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Feedback panel
// ---------------------------------------------------------------------------
function AiFeedback({
  feedback,
  isLoading,
}: {
  feedback: string | null;
  isLoading: boolean;
}) {
  if (!isLoading && !feedback) return null;

  return (
    <div className="flex flex-col border-t border-border/40 min-h-0">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI Feedback</span>
      </div>
      <div className="flex-1 overflow-auto p-3">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-xs">Analysing your code…</span>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none
            prose-p:text-sm prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:my-1
            prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5 prose-li:text-sm
            prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5
            prose-code:rounded prose-code:text-xs prose-code:font-mono
            prose-code:before:content-none prose-code:after:content-none
            prose-strong:text-foreground
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedback ?? ""}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main IDE page
// ---------------------------------------------------------------------------
export function IdePage() {
  const { theme } = useTheme();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(STARTER_CODE["javascript"]);

  const [output, setOutput] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editorRef = useRef<unknown>(null);

  const monacoTheme = theme === "dark" ? "vs-dark" : "light";

  const handleEditorDidMount = (editor: unknown) => {
    editorRef.current = editor;
  };

  const handleReset = useCallback(() => {
    setCode(STARTER_CODE[language] ?? "");
    setOutput(null);
    setRunError(null);
    setAiFeedback(null);
  }, [language]);

  const handleRunCode = useCallback(async () => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    setOutput(null);
    setRunError(null);

    try {
      const res = await api("/api/run-code", {
        method: "POST",
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json() as { output?: string; error?: string | null };
      setOutput(data.output ?? null);
      setRunError(data.error ?? null);
    } catch {
      setRunError("Failed to reach the execution server. Please try again.");
    } finally {
      setIsRunning(false);
    }
  }, [code, language, isRunning]);

  const handleSubmitCode = useCallback(async () => {
    if (!code.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setAiFeedback(null);

    const prompt = `Please review the following ${language} code and give beginner-friendly feedback. Point out what works well, any bugs or issues, and suggestions for improvement. Be concise and encouraging.\n\n\`\`\`${language}\n${code}\n\`\`\``;

    try {
      const res = await api("/api/ai", {
        method: "POST",
        body: JSON.stringify({
          message: prompt,
          temporary: true,
          priorMessages: [],
        }),
      });
      const data = await res.json() as { reply?: string; error?: string };
      setAiFeedback(data.reply ?? data.error ?? "No feedback returned.");
    } catch {
      setAiFeedback("Failed to get AI feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [code, language, isSubmitting]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Top toolbar ── */}
      <div className="px-4 py-2.5 border-b border-border/40 flex items-center gap-3 shrink-0 bg-background">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">Coding IDE</h1>
            <p className="text-[10px] text-muted-foreground">Write, run, and get AI feedback on your code</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="relative ml-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/30 text-xs font-medium cursor-default select-none">
            {LANGUAGE_OPTIONS.find(l => l.id === language)?.icon}
            {LANGUAGE_OPTIONS.find(l => l.id === language)?.label}
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8"
            onClick={handleReset}
            title="Reset to starter code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            onClick={handleRunCode}
            disabled={isRunning || !code.trim()}
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {isRunning ? "Running…" : "Run Code"}
          </Button>

          <Button
            size="sm"
            className="gap-1.5 text-xs h-8"
            onClick={handleSubmitCode}
            disabled={isSubmitting || !code.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {isSubmitting ? "Reviewing…" : "Submit for AI Review"}
          </Button>
        </div>
      </div>

      {/* ── Split body ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* LEFT — Editor */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border/40">
          <div className="px-3 py-1.5 bg-muted/20 border-b border-border/30 flex items-center gap-2 shrink-0">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
            </div>
            <span className="text-[10px] text-muted-foreground font-mono ml-1">main.js</span>
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={language}
              value={code}
              theme={monacoTheme}
              onChange={(val) => setCode(val ?? "")}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "line",
                tabSize: 2,
                wordWrap: "on",
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                smoothScrolling: true,
                cursorSmoothCaretAnimation: "on",
                bracketPairColorization: { enabled: true },
                suggest: { showKeywords: true },
                quickSuggestions: true,
              }}
            />
          </div>
        </div>

        {/* RIGHT — Output + AI Feedback */}
        <div className="w-[42%] min-w-[280px] max-w-[600px] flex flex-col min-h-0 bg-background">
          {/* Output console takes up first 50% of right panel */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-border/40">
            <OutputConsole
              output={output}
              error={runError}
              isRunning={isRunning}
            />
          </div>

          {/* AI Feedback scrollable section */}
          <div className="flex-1 overflow-auto min-h-0">
            <AiFeedback
              feedback={aiFeedback}
              isLoading={isSubmitting}
            />
            {!isSubmitting && !aiFeedback && (
              <div className="p-4 text-center">
                <div className="inline-flex flex-col items-center gap-2 text-muted-foreground/50">
                  <Sparkles className="w-6 h-6" />
                  <p className="text-xs">Click <span className="text-primary font-medium">Submit for AI Review</span> to get feedback on your code</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
