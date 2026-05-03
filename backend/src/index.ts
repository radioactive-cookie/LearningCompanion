/**
 * Server entry point.
 *
 * Validates all required environment variables before starting.
 * Secrets (API keys, DB credentials) live only here — never in the frontend.
 */
import "dotenv/config";
import { env } from "./lib/env";
import app from "./app";
import { logger } from "./lib/logger";

const port = Number(env.PORT);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${env.PORT}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port, nodeEnv: env.NODE_ENV }, "Server listening");
});
