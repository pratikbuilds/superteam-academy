import "dotenv/config";
import { serve } from "@hono/node-server";
import { env } from "./env.js";
import { createApp } from "./app.js";

const app = createApp({
  corsOrigin: env.CORS_ORIGIN,
  authDomain: env.AUTH_DOMAIN,
  authUri: env.AUTH_URI,
  authChainId: env.AUTH_CHAIN_ID,
});
const corsOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(
      `Academy backend listening on http://localhost:${
        info.port
      } (CORS: ${corsOrigins.join(", ")})`
    );
  }
);
