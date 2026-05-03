import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Trust the first proxy hop (Replit's reverse proxy) so express-rate-limit
// reads the real client IP from X-Forwarded-For instead of the proxy IP.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(helmet());

/**
 * Allowed origins for CORS.
 *
 * Priority order:
 *   1. FRONTEND_ORIGIN env var  — explicit override (comma-separated list).
 *   2. REPLIT_DOMAINS env var   — Replit injects the live domain(s) automatically.
 *   3. Localhost fallback       — development only.
 *
 * Never uses a wildcard — every allowed origin must be explicitly listed.
 */
function buildAllowedOrigins(): string[] {
  if (process.env.FRONTEND_ORIGIN) {
    return process.env.FRONTEND_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean);
  }

  if (process.env.REPLIT_DOMAINS) {
    return process.env.REPLIT_DOMAINS.split(",")
      .map((d) => `https://${d.trim()}`)
      .filter(Boolean);
  }

  // Local development fallback — never reached in production.
  return ["http://localhost:3000", "http://localhost:5173"];
}

const allowedOrigins = buildAllowedOrigins();
logger.info({ allowedOrigins }, "CORS allowed origins");

app.use(
  cors({
    origin: (origin, callback) => {
      // Same-origin requests (server-to-server, curl) have no Origin header — allow them.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn({ origin }, "CORS rejected request from unlisted origin");
      callback(new Error(`Origin "${origin}" is not allowed by CORS policy`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
