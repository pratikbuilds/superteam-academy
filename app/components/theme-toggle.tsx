"use client";

import { useTranslations } from "next-intl";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const t = useTranslations("theme");

  return (
    <AnimatedThemeToggler
      aria-label={t("label")}
      className={cn(buttonVariants({ variant: "outline", size: "icon" }), "cursor-pointer")}
    />
  );
}
