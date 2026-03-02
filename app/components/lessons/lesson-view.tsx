"use client";

import { ContentLessonView } from "./content-lesson-view";
import { ChallengeLessonView } from "./challenge-lesson-view";
import type { Course } from "@/lib/data/types";
import type { LessonWithContext } from "@/lib/data/queries";

type Props = {
  course: Course;
  lessonContext: LessonWithContext;
};

export function LessonView({ course, lessonContext }: Props) {
  const { lesson } = lessonContext;

  return (
    <>
      {lesson.type === "content" ? (
        <div className="flex h-full min-h-0 flex-col">
          <ContentLessonView
            course={course}
            lesson={lesson}
            lessonContext={lessonContext}
          />
        </div>
      ) : (
        <ChallengeLessonView
          course={course}
          lesson={lesson}
          lessonContext={lessonContext}
        />
      )}
    </>
  );
}
