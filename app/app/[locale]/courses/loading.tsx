import { Skeleton } from "@/components/ui/skeleton";
import { CourseCardSkeleton } from "@/components/courses/course-card-skeleton";

export default function CoursesLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
      <header className="space-y-1">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-5 w-80" />
      </header>

      <div className="mt-8">
        <Skeleton className="h-4 w-28" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] rounded-lg" />
          ))}
        </div>
      </div>

      <div className="mt-10">
        <Skeleton className="h-7 w-28" />
        <div className="mt-4">
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-md" />
          ))}
        </div>
        <div className="mt-5 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
