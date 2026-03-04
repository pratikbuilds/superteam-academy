"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const t = useTranslations("theme");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label={t("label")}
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "cursor-pointer",
        )}
      >
        <SunIcon className="size-4" size={16} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("label")}
      className={cn(
        buttonVariants({ variant: "outline", size: "icon" }),
        "cursor-pointer",
      )}
    >
      {isDark ? (
        <SunIcon className="size-4" size={16} />
      ) : (
        <MoonIcon className="size-4" size={16} />
      )}
    </button>
  );
}
