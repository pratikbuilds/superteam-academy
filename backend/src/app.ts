import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  AuthError,
  createSiwsChallenge,
  verifyAndConsumeSiwsProof,
} from "./auth.ts";

export function createApp(config: {
  corsOrigin: string;
  authDomain: string;
  authUri: string;
  authChainId: string;
}): Hono {
  const app = new Hono();

  const corsOrigins = config.corsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    "/*",
    cors({
      origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    }),
  );

  app.get("/health", (c) => {
    return c.json({ ok: true });
  });

  app.post("/auth/create-signin-data", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }

    try {
      const challenge = createSiwsChallenge({
        request: body,
        authDomain: config.authDomain,
        authUri: config.authUri,
        authChainId: config.authChainId,
      });
      return c.json({
        ok: true,
        nonce: challenge.nonce,
        input: challenge.input,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return c.json({ ok: false, error: error.code }, error.status);
      }
      return c.json({ ok: false, error: "UNEXPECTED_AUTH_ERROR" }, 500);
    }
  });

  app.post("/auth/verify", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }

    try {
      const session = verifyAndConsumeSiwsProof({ request: body });
      return c.json({ ok: true, session });
    } catch (error) {
      if (error instanceof AuthError) {
        return c.json({ ok: false, error: error.code }, error.status);
      }
      return c.json({ ok: false, error: "UNEXPECTED_AUTH_ERROR" }, 500);
    }
  });

  return app;
}
