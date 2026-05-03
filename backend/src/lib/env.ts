/**
 * Environment variable validation.
 *
 * Validates required env vars at startup and provides typed accessors.
 * Secrets stay server-side — never import this module from the frontend.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Check .env.example for setup instructions.`,
    );
  }
  return value;
}

function optionalEnv(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export const env = {
  /** TCP port the server listens on. */
  PORT: requireEnv("PORT"),

  /** PostgreSQL connection string — provisioned by Replit database. */
  DATABASE_URL: requireEnv("DATABASE_URL"),

  /**
   * Groq API key — used by the callAI helper.
   * Never log this value. Never send it to the frontend.
   */
  GROQ_API_KEY: requireEnv("GROQ_API_KEY"),

  /**
   * Comma-separated list of allowed frontend origins.
   * Falls back to REPLIT_DOMAINS in production, or localhost in dev.
   */
  FRONTEND_ORIGIN: optionalEnv("FRONTEND_ORIGIN"),

  /** Replit-injected public domain(s) — used as CORS fallback. */
  REPLIT_DOMAINS: optionalEnv("REPLIT_DOMAINS"),

  /** Supabase project URL used to validate JWTs. */
  SUPABASE_URL: requireEnv("SUPABASE_URL"),

  /** Supabase JWT audience. Defaults to "authenticated". */
  SUPABASE_JWT_AUD: optionalEnv("SUPABASE_JWT_AUD", "authenticated"),

  NODE_ENV: optionalEnv("NODE_ENV", "development"),
} as const;
