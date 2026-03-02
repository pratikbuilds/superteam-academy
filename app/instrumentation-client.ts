import posthog from "posthog-js";
import { env } from "@/lib/env";

const key = env.NEXT_PUBLIC_POSTHOG_KEY;
if (key) {
  const host = env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  const isEu = host.includes("eu.i.posthog.com");
  posthog.init(key, {
    api_host: "/ph",
    ui_host: isEu ? "https://eu.posthog.com" : "https://us.posthog.com",
    capture_pageview: false,
    defaults: "2026-01-30",
  });
}
