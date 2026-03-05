import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ConnectButton } from "@/components/connect-wallet";
import { HeaderNav } from "@/components/header-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "@/i18n/navigation";

export async function Header() {
  const tHeader = await getTranslations("header");
  const tMeta = await getTranslations("metadata");

  return (
    <header className="border-b border-border px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-6 sm:gap-8">
          <Link href="/" aria-label={tHeader("goHome")} className="shrink-0">
            <Image
              src="/logo-green.svg"
              alt={tMeta("title")}
              width={176}
              height={30}
              className="h-7 w-auto dark:hidden sm:h-8"
              priority
            />
            <Image
              src="/logo-white.svg"
              alt={tMeta("title")}
              width={176}
              height={30}
              className="hidden h-7 w-auto dark:block sm:h-8"
              priority
            />
          </Link>
          <nav
            className="hidden items-center gap-1 sm:flex"
            aria-label={tHeader("navigation")}
          >
            <HeaderNav href="/courses" label={tHeader("courses")} />
            <HeaderNav href="/dashboard" label={tHeader("dashboard")} />
            <HeaderNav href="/leaderboard" label={tHeader("leaderboard")} />
            <HeaderNav href="/profile" label={tHeader("profile")} />
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <MobileNav />
          <LanguageSwitcher />
          <ThemeToggle />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
