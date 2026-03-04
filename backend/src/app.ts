import { Hono } from "hono";
import { cors } from "hono/cors";
import type { CompleteLessonOnChain } from "./program";
import { createAuthRoutes } from "./routes/auth";
import { executeCodeRoutes } from "./routes/execute-code";
import { healthRoutes } from "./routes/health";
import { createLearnerRoutes } from "./routes/learner";
import { leaderboardRoutes } from "./routes/leaderboard";
import { profileRoutes } from "./routes/profile";
import { readRoutes } from "./routes/read";

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
