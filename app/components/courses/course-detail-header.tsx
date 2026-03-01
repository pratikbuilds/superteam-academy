import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { DifficultyBadge } from "./difficulty-badge";
import { getTrackById, getCourseBySlug } from "@/lib/data/queries";
import type { Course } from "@/lib/data/types";

type Props = { course: Course };

export function CourseDetailHeader({ course }: Props) {
  const track = getTrackById(course.trackId);

  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <div className="relative size-40 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted sm:size-52">
        <Image
          src={course.thumbnail}
          alt={`${course.title} thumbnail`}
          fill
          sizes="208px"
          className="object-cover"
          priority
        />
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap gap-2">
          <DifficultyBadge difficulty={course.difficulty} />
          {course.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="font-heading text-2xl font-bold leading-tight tracking-tight text-pretty sm:text-3xl">
          {course.title}
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground text-pretty max-w-2xl">
          {course.description}
        </p>
        <p className="text-sm text-muted-foreground">
          {track?.name ?? "Track"}
        </p>
        {course.prerequisiteSlug && (
          <p className="text-sm text-muted-foreground">
            Prerequisite:{" "}
            <Link
              href={`/courses/${course.prerequisiteSlug}`}
              className="font-medium underline underline-offset-2 hover:text-foreground"
            >
              {getCourseBySlug(course.prerequisiteSlug)?.title ??
                course.prerequisiteSlug.replace(/-/g, " ")}
            </Link>
          </p>
        )}
      </div>
    </header>
  );
}
