/**
 * Groq AI helper — server-side only.
 *
 * Never import this module from the frontend.
 * API keys are read lazily so the module can be imported before env
 * validation runs. When the primary key hits a rate limit, the call
 * is automatically retried with the backup key (GROQ_API_KEY_BACKUP).
 *
 * Token usage is tracked in-memory and resets at midnight UTC.
 */
import Groq from "groq-sdk";
import { logger } from "./logger";

/** Primary model — high quality, used only for real chat conversations. 100k tokens/day free. */
const MODEL = "llama-3.3-70b-versatile";
/** Fast model — used for lightweight structured tasks (topics, lesson generation). 500k tokens/day free — separate quota. */
const MODEL_FAST = "llama-3.1-8b-instant";
const TIMEOUT_MS = 30_000;
const MAX_TOKENS = 1024;       // chat responses — reduced from 2048; saves ~50% tokens per turn
const MAX_TOKENS_FAST = 1024;  // structured JSON responses are compact; 1024 is plenty
const DAILY_LIMIT = 100_000;

/** Maximum number of prior turns (user + assistant pairs) to include for context. */
const MAX_HISTORY_TURNS = 8;

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type UsageStats = {
  primaryTokensUsed: number;
  backupTokensUsed: number;
  dailyLimit: number;
  activeKey: "primary" | "backup" | "none";
  primaryExhausted: boolean;
  backupExhausted: boolean;
  /** ISO timestamp when the primary key cooldown lifts (null if not blocked) */
  primaryRetryAfter: string | null;
  /** ISO timestamp when the backup key cooldown lifts (null if not blocked) */
  backupRetryAfter: string | null;
  hasBackupKey: boolean;
  resetAtUtc: string;
};

// ---------------------------------------------------------------------------
// In-memory usage tracker — resets at midnight UTC
// ---------------------------------------------------------------------------
type DailyUsage = {
  date: string; // "YYYY-MM-DD" UTC
  primaryTokens: number;
  backupTokens: number;
  activeKey: "primary" | "backup" | "none";
  /** Unix ms timestamp until which the primary key is blocked (0 = available) */
  primaryBlockedUntil: number;
  /** Unix ms timestamp until which the backup key is blocked (0 = available) */
  backupBlockedUntil: number;
};

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function midnightUtcMs(): number {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.getTime();
}

function freshDay(): DailyUsage {
  return {
    date: todayUtc(),
    primaryTokens: 0,
    backupTokens: 0,
    activeKey: "none",
    primaryBlockedUntil: 0,
    backupBlockedUntil: 0,
  };
}

let _usage: DailyUsage = freshDay();

function ensureFreshDay() {
  if (_usage.date !== todayUtc()) {
    _usage = freshDay();
  }
}

function isKeyBlocked(key: "primary" | "backup"): boolean {
  ensureFreshDay();
  const until = key === "primary" ? _usage.primaryBlockedUntil : _usage.backupBlockedUntil;
  return until > 0 && Date.now() < until;
}

function recordTokens(key: "primary" | "backup", tokens: number) {
  ensureFreshDay();
  if (key === "primary") {
    _usage.primaryTokens += tokens;
  } else {
    _usage.backupTokens += tokens;
  }
  _usage.activeKey = key;
}

/**
 * Parse Groq's "Please try again in Xm Y.Zs" retry hint into milliseconds.
 * Falls back to 5 minutes if unparseable.
 */
function parseRetryMs(errMessage: string): number {
  // e.g. "Please try again in 9m5.184s" or "Please try again in 4m2.784s"
  const minSec = errMessage.match(/try again in (\d+)m([\d.]+)s/);
  if (minSec) {
    return (parseInt(minSec[1], 10) * 60 + parseFloat(minSec[2])) * 1000;
  }
  // e.g. "Please try again in 30s"
  const secOnly = errMessage.match(/try again in ([\d.]+)s/);
  if (secOnly) return parseFloat(secOnly[1]) * 1000;
  return 5 * 60 * 1000; // 5 min fallback
}

/** Returns true when the Groq error is a daily (TPD) limit vs a per-minute (TPM) limit. */
function isDailyLimit(errMessage: string): boolean {
  return errMessage.includes("tokens per day") || errMessage.includes("(TPD)");
}

