import { useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme-provider";
import {
  Play, Send, RotateCcw, Terminal, Sparkles,
  Loader2, Copy, Check, Code2, Eye,
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

// ---------------------------------------------------------------------------
// Language config
// ---------------------------------------------------------------------------

type LangType = "vm" | "piston" | "preview";

interface LangConfig {
  icon: string;
  label: string;
  monacoLang: string;
  filename: string;
  type: LangType;
  starterCode: string;
}

const LANG_CONFIG: Record<string, LangConfig> = {
  javascript: {
    icon: "⚡", label: "JavaScript", monacoLang: "javascript",
    filename: "main.js", type: "vm",
    starterCode: `// JavaScript — runs in a secure local sandbox
function greet(name) {
  return \`Hello, \${name}! 🎉\`;
}
console.log(greet("World"));

const nums = [1, 2, 3, 4, 5];
const sum = nums.reduce((a, b) => a + b, 0);
console.log("Sum:", sum, "| Average:", sum / nums.length);

// Arrow functions & array methods
const squares = nums.map(n => n ** 2);
console.log("Squares:", squares);
`,
  },
  python: {
    icon: "🐍", label: "Python", monacoLang: "python",
    filename: "main.py", type: "piston",
    starterCode: `# Python — powered by remote sandbox
print("Hello, Python! 🐍")

nums = [1, 2, 3, 4, 5]
total = sum(nums)
print(f"Sum: {total}, Average: {total / len(nums)}")

# List comprehensions
squares = [n ** 2 for n in nums]
print("Squares:", squares)

# Functions
def is_even(n):
    return n % 2 == 0

evens = list(filter(is_even, nums))
print("Even numbers:", evens)
`,
  },
  typescript: {
    icon: "💙", label: "TypeScript", monacoLang: "typescript",
    filename: "main.ts", type: "piston",
    starterCode: `// TypeScript — powered by remote sandbox
interface Person {
  name: string;
  age: number;
}

function greet(person: Person): string {
  return \`Hello, \${person.name}! You are \${person.age} years old.\`;
}

const alice: Person = { name: "Alice", age: 30 };
console.log(greet(alice));

const nums: number[] = [1, 2, 3, 4, 5];
const sum: number = nums.reduce((a, b) => a + b, 0);
console.log(\`Sum: \${sum}, Average: \${sum / nums.length}\`);

const doubled = nums.map((n): number => n * 2);
console.log("Doubled:", doubled);
`,
  },
  java: {
    icon: "☕", label: "Java", monacoLang: "java",
    filename: "Main.java", type: "piston",
    starterCode: `// Java — powered by remote sandbox
import java.util.Arrays;

public class Main {
    static int sum(int[] arr) {
        int total = 0;
        for (int n : arr) total += n;
        return total;
    }

    public static void main(String[] args) {
        System.out.println("Hello, Java! ☕");

        int[] nums = {1, 2, 3, 4, 5};
        int total = sum(nums);
        System.out.printf("Sum: %d, Average: %.1f%n", total, (double) total / nums.length);

        int[] squares = Arrays.stream(nums).map(n -> n * n).toArray();
        System.out.println("Squares: " + Arrays.toString(squares));
    }
}
`,
  },
  "c++": {
    icon: "⚙️", label: "C++", monacoLang: "cpp",
    filename: "main.cpp", type: "piston",
    starterCode: `// C++ — powered by remote sandbox
#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

int main() {
    std::cout << "Hello, C++! ⚙️" << std::endl;

    std::vector<int> nums = {1, 2, 3, 4, 5};
    int total = std::accumulate(nums.begin(), nums.end(), 0);
    std::cout << "Sum: " << total << std::endl;
    std::cout << "Average: " << (double)total / nums.size() << std::endl;

    std::vector<int> squares;
    std::transform(nums.begin(), nums.end(), std::back_inserter(squares),
                   [](int n) { return n * n; });
    std::cout << "Squares: ";
    for (int s : squares) std::cout << s << " ";
    std::cout << std::endl;

    return 0;
}
`,
  },
  go: {
    icon: "🔵", label: "Go", monacoLang: "go",
    filename: "main.go", type: "piston",
    starterCode: `// Go — powered by remote sandbox
package main

import "fmt"

func sum(nums []int) int {
        total := 0
        for _, n := range nums {
                total += n
        }
        return total
}

func main() {
        fmt.Println("Hello, Go! 🔵")

        nums := []int{1, 2, 3, 4, 5}
        total := sum(nums)
        fmt.Printf("Sum: %d, Average: %.1f\\n", total, float64(total)/float64(len(nums)))

        squares := make([]int, len(nums))
        for i, n := range nums {
                squares[i] = n * n
        }
        fmt.Println("Squares:", squares)
}
`,
  },
  ruby: {
    icon: "💎", label: "Ruby", monacoLang: "ruby",
    filename: "main.rb", type: "piston",
    starterCode: `# Ruby — powered by remote sandbox
puts "Hello, Ruby! 💎"

nums = [1, 2, 3, 4, 5]
total = nums.sum
puts "Sum: #{total}, Average: #{total.to_f / nums.length}"

squares = nums.map { |n| n ** 2 }
puts "Squares: #{squares}"

evens = nums.select(&:even?)
puts "Evens: #{evens}"
`,
  },
  php: {
    icon: "🐘", label: "PHP", monacoLang: "php",
    filename: "main.php", type: "piston",
    starterCode: `<?php
// PHP — powered by remote sandbox
echo "Hello, PHP! 🐘\\n";

$nums = [1, 2, 3, 4, 5];
$total = array_sum($nums);
echo "Sum: $total, Average: " . ($total / count($nums)) . "\\n";

$squares = array_map(fn($n) => $n ** 2, $nums);
echo "Squares: " . implode(", ", $squares) . "\\n";

$evens = array_filter($nums, fn($n) => $n % 2 === 0);
echo "Evens: " . implode(", ", $evens) . "\\n";
`,
  },
  sql: {
    icon: "🗄️", label: "SQL", monacoLang: "sql",
    filename: "main.sql", type: "piston",
    starterCode: `.headers on
.mode column

-- Create table
CREATE TABLE products (
  id      INTEGER PRIMARY KEY,
  name    TEXT    NOT NULL,
  price   REAL,
  category TEXT
);

-- Insert data
INSERT INTO products VALUES (1, 'Laptop',     999.99, 'Electronics');
INSERT INTO products VALUES (2, 'Book',         19.99, 'Education');
INSERT INTO products VALUES (3, 'Headphones',   79.99, 'Electronics');
INSERT INTO products VALUES (4, 'Notebook',      4.99, 'Education');
INSERT INTO products VALUES (5, 'Phone',        599.99, 'Electronics');

-- Query: all electronics ordered by price
SELECT name, price, category
FROM   products
WHERE  category = 'Electronics'
ORDER  BY price DESC;
`,
  },
  html: {
    icon: "🌐", label: "HTML", monacoLang: "html",
    filename: "index.html", type: "preview",
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Page</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; }
    h1   { color: #2563eb; }
    .card { background: #eff6ff; padding: 20px; border-radius: 12px; margin: 16px 0; border: 1px solid #bfdbfe; }
    button { background: #2563eb; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; font-size: 14px; }
    button:hover { background: #1d4ed8; }
    ul { line-height: 2; }
  </style>
</head>
<body>
  <h1>Hello, HTML! 🌐</h1>
  <div class="card">
    <p>Edit this code and click <strong>Preview</strong> to see the result.</p>
    <button onclick="alert('You clicked me! 🎉')">Click me</button>
  </div>
  <ul>
    <li>HTML — structure</li>
    <li>CSS — styling</li>
    <li>JavaScript — interactivity</li>
  </ul>
</body>
</html>
`,
  },
  css: {
    icon: "🎨", label: "CSS", monacoLang: "css",
    filename: "style.css", type: "preview",
    starterCode: `/* CSS 🎨 — click Preview to see your styles */
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  font-family: 'Segoe UI', sans-serif;
}

.card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  text-align: center;
  max-width: 380px;
  width: 90%;
}

h1 { color: #667eea; margin: 0 0 8px; }
p  { color: #64748b; margin: 0 0 20px; }

button {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 28px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: transform 0.1s, background 0.2s;
}
button:hover { background: #5a67d8; transform: translateY(-1px); }
`,
  },
  react: {
    icon: "⚛️", label: "React", monacoLang: "javascript",
    filename: "App.jsx", type: "preview",
    starterCode: `// React ⚛️ — click Preview to render your component

function Counter() {
  const [count, setCount] = React.useState(0);
  const btn = (bg, label, fn) => (
    <button onClick={fn} style={{
      padding: '8px 22px', background: bg, color: 'white',
      border: 'none', borderRadius: '8px', cursor: 'pointer',
      fontSize: '18px', fontWeight: 600,
    }}>{label}</button>
  );
  return (
    <div style={{ textAlign: 'center', marginTop: 8 }}>
      <div style={{ fontSize: 64, fontWeight: 700, color: '#6366f1', lineHeight: 1.1 }}>{count}</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
        {btn('#ef4444', '−', () => setCount(c => c - 1))}
        {btn('#94a3b8', '↺', () => setCount(0))}
        {btn('#22c55e', '+', () => setCount(c => c + 1))}
      </div>
    </div>
  );
}

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 28, maxWidth: 360, margin: '0 auto' }}>
      <h2 style={{ color: '#6366f1', margin: '0 0 4px' }}>⚛️ React Counter</h2>
      <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: 14 }}>A stateful component demo</p>
      <Counter />
    </div>
  );
}
`,
  },
};

const LANGUAGE_ORDER = [
  "javascript", "python", "typescript", "java", "c++",
  "go", "ruby", "php", "sql", "html", "css", "react",
];

// ---------------------------------------------------------------------------
// Preview helpers
// ---------------------------------------------------------------------------

function buildPreviewHtml(language: string, code: string): string {
  if (language === "html") return code;

  if (language === "css") {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>${code}</style></head>
<body>
<div class="card">
  <h1>CSS Preview 🎨</h1>
  <p>Your styles are applied to this page.</p>
  <button>A Button</button>
</div>
</body></html>`;
  }

  if (language === "react") {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{margin:0;font-family:sans-serif}</style>
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body><div id="root"></div>
<script type="text/babel">
${code}
if(typeof App!=='undefined'){
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
}
</script></body></html>`;
  }

  return "";
}

// ---------------------------------------------------------------------------
// Output console (terminal)
// ---------------------------------------------------------------------------
function OutputConsole({ output, error, isRunning }: {
  output: string | null; error: string | null; isRunning: boolean;
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
          {error && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Error</Badge>}
          {output && !error && <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-0">OK</Badge>}
        </div>
        {text && (
          <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto bg-[#0d1117] font-mono">
        {isRunning ? (
          <div className="flex items-center gap-2 p-4 text-emerald-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-xs">Running…</span>
          </div>
        ) : text ? (
          <pre className={`p-4 whitespace-pre-wrap leading-relaxed text-xs ${error ? "text-red-400" : "text-emerald-300"}`}>
            {error ? `✗ ${error}` : text}
          </pre>
        ) : (
          <div className="p-4 text-[#4d5566] text-xs">
            Click <span className="text-emerald-400 font-medium">Run Code</span> to see output here…
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview pane (HTML / CSS / React)
// ---------------------------------------------------------------------------
function PreviewPane({ html, isRunning }: { html: string | null; isRunning: boolean }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/30 shrink-0">
        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preview</span>
        {isRunning && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground ml-1" />}
      </div>
      <div className="flex-1 bg-white min-h-0">
        {html ? (
          <iframe
            srcDoc={html}
            sandbox="allow-scripts allow-modals allow-same-origin"
            className="w-full h-full border-0"
            title="Live Preview"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/40 bg-[#fafafa]">
            <Eye className="w-8 h-8" />
            <p className="text-xs">Click <span className="font-medium">Preview</span> to render your code</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Feedback
// ---------------------------------------------------------------------------
function AiFeedback({ feedback, isLoading }: { feedback: string | null; isLoading: boolean }) {
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
            prose-strong:text-foreground">
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
  const [code, setCode] = useState(LANG_CONFIG["javascript"].starterCode);

  const [output, setOutput] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editorRef = useRef<unknown>(null);
  const cfg = LANG_CONFIG[language];
  const isPreview = cfg.type === "preview";
  const monacoTheme = theme === "dark" ? "vs-dark" : "light";

  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang);
    setCode(LANG_CONFIG[lang].starterCode);
    setOutput(null);
    setRunError(null);
    setPreviewHtml(null);
    setAiFeedback(null);
  }, []);

  const handleReset = useCallback(() => {
    setCode(cfg.starterCode);
    setOutput(null);
    setRunError(null);
    setPreviewHtml(null);
    setAiFeedback(null);
  }, [cfg]);

  const handleRun = useCallback(async () => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    setOutput(null);
    setRunError(null);

    if (isPreview) {
      // Render locally — no server call needed
      setPreviewHtml(buildPreviewHtml(language, code));
      setIsRunning(false);
      return;
    }

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
  }, [code, language, isRunning, isPreview]);

  const handleSubmit = useCallback(async () => {
    if (!code.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setAiFeedback(null);

    const prompt = `Please review the following ${cfg.label} code and give beginner-friendly feedback. Point out what works well, any bugs or issues, and suggestions for improvement. Be concise and encouraging.\n\n\`\`\`${language}\n${code}\n\`\`\``;

    try {
      const res = await api("/api/ai", {
        method: "POST",
        body: JSON.stringify({ message: prompt, temporary: true, priorMessages: [] }),
      });
      const data = await res.json() as { reply?: string; error?: string };
      setAiFeedback(data.reply ?? data.error ?? "No feedback returned.");
    } catch {
      setAiFeedback("Failed to get AI feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [code, language, cfg.label, isSubmitting]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Toolbar ── */}
      <div className="px-4 py-2.5 border-b border-border/40 flex items-center gap-2 shrink-0 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Code2 className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-foreground leading-tight">Coding IDE</p>
            <p className="text-[10px] text-muted-foreground">Write, run, and get AI feedback</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="relative ml-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="h-8 pl-2 pr-7 rounded-md border border-input bg-background text-xs font-medium text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {LANGUAGE_ORDER.map((id) => {
              const l = LANG_CONFIG[id];
              return (
                <option key={id} value={id}>
                  {l.icon} {l.label}{l.type === "preview" ? " (preview)" : ""}
                </option>
              );
            })}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">▾</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleReset} title="Reset to starter code">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          </motion.div>

          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
            <Button
              variant="outline" size="sm"
              className={`gap-1.5 text-xs h-8 ${isPreview
                ? "border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              }`}
              onClick={handleRun}
              disabled={isRunning || !code.trim()}
            >
              {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isPreview ? <Eye className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? "Running…" : isPreview ? "Preview" : "Run Code"}
            </Button>
          </motion.div>

          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
            <Button size="sm" className="gap-1.5 text-xs h-8" onClick={handleSubmit} disabled={isSubmitting || !code.trim()}>
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {isSubmitting ? "Reviewing…" : "AI Review"}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* LEFT — Editor */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border/40">
          <div className="px-3 py-1.5 bg-muted/20 border-b border-border/30 flex items-center gap-2 shrink-0">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
            </div>
            <span className="text-[10px] text-muted-foreground font-mono ml-1">{cfg.filename}</span>
            {cfg.type === "piston" && (
              <span className="ml-auto text-[9px] text-muted-foreground/50 font-mono">remote sandbox</span>
            )}
            {cfg.type === "vm" && (
              <span className="ml-auto text-[9px] text-muted-foreground/50 font-mono">local sandbox</span>
            )}
            {cfg.type === "preview" && (
              <span className="ml-auto text-[9px] text-muted-foreground/50 font-mono">browser preview</span>
            )}
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={cfg.monacoLang}
              value={code}
              theme={monacoTheme}
              onChange={(val) => setCode(val ?? "")}
              onMount={(editor) => { editorRef.current = editor; }}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "line",
                tabSize: language === "go" ? 4 : 2,
                wordWrap: "on",
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                smoothScrolling: true,
                cursorSmoothCaretAnimation: "on",
                bracketPairColorization: { enabled: true },
                quickSuggestions: true,
              }}
            />
          </div>
        </div>

        {/* RIGHT — Output / Preview + AI Feedback */}
        <div className="w-[42%] min-w-[260px] max-w-[580px] flex flex-col min-h-0 bg-background">
          <div className="flex-1 flex flex-col min-h-0 border-b border-border/40">
            {isPreview ? (
              <PreviewPane html={previewHtml} isRunning={isRunning} />
            ) : (
              <OutputConsole output={output} error={runError} isRunning={isRunning} />
            )}
          </div>

          <div className="flex-1 overflow-auto min-h-0">
            <AiFeedback feedback={aiFeedback} isLoading={isSubmitting} />
            {!isSubmitting && !aiFeedback && (
              <div className="p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground/40 h-full min-h-[120px]">
                <Sparkles className="w-6 h-6" />
                <p className="text-xs text-center">Click <span className="text-primary font-medium">AI Review</span> for feedback on your code</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
