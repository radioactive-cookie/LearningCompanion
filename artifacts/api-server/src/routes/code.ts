import { Router, type Request, type Response } from "express";
import vm from "node:vm";

const router = Router();

const MAX_CODE_LENGTH = 10_000;
const TIMEOUT_MS = 2_000;

const BLOCKED_PATTERNS = [
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

function checkBlocked(code: string): string | null {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      return `Blocked: "${pattern.source}" is not allowed in the sandbox.`;
    }
  }
  return null;
}

function runJavaScript(code: string): { output: string; error: string | null } {
  if (code.length > MAX_CODE_LENGTH) {
    return { output: "", error: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters.` };
  }

  const blocked = checkBlocked(code);
  if (blocked) return { output: "", error: blocked };

  const logs: string[] = [];

  const fmt = (...args: unknown[]) =>
    args.map((a) => (a === null ? "null" : a === undefined ? "undefined" : typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ");

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
    vm.runInContext(code, sandbox, {
      timeout: TIMEOUT_MS,
      breakOnSigint: true,
    });

    return {
      output: logs.length > 0 ? logs.join("\n") : "(no output)",
      error: null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = msg.includes("timed out") || msg.includes("Script execution timed out");
    return {
      output: logs.length > 0 ? logs.join("\n") : "",
      error: isTimeout ? "Execution timed out (2 second limit). Check for infinite loops." : msg,
    };
  }
}

router.post("/run-code", (req: Request, res: Response) => {
  const { code, language } = req.body as { code?: unknown; language?: unknown };

  if (typeof code !== "string" || !code.trim()) {
    res.status(400).json({ output: "", error: "No code provided." });
    return;
  }

  if (language !== "javascript") {
    res.status(400).json({ output: "", error: `Language "${language}" is not supported yet. Only JavaScript is available.` });
    return;
  }

  const result = runJavaScript(code);
  res.json(result);
});

export default router;
