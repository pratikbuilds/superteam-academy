import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { DifficultyBadge } from "./difficulty-badge";
import {
  Clock,
  BookOpen,
  Lightning,
  Users,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import type { Course } from "@/lib/data/types";

const trackAccent: Record<string, string> = {
  "solana-fundamentals": "bg-emerald-500",
  "anchor-development": "bg-blue-500",
  "defi-on-solana": "bg-amber-500",
};

const trackLabel: Record<string, string> = {
  "solana-fundamentals": "Solana Fundamentals",
  "anchor-development": "Anchor Development",
  "defi-on-solana": "DeFi on Solana",
};

export function CourseCard({ course }: { course: Course }) {
  const accent = trackAccent[course.trackId] ?? "bg-emerald-500";
  const label = trackLabel[course.trackId] ?? "Track";

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative block self-start cursor-pointer focus-visible:outline-none"
    >
      <article className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="relative h-32 overflow-hidden border-b border-border/60 sm:h-36">
          <Image
            src={course.thumbnail}
            alt={`${course.title} thumbnail`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span
            className={`absolute bottom-3 left-3 h-2 w-10 rounded-full ${accent}`}
          />
        </div>

        <div className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
            <div className="space-y-1">
              <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
              <h3 className="font-heading text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
                {course.title}
              </h3>
            </div>
            <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground/45 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>

          <div className="flex items-start justify-between gap-3">
            <p className="line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
              {course.shortDescription}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={course.difficulty} />
            <span className="text-[12px] text-muted-foreground">
              {course.creator.name}
            </span>
          </div>

          <div className="border-t border-border/70 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="size-3.5" weight="duotone" />
                  {course.totalLessons}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" weight="duotone" />
                  {Math.round(course.totalDuration / 60)}h
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" weight="duotone" />
                  {course.enrollmentCount.toLocaleString()}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-secondary">
                <Lightning className="size-3.5" weight="fill" />
                {course.xpReward.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