function blockKey(key: "primary" | "backup", err: unknown) {
  ensureFreshDay();
  const msg = err instanceof Error ? err.message : "";
  const blockedUntil = isDailyLimit(msg) ? midnightUtcMs() : Date.now() + parseRetryMs(msg);
  const kind = isDailyLimit(msg) ? "daily limit" : "temporary rate limit";
  const retryIn = Math.ceil((blockedUntil - Date.now()) / 60_000);

  if (key === "primary") {
    _usage.primaryBlockedUntil = blockedUntil;
  } else {
    _usage.backupBlockedUntil = blockedUntil;
  }
  logger.warn("Groq %s key hit %s — blocked for ~%dm.", key, kind, retryIn);
}

export function getUsageStats(): UsageStats {
  ensureFreshDay();
  const resetDate = new Date(_usage.date);
  resetDate.setUTCDate(resetDate.getUTCDate() + 1);
  const now = Date.now();

  const primaryBlocked = _usage.primaryBlockedUntil > 0 && now < _usage.primaryBlockedUntil;
  const backupBlocked  = _usage.backupBlockedUntil  > 0 && now < _usage.backupBlockedUntil;

  return {
    primaryTokensUsed: _usage.primaryTokens,
    backupTokensUsed: _usage.backupTokens,
    dailyLimit: DAILY_LIMIT,
    activeKey: _usage.activeKey,
    primaryExhausted: primaryBlocked,
    backupExhausted: backupBlocked,
    primaryRetryAfter: primaryBlocked ? new Date(_usage.primaryBlockedUntil).toISOString() : null,
    backupRetryAfter:  backupBlocked  ? new Date(_usage.backupBlockedUntil).toISOString()  : null,
    hasBackupKey: Boolean(process.env["GROQ_API_KEY_BACKUP"]),
    resetAtUtc: resetDate.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Groq clients — always read fresh from env so key rotations take effect
// ---------------------------------------------------------------------------
let _primaryKey: string | null = null;
let _primaryClient: Groq | null = null;
let _backupKey: string | null = null;
let _backupClient: Groq | null = null;

function getPrimaryClient(): Groq {
  const apiKey = process.env["GROQ_API_KEY"];
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set. Add it to your environment secrets.");
  }
  if (apiKey !== _primaryKey) {
    _primaryKey = apiKey;
    _primaryClient = new Groq({ apiKey });

  }
  return _primaryClient!;
}

function getBackupClient(): Groq | null {
  const apiKey = process.env["GROQ_API_KEY_BACKUP"];
  if (!apiKey) return null;
  if (apiKey !== _backupKey) {
    _backupKey = apiKey;
    _backupClient = new Groq({ apiKey });
  }
  return _backupClient;
}

function isRateLimitError(err: unknown): boolean {
  return (
    err != null &&
    typeof err === "object" &&
    "status" in err &&
    (err as { status: number }).status === 429
  );
}

async function callWithClient(
  client: Groq,
  keyLabel: "primary" | "backup",
  systemPrompt: string,
  trimmedHistory: ConversationMessage[],
  signal: AbortSignal,
  model: string = MODEL,
  maxTokens: number = MAX_TOKENS,
): Promise<string> {
  const completion = await client.chat.completions.create(
    {
      model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        ...trimmedHistory,
      ],
    },
    { signal },
  );

  // Record token usage from response (only primary model counts against daily chat quota)
  const tokens = completion.usage?.total_tokens ?? 0;
  if (tokens > 0 && model === MODEL) recordTokens(keyLabel, tokens);

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Groq returned an empty response.");
  }
  return sanitizeOutput(text);
}

/**
 * Lightweight AI call using llama-3.1-8b-instant.
 *
 * This model has its own separate free-tier quota (500k tokens/day) — completely
 * independent from the 70B model's 100k/day quota. Use this for any structured
 * JSON generation (topics, lesson content, suggestions) to preserve the main
 * quota for actual chat conversations.
 */
