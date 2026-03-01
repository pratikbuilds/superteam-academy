import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
      <nav aria-hidden className="mb-6">
        <Skeleton className="h-4 w-48" />
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-10">
          {/* Header: thumbnail + content */}
          <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Skeleton className="size-40 shrink-0 rounded-xl sm:size-52" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-8 w-3/4 sm:h-9" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </header>

          {/* Curriculum */}
          <section className="space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div>
          <aside className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-1 h-8 w-24" />
                </div>
                <Skeleton className="size-10 shrink-0 rounded-full" />
              </div>
              <div className="mt-4 space-y-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
              <div className="mt-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
              <Skeleton className="mt-3 h-3 w-2/3" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-14" />
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="size-8 shrink-0 rounded-full" />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex gap-3">
                <Skeleton className="size-5 shrink-0" />
                <div className="min-w-0 space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
