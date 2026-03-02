"use client";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useLessonCompletion } from "@/lib/hooks/use-lesson-completion";
import { useTranslations } from "next-intl";
import { LessonMarkdown } from "./lesson-markdown";
import type { ContentLesson } from "@/lib/data/types";
import type { LessonWithContext } from "@/lib/data/queries";
import type { Course } from "@/lib/data/types";

type Props = {
  course: Course;
  lesson: ContentLesson;
  lessonContext: LessonWithContext;
};

export function ContentLessonView({
  course,
  lesson,
  lessonContext,
}: Props) {
  const t = useTranslations("lessonView");
  const { isComplete, markComplete } = useLessonCompletion(course.id);
  const completed = isComplete(lessonContext.lessonIndex);
  const { prevLesson, nextLesson, moduleIndex, lessonIndexInModule } = lessonContext;

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-3xl flex-col">
      {/* Lesson header - fixed */}
      <div className="shrink-0 space-y-1 pb-4">
        <p className="font-mono text-xs text-muted-foreground">
          {course.title} / Lesson {moduleIndex + 1}.{lessonIndexInModule}
        </p>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">{lesson.title}</h1>
      </div>

      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {lesson.videoUrl && (
          <div className="mb-6 aspect-video overflow-hidden rounded-lg border border-border bg-muted">
            <video
              src={lesson.videoUrl}
              controls
              className="h-full w-full"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <LessonMarkdown content={lesson.body} />
        </div>
      </div>

      {/* Mark Complete + Prev/Next - fixed */}
      <div className="mt-6 shrink-0 space-y-4 border-t border-border pt-6">
        <Button
          onClick={() => markComplete(lessonContext.lessonIndex)}
          disabled={completed}
          className="w-full bg-emerald-600 hover:bg-emerald-500 sm:w-auto"
        >
          {completed ? (
            <>
              <span className="mr-2">✓</span>
              Completed
            </>
          ) : (
            t("markComplete")
          )}
        </Button>

        <div className="flex flex-wrap justify-between gap-3">
          {prevLesson ? (
            <Button variant="outline" size="sm" asChild className="max-w-[50%]">
              <Link href={`/courses/${course.slug}/lessons/${prevLesson.id}`}>
                <CaretLeft className="mr-1 size-4 shrink-0" weight="bold" />
                <span className="truncate">Previous: {prevLesson.title}</span>
              </Link>
            </Button>
          ) : (
            <span />
          )}
          {nextLesson ? (
            <Button variant="outline" size="sm" asChild className="max-w-[50%]">
              <Link href={`/courses/${course.slug}/lessons/${nextLesson.id}`}>
                <span className="truncate">Next: {nextLesson.title}</span>
                <CaretRight className="ml-1 size-4 shrink-0" weight="bold" />
              </Link>
            </Button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
