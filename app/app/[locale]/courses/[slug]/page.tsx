import { notFound } from "next/navigation";
import Link from "next/link";
import { CourseDetailHeader } from "@/components/courses/course-detail-header";
import { CourseDetailContent } from "@/components/courses/course-detail-content";
import { getCourseBySlug, getTrackById } from "@/lib/data/queries";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return {
    title: `${course.title} | Superteam Academy`,
    description: course.shortDescription,
    openGraph: {
      title: course.title,
      description: course.shortDescription,
      images: course.thumbnail ? [{ url: course.thumbnail }] : undefined,
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) notFound();

  const track = getTrackById(course.trackId);
  const prerequisiteTitle = course.prerequisiteSlug
    ? (await getCourseBySlug(course.prerequisiteSlug))?.title
    : null;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 text-sm text-muted-foreground"
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
          <li className="text-foreground">{course.title}</li>
        </ol>
      </nav>

      <CourseDetailContent
        course={course}
        prerequisiteTitle={prerequisiteTitle}
      />
    </main>
  );
}
