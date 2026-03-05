/**
 * Load .env file in development only. Production (e.g. Railway) injects env vars.
 */
if (process.env.NODE_ENV !== "production") {
  await import("dotenv/config");
}
export {};