export async function callAIFast(
  systemPrompt: string,
  messages: ConversationMessage[],
  maxTokens: number = MAX_TOKENS_FAST,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const client = getPrimaryClient();
    return await callWithClient(
      client,
      "primary",
      systemPrompt,
      messages,
      controller.signal,
      MODEL_FAST,
      maxTokens,
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("AI request timed out. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Try a single key. On 429, records the block window and re-throws.
 */
async function tryKey(
  key: "primary" | "backup",
  client: Groq,
  systemPrompt: string,
  trimmedHistory: ConversationMessage[],
  signal: AbortSignal,
): Promise<string> {
  try {
    return await callWithClient(client, key, systemPrompt, trimmedHistory, signal);
  } catch (err: unknown) {
    if (isRateLimitError(err)) {
      blockKey(key, err);
    }
    throw err;
  }
}

/**
 * Call the Groq LLM with a system prompt and a full conversation history.
 *
 * Routing logic (evaluated fresh on every request):
 *  - If a key is currently in its cooldown window, skip it entirely.
 *  - Try primary first; on 429 record the cooldown and fall through to backup.
 *  - If both are in cooldown, surface a clear error with the soonest retry time.
 *
 * @param systemPrompt - Instruction context for the model (not user-controlled).
 * @param history      - Ordered list of prior messages, ending with the latest user message.
 */
export async function callAI(
  systemPrompt: string,
  history: ConversationMessage[],
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Cap history to avoid token bloat — keep the most recent turns
  const trimmedHistory = history.slice(-MAX_HISTORY_TURNS * 2);

  try {
    ensureFreshDay();

    const backup = getBackupClient();
    const primaryBlocked = isKeyBlocked("primary");
    const backupBlocked  = isKeyBlocked("backup");

    // Both keys in cooldown — fall back to the fast model (separate per-model quota)
    if (primaryBlocked && (backupBlocked || !backup)) {
      logger.info("70B model rate-limited — falling back to 8B model for this request.");
      return await callWithClient(
        getPrimaryClient(), "primary", systemPrompt, trimmedHistory, controller.signal,
        MODEL_FAST, MAX_TOKENS_FAST,
      );
    }

    // Primary blocked — go straight to backup
    if (primaryBlocked) {
      if (!backup) {
        logger.info("Primary 70B blocked, no backup — falling back to 8B model.");
        return await callWithClient(
          getPrimaryClient(), "primary", systemPrompt, trimmedHistory, controller.signal,
          MODEL_FAST, MAX_TOKENS_FAST,
        );
      }
      logger.info("Primary key blocked — using backup key directly.");
      return await tryKey("backup", backup, systemPrompt, trimmedHistory, controller.signal);
    }

    // Backup blocked or absent — go straight to primary, fall to 8B on rate limit
    if (backupBlocked || !backup) {
      try {
        return await tryKey("primary", getPrimaryClient(), systemPrompt, trimmedHistory, controller.signal);
      } catch (primaryErr: unknown) {
        if (!isRateLimitError(primaryErr)) throw primaryErr;
        logger.info("Primary 70B rate-limited, no backup — falling back to 8B model.");
        return await callWithClient(
          getPrimaryClient(), "primary", systemPrompt, trimmedHistory, controller.signal,
          MODEL_FAST, MAX_TOKENS_FAST,
        );
      }
    }

    // Neither blocked — try primary, fall through to backup on 429
    try {
      return await tryKey("primary", getPrimaryClient(), systemPrompt, trimmedHistory, controller.signal);
    } catch (primaryErr: unknown) {
      if (!isRateLimitError(primaryErr)) throw primaryErr;
      // Primary just got rate-limited — try backup key, then 8B as last resort
      if (!backup) {
        logger.info("Primary 70B rate-limited, no backup key — falling back to 8B model.");
        return await callWithClient(
          getPrimaryClient(), "primary", systemPrompt, trimmedHistory, controller.signal,
          MODEL_FAST, MAX_TOKENS_FAST,
        );
      }
      logger.info("Primary key rate-limited — switching to backup key.");
      try {
        return await tryKey("backup", backup, systemPrompt, trimmedHistory, controller.signal);
      } catch (backupErr: unknown) {
        if (!isRateLimitError(backupErr)) throw backupErr;
        logger.info("Both 70B keys rate-limited — falling back to 8B model.");
        return await callWithClient(
          getPrimaryClient(), "primary", systemPrompt, trimmedHistory, controller.signal,
          MODEL_FAST, MAX_TOKENS_FAST,
        );
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      logger.error("Groq request timed out after %dms", TIMEOUT_MS);
      throw new Error("AI request timed out. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Strip null bytes and control characters from the model output.
 * Returns only printable Unicode — safe to send straight to the client.
 */
function sanitizeOutput(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}
