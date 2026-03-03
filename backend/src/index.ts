import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./env.ts";

const app = new Hono();

const corsOrigins = env.CORS_ORIGIN.split(",")
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

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(
      `Academy backend listening on http://localhost:${info.port} (CORS: ${corsOrigins.join(", ")})`,
    );
  },
);
