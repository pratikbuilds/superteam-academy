"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type HeaderNavProps = {
  href: string;
  label: string;
};

export function HeaderNav({ href, label }: HeaderNavProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-lg px-4 py-2.5 text-sm tracking-wide transition-all duration-200",
        "font-heading",
        "after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[3px] after:transition-colors after:duration-200",
        isActive
          ? "font-semibold text-foreground bg-primary/10 after:bg-primary"
          : "font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 after:bg-transparent hover:after:bg-primary/50"
      )}
    >
      {label}
    </Link>
  );
}
