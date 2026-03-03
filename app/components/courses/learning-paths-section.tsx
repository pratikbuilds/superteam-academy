import { Link } from "@/i18n/navigation";
import { getAllTracks } from "@/lib/data/queries";
import {
  Cube,
  Anchor,
  CurrencyDollar,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";

const iconMap: Record<string, ComponentType<IconProps>> = {
  Cube,
  Anchor,
  CurrencyDollar,
};

export function LearningPathsSection({ title }: { title: string }) {
  const tracks = getAllTracks();

  return (
    <section>
      <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      <ul
        className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
      >
        {tracks.map((track) => {
          const Icon = iconMap[track.icon] ?? Cube;
          return (
            <li key={track.id}>
              <Link
                href={`/courses?track=${track.id}`}
                className={cn(
                  "group block rounded-lg border-2 border-border bg-card p-4 text-left transition-all duration-200",
                  "hover:border-primary hover:bg-primary/10 hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background",
                  "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"
                  aria-hidden
                >
                  <Icon className="size-5" weight="duotone" />
                </div>
                <p className="mt-3 font-heading text-sm font-semibold leading-tight text-foreground">
                  {track.name}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {track.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {track.courseCount} courses
                  </span>
                  <span className="inline-flex items-center gap-1 font-heading text-xs font-medium text-primary transition-all duration-200 group-hover:gap-2">
                    View path
                    <ArrowRight className="size-3.5" weight="bold" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
