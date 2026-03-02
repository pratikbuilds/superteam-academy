"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import posthog from "posthog-js";
import { env } from "@/lib/env";

export function PostHogPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!env.NEXT_PUBLIC_POSTHOG_KEY || !pathname) return;
    posthog.capture("$pageview", { $current_url: window.location.href });
  }, [pathname]);

  return null;
}
