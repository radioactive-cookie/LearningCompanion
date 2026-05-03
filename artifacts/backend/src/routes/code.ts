import { Router, type Request, type Response } from "express";
import vm from "node:vm";

const router = Router();

const MAX_CODE_LENGTH = 10_000;
const TIMEOUT_MS = 2_000;

// ---------------------------------------------------------------------------
// JavaScript — Node.js VM sandbox (fast, local, no external dep)
// ---------------------------------------------------------------------------

const JS_BLOCKED_PATTERNS = [
  /require\s*\(/,
  /import\s*\(/,
  /process\s*\./,
  /global\s*\./,
  /globalThis\s*\./,
  /__dirname/,
  /__filename/,
  /Buffer\s*\./,
  /Deno\s*\./,
  /fetch\s*\(/,
  /XMLHttpRequest/,
  /WebSocket/,
  /eval\s*\(/,
  /Function\s*\(/,
  /new\s+Function/,
];

function runJavaScript(code: string): { output: string; error: string | null } {
  for (const pattern of JS_BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      return { output: "", error: `Blocked: "${pattern.source}" is not allowed in the sandbox.` };
    }
  }

  const logs: string[] = [];
  const fmt = (...args: unknown[]) =>
    args.map((a) =>
      a === null ? "null"
      : a === undefined ? "undefined"
      : typeof a === "object" ? JSON.stringify(a, null, 2)
      : String(a)
    ).join(" ");

  const sandbox = Object.create(null) as Record<string, unknown>;
  sandbox.console = {
    log: (...args: unknown[]) => logs.push(fmt(...args)),
    error: (...args: unknown[]) => logs.push("[error] " + fmt(...args)),
    warn: (...args: unknown[]) => logs.push("[warn] " + fmt(...args)),
    info: (...args: unknown[]) => logs.push("[info] " + fmt(...args)),
  };
  sandbox.Math = Math;
  sandbox.JSON = JSON;
  sandbox.parseInt = parseInt;
  sandbox.parseFloat = parseFloat;
  sandbox.isNaN = isNaN;
  sandbox.isFinite = isFinite;
  sandbox.String = String;
  sandbox.Number = Number;
  sandbox.Boolean = Boolean;
  sandbox.Array = Array;
  sandbox.Object = Object;
  sandbox.Date = Date;
  sandbox.RegExp = RegExp;
  sandbox.Error = Error;
  sandbox.TypeError = TypeError;
  sandbox.RangeError = RangeError;
  sandbox.SyntaxError = SyntaxError;
  sandbox.Map = Map;
  sandbox.Set = Set;
  sandbox.Symbol = Symbol;
  sandbox.Promise = Promise;
  sandbox.undefined = undefined;

  try {
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { timeout: TIMEOUT_MS, breakOnSigint: true });
    return { output: logs.length > 0 ? logs.join("\n") : "(no output)", error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = msg.includes("timed out") || msg.includes("Script execution timed out");
    return {
      output: logs.length > 0 ? logs.join("\n") : "",
      error: isTimeout ? "Execution timed out (2 second limit). Check for infinite loops." : msg,
    };
  }
}

// ---------------------------------------------------------------------------
// Judge0 — remote sandboxed execution for compiled/interpreted languages
// https://ce.judge0.com  (free, no auth required)
// ---------------------------------------------------------------------------

const JUDGE0_URL = "https://ce.judge0.com";

// Judge0 language IDs — https://ce.judge0.com/languages
const JUDGE0_CONFIG: Record<string, number> = {
  python:     92,   // Python 3.11.2
  typescript: 74,   // TypeScript 3.7.4
  java:       91,   // Java (OpenJDK 17.0.6)
  "c++":      54,   // C++ (GCC 9.2.0)
  go:         60,   // Go 1.13.5
  php:        68,   // PHP 7.4.1
  ruby:       72,   // Ruby 2.7.0
  sql:        82,   // SQLite 3.27.2
};

interface Judge0Response {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: { id: number; description: string };
}

async function runWithJudge0(language: string, code: string): Promise<{ output: string; error: string | null }> {
  const languageId = JUDGE0_CONFIG[language];
  if (!languageId) {
    return { output: "", error: `Language "${language}" is not supported for execution.` };
  }

  try {
    const resp = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        cpu_time_limit: 5,
        memory_limit: 262144,
        wall_time_limit: 12,
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!resp.ok) {
      return { output: "", error: `Code execution service returned HTTP ${resp.status}. Try again shortly.` };
    }

    const data = (await resp.json()) as Judge0Response;
    const statusId = data.status?.id ?? 3;

    // Compilation error
    const compileOut = (data.compile_output ?? "").trim();
    if (statusId === 6) {
      return { output: "", error: compileOut || "Compilation failed." };
    }

    // Time limit
    if (statusId === 5) {
      return { output: data.stdout ?? "", error: "Time limit exceeded. Check for infinite loops." };
    }

    // Runtime errors (7–12)
    const stderr = (data.stderr ?? "").trim();
    if (statusId >= 7 && statusId <= 12) {
      return { output: data.stdout ?? "", error: stderr || `Runtime error (${data.status?.description ?? "unknown"})` };
    }

    // Internal error
    if (statusId === 13 || statusId === 14) {
      return { output: "", error: "Execution service internal error. Please try again." };
    }

    const stdout = data.stdout ?? "";
    return {
      output: stdout || "(no output)",
      error: stderr || null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort") || msg.includes("timed out")) {
      return { output: "", error: "Request timed out. The execution service may be slow — try again." };
    }
    return { output: "", error: `Execution error: ${msg}` };
  }
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

router.post("/run-code", async (req: Request, res: Response) => {
  const { code, language } = req.body as { code?: unknown; language?: unknown };

  if (typeof code !== "string" || !code.trim()) {
    res.status(400).json({ output: "", error: "No code provided." });
    return;
  }
  if (typeof language !== "string") {
    res.status(400).json({ output: "", error: "Language is required." });
    return;
  }
  if (code.length > MAX_CODE_LENGTH) {
    res.status(400).json({ output: "", error: `Code too long (max ${MAX_CODE_LENGTH} chars).` });
    return;
  }

  // JavaScript runs in a local VM — fast and no external dep
  if (language === "javascript") {
    res.json(runJavaScript(code));
    return;
  }

  // HTML, CSS, React are rendered in the browser — no server involvement
  if (["html", "css", "react"].includes(language)) {
    res.status(400).json({ output: "", error: "Preview languages are rendered in the browser." });
    return;
  }

  // All other languages go through Judge0
  const result = await runWithJudge0(language, code);
  res.json(result);
});

export default router;
