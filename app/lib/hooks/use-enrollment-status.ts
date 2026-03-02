"use client";

import { useLessonCompletion } from "./use-lesson-completion";

export type EnrollmentStatus = {
  enrolled: boolean;
  completedLessons: number[];
  completedSet: Set<number>;
  totalLessons: number;
};

/**
 * Mock enrollment status for MVP. Returns fake enrolled state for demo.
 * completedLessons merges mock + localStorage via useLessonCompletion.
 * Replace with on-chain enrollment PDA fetch when backend is wired.
 */
export function useEnrollmentStatus(
  courseId: string,
  totalLessons?: number
): EnrollmentStatus {
  const { completedLessons, completedSet } = useLessonCompletion(courseId);
  return {
    enrolled: true,
    completedLessons,
    completedSet,
    totalLessons: totalLessons ?? 15,
  };
}
