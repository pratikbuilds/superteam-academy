import { Hono } from "hono";
import { cors } from "hono/cors";
import type { CompleteLessonOnChain } from "./program.js";
import { createAuthRoutes } from "./routes/auth.js";
import { executeCodeRoutes } from "./routes/execute-code.js";
import { healthRoutes } from "./routes/health.js";
import { createLearnerRoutes } from "./routes/learner.js";
import { leaderboardRoutes } from "./routes/leaderboard.js";
import { profileRoutes } from "./routes/profile.js";
import { readRoutes } from "./routes/read.js";

export type CompleteLessonOnChainOverride = CompleteLessonOnChain;

export function createApp(
  config: {
    corsOrigin: string;
    authDomain: string;
    authUri: string;
    authChainId: string;
  },
  overrides?: { completeLessonOnChain?: CompleteLessonOnChainOverride }
): Hono {
  const app = new Hono();

  const corsOrigins = config.corsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    "/*",
    cors({
      origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    })
  );

  app.route("/", healthRoutes);
  app.route("/", leaderboardRoutes);
  app.route("/", profileRoutes);
  app.route("/", createAuthRoutes(config));
  app.route("/", createLearnerRoutes(overrides));
  app.route("/", readRoutes);
  app.route("/", executeCodeRoutes);

  return app;
}
