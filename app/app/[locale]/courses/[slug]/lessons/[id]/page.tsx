import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourseBySlug, getLessonBySlug, getTrackById } from "@/lib/data/queries";
import { LessonView } from "@/components/lessons/lesson-view";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, id } = await params;
  const ctx = getLessonBySlug(slug, id);
  if (!ctx) return {};
  const course = getCourseBySlug(slug);
  if (!course) return {};
  return {
    title: `${ctx.lesson.title} | ${course.title} | Superteam Academy`,
    description: ctx.lesson.title,
  };
}

export default async function LessonPage({ params }: Props) {
  const { slug, id } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const ctx = getLessonBySlug(slug, id);
  if (!ctx) notFound();

  const track = getTrackById(course.trackId);

  return (
    <main className="mx-auto flex h-[calc(100vh-64px)] w-full max-w-full flex-col overflow-hidden px-4 pt-10 pb-4 sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 shrink-0 text-sm text-muted-foreground"
      >
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link href="/" className="hover:text-foreground hover:underline">
              Catalog
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href={`/courses?track=${course.trackId}`}
              className="hover:text-foreground hover:underline"
            >
              {track?.name ?? "Track"}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href={`/courses/${slug}`}
              className="hover:text-foreground hover:underline"
            >
              {course.title}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">{ctx.lesson.title}</li>
        </ol>
      </nav>

      <div className="min-h-0 flex-1 overflow-hidden">
        <LessonView course={course} lessonContext={ctx} />
      </div>
    </main>
  );
}
