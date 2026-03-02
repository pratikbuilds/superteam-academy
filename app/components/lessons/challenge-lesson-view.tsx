"use client";

import { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { useLessonCompletion } from "@/lib/hooks/use-lesson-completion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { LessonMarkdown } from "./lesson-markdown";
import { ChallengeEditorPanel } from "./challenge-editor-panel";
import type { ChallengeLesson } from "@/lib/data/types";
import type { LessonWithContext } from "@/lib/data/queries";
import type { Course } from "@/lib/data/types";

type Props = {
  course: Course;
  lesson: ChallengeLesson;
  lessonContext: LessonWithContext;
};

export function ChallengeLessonView({
  course,
  lesson,
  lessonContext,
}: Props) {
  const t = useTranslations("lessonView");
  const { isComplete, markComplete } = useLessonCompletion(course.id);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const completed = isComplete(lessonContext.lessonIndex);
  const canMarkComplete = allTestsPassed && !completed;
  const { prevLesson, nextLesson, moduleIndex, lessonIndexInModule } = lessonContext;

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full min-h-[400px]"
    >
      {/* Left: Lesson content */}
      <ResizablePanel defaultSize={42} minSize={30}>
        <div className="flex h-full flex-col overflow-hidden bg-background">
          {/* Lesson header */}
          <div className="shrink-0 space-y-1 border-b border-border px-6 py-5">
            <p className="font-mono text-xs text-muted-foreground">
              {course.title} / Lesson {moduleIndex + 1}.{lessonIndexInModule}
            </p>
            <h1 className="font-heading text-2xl font-bold">{lesson.title}</h1>
          </div>

          {/* Scrollable content */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <LessonMarkdown content={lesson.prompt} />

              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                <h3 className="mb-2 flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                  Your Mission
                </h3>
                <p className="text-sm text-muted-foreground">
                  Complete the challenge in the editor and run tests to verify your solution.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom: Mark Complete + Prev/Next */}
          <div className="shrink-0 space-y-4 border-t border-border px-6 py-4">
            <Button
              onClick={() => markComplete(lessonContext.lessonIndex)}
              disabled={!canMarkComplete}
              className="w-full bg-emerald-600 hover:bg-emerald-500"
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
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right: Code editor + terminal */}
      <ResizablePanel defaultSize={58} minSize={40}>
        <ChallengeEditorPanel
          lesson={lesson}
          onAllTestsPass={() => setAllTestsPassed(true)}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
