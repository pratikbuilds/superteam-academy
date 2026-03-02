import { Skeleton } from "@/components/ui/skeleton";

export default function LessonLoading() {
  return (
    <main className="mx-auto flex h-[calc(100vh-64px)] w-full max-w-full flex-col overflow-hidden px-4 pt-10 pb-4 sm:px-6">
      <nav aria-hidden className="mb-6 shrink-0">
        <Skeleton className="h-4 w-64" />
      </nav>

      <div className="flex min-h-0 flex-1">
        <Skeleton className="min-h-0 flex-1" />
      </div>
    </main>
  );
}
