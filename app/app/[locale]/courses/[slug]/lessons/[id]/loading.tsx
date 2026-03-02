import { Skeleton } from "@/components/ui/skeleton";

export default function LessonLoading() {
  return (
    <main className="mx-auto flex h-[calc(100vh-64px)] w-full max-w-full flex-col overflow-hidden px-4 pt-10 pb-4 sm:px-6">
      <nav aria-hidden className="mb-6 shrink-0">
        <Skeleton className="h-4 w-64" />
      </nav>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 space-y-1 pb-4">
          <Skeleton className="h-3.5 w-48" />
          <Skeleton className="h-8 w-3/4 sm:h-9" />
        </div>

        <div className="min-h-0 flex-1 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        <div className="mt-6 shrink-0 space-y-4 border-t border-border pt-6">
          <Skeleton className="h-10 w-full rounded-lg sm:w-32" />
          <div className="flex justify-between gap-3">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>
      </div>
    </main>
  );
}
