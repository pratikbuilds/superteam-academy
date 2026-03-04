import Image from "next/image";
import { Link } from "@/i18n/navigation";

const footerColumns = [
  {
    title: "Academy",
    links: [
      { label: "Courses", href: "/courses" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "Verification flow", href: "/#verification-flow" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Build track", href: "/courses" },
      { label: "Top builders", href: "/leaderboard" },
      { label: "Wallet credentials", href: "/#verification-flow" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Superteam Brasil", href: "https://x.com/superteambr" },
      { label: "Solana", href: "https://solana.com" },
    ],
  },
] as const;

export function SuperteamFooter() {
  return (
    <footer className="relative mt-auto border-t border-border/70 bg-muted/35 text-foreground dark:bg-[#121d16] dark:text-[#f7eacb]">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_12%_20%,color-mix(in_srgb,var(--primary)_18%,transparent)_0%,transparent_46%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-22 [background-image:linear-gradient(to_right,color-mix(in_srgb,var(--border)_72%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--border)_72%,transparent)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-9 lg:grid-cols-[1.45fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex"
              aria-label="Superteam Brasil"
            >
              <Image
                src="/logo-green.svg"
                alt="Superteam Brasil"
                width={204}
                height={36}
                className="h-8 w-auto dark:hidden"
              />
              <Image
                src="/logo-white.svg"
                alt="Superteam Brasil"
                width={204}
                height={36}
                className="hidden h-8 w-auto dark:block"
              />
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground dark:text-[#f7eacb]/72">
              Serious Solana learning with on-chain proof, challenge-driven
              curriculum, and wallet-native outcomes.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase dark:text-[#f7eacb]/64">
                {column.title}
              </p>
              <ul className="mt-3 space-y-2.5">
                {column.links.map((item) => {
                  const isExternal = item.href.startsWith("http");

                  if (isExternal) {
                    return (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-foreground/84 transition-colors hover:text-primary dark:text-[#f7eacb]/82 dark:hover:text-[#fbd800]"
                        >
                          {item.label}
                        </a>
                      </li>
                    );
                  }

                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-foreground/84 transition-colors hover:text-primary dark:text-[#f7eacb]/82 dark:hover:text-[#fbd800]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-border/70 pt-4 text-xs text-muted-foreground dark:text-[#f7eacb]/62">
          © {new Date().getFullYear()} Superteam Brasil Academy
        </div>
      </div>

      {/* SVG footer pattern intentionally disabled per latest design feedback. */}
    </footer>
  );
}
