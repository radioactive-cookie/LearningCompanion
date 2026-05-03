import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { authMiddleware } from "./middlewares/authMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

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

function buildAllowedOrigins(): string[] {
  if (process.env.FRONTEND_ORIGIN) {
    return process.env.FRONTEND_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean);
  }

  if (process.env.REPLIT_DOMAINS) {
    return process.env.REPLIT_DOMAINS.split(",")
      .map((d) => `https://${d.trim()}`)
      .filter(Boolean);
  }

  return ["http://localhost:3000", "http://localhost:5173"];
}

const allowedOrigins = buildAllowedOrigins();
logger.info({ allowedOrigins }, "CORS allowed origins");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      logger.warn({ origin }, "CORS rejected request from unlisted origin");
      callback(new Error(`Origin "${origin}" is not allowed by CORS policy`));
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);

export default app;
