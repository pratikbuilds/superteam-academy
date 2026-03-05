"use client";

import { useTranslations } from "next-intl";
import { List } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/courses", key: "courses" },
  { href: "/dashboard", key: "dashboard" },
  { href: "/leaderboard", key: "leaderboard" },
  { href: "/profile", key: "profile" },
] as const;

export function MobileNav() {
  const t = useTranslations("header");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden focus-visible:ring-1 focus-visible:ring-border focus-visible:ring-offset-0"
          aria-label={t("openMenu")}
        >
          <List className="size-5" weight="bold" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[min(20rem,85vw)] flex-col gap-6 px-0 pt-14"
      >
        <SheetHeader className="px-4">
          <SheetTitle className="sr-only">{t("navigation")}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2" aria-label={t("navigation")}>
          {navItems.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-4 py-3 text-base font-medium transition-colors",
                "text-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {t(key)}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
