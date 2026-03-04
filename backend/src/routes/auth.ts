import { Hono } from "hono";
import { createSiwsChallenge, verifyAndConsumeSiwsProof } from "../auth";
import { handleRouteError } from "../lib/errors";
import { parseJsonBody } from "../lib/parse";

export function createAuthRoutes(config: {
  authDomain: string;
  authUri: string;
  authChainId: string;
}): Hono {
  const auth = new Hono();

  auth.post("/auth/create-signin-data", async (c) => {
    try {
      const body = await parseJsonBody(c);
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
      return handleRouteError(c, error, "UNEXPECTED_AUTH_ERROR");
    }
  });

  auth.post("/auth/verify", async (c) => {
    try {
      const body = await parseJsonBody(c);
      const session = verifyAndConsumeSiwsProof({ request: body });
      return c.json({ ok: true, session });
    } catch (error) {
      return handleRouteError(c, error, "UNEXPECTED_AUTH_ERROR");
    }
  });

  return auth;
}
