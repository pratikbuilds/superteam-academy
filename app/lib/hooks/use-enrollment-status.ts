"use client";

import { useLessonCompletion } from "./use-lesson-completion";

export type EnrollmentStatus = {
  enrolled: boolean;
  completedLessons: number[];
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
  const { completedLessons } = useLessonCompletion(courseId);
  return {
    enrolled: true,
    completedLessons,
    totalLessons: totalLessons ?? 15,
  };
}
