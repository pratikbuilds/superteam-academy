"use client";

import { useMemo } from "react";

export type EnrollmentStatus = {
  enrolled: boolean;
  completedLessons: number[];
  totalLessons: number;
};

/**
 * Mock enrollment status for MVP. Returns fake enrolled state for demo.
 * Replace with on-chain enrollment PDA fetch when backend is wired.
 */
export function useEnrollmentStatus(courseId: string): EnrollmentStatus {
  return useMemo(() => ({
    enrolled: true,
    completedLessons: [0, 1, 2],
    totalLessons: 15,
  }), [courseId]);
}
