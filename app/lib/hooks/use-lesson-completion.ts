"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_PREFIX = "academy-lesson-complete-";

function getStorageKey(courseId: string): string {
  return `${STORAGE_PREFIX}${courseId}`;
}

function getCompletedFromStorage(courseId: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(courseId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((n): n is number => typeof n === "number")
      : [];
  } catch {
    return [];
  }
}

export type LessonCompletionState = {
  completedLessons: number[];
  completedSet: Set<number>;
  markComplete: (lessonIndex: number) => void;
  isComplete: (lessonIndex: number) => boolean;
};

const MOCK_COMPLETED = [0, 1, 2];

export function useLessonCompletion(courseId: string): LessonCompletionState {
  const [stored, setStored] = useState<number[]>([]);

  useEffect(() => {
    setStored(getCompletedFromStorage(courseId));
  }, [courseId]);

  const completedLessons = [...new Set([...MOCK_COMPLETED, ...stored])].sort(
    (a, b) => a - b
  );
  const completedSet = useMemo(() => new Set(completedLessons), [completedLessons]);

  const markComplete = useCallback(
    (lessonIndex: number) => {
      const next = [...new Set([...stored, lessonIndex])].sort((a, b) => a - b);
      localStorage.setItem(getStorageKey(courseId), JSON.stringify(next));
      setStored(next);
    },
    [courseId, stored]
  );

  const isComplete = useCallback(
    (lessonIndex: number) => completedSet.has(lessonIndex),
    [completedSet]
  );

  return { completedLessons, completedSet, markComplete, isComplete };
}
