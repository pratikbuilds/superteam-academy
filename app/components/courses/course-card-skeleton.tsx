import { Skeleton } from "@/components/ui/skeleton";

export function CourseCardSkeleton() {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-border/80 bg-card">
      <div className="relative h-32 overflow-hidden border-b border-border/60 sm:h-36">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-6 w-4/5 sm:h-7" />
          </div>
          <Skeleton className="mt-0.5 size-4 shrink-0" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3.5 w-20" />
        </div>

        <div className="flex items-center justify-between border-t border-border/70 pt-3">
          <div className="flex gap-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-14" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </article>
  );
}
