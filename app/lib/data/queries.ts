import { cache } from "react";
import { tracks } from "./tracks";
import {
  fetchCoursesFromSanity,
  fetchCourseBySlugFromSanity,
} from "./sanity-queries";
import type { Course, FilterParams, Lesson, Module, Track } from "./types";

export type LessonWithContext = {
  lesson: Lesson;
  lessonIndex: number;
  lessonIndexInModule: number;
  moduleIndex: number;
  module: Module;
  prevLesson: { id: string; title: string; type: Lesson["type"] } | null;
  nextLesson: { id: string; title: string; type: Lesson["type"] } | null;
};

function getLessonAtFlatIndex(
  course: Course,
  index: number
): { id: string; title: string; type: Lesson["type"] } | null {
  let flatIndex = 0;
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (flatIndex === index) {
        return { id: lesson.id, title: lesson.title, type: lesson.type };
      }
      flatIndex++;
    }
  }
  return null;
}

export function getLessonBySlugFromCourse(
  course: Course,
  lessonSlug: string
): LessonWithContext | null {
  let flatIndex = 0;
  for (let mi = 0; mi < course.modules.length; mi++) {
    const mod = course.modules[mi];
    for (let li = 0; li < mod.lessons.length; li++) {
      if (mod.lessons[li].id === lessonSlug) {
        const prev =
          flatIndex > 0 ? getLessonAtFlatIndex(course, flatIndex - 1) : null;
        const next = getLessonAtFlatIndex(course, flatIndex + 1);
        return {
          lesson: mod.lessons[li],
          lessonIndex: flatIndex,
          lessonIndexInModule: li + 1,
          moduleIndex: mi,
          module: mod,
          prevLesson: prev,
          nextLesson: next,
        };
      }
      flatIndex++;
    }
  }
  return null;
}

async function getCoursesSource(): Promise<Course[]> {
  return fetchCoursesFromSanity();
}

export async function getAllCourses(): Promise<Course[]> {
  return getCoursesSource();
}

export async function getActiveCourses(): Promise<Course[]> {
  return (await getCoursesSource()).filter((c) => c.isActive);
}

export const getCourseBySlug = cache(async function getCourseBySlug(
  slug: string
): Promise<Course | undefined> {
  const course = await fetchCourseBySlugFromSanity(slug);
  return course ?? undefined;
});

export async function getCoursesByTrack(trackId: string): Promise<Course[]> {
  return (await getActiveCourses()).filter((c) => c.trackId === trackId);
}

export const getLessonBySlug = cache(async function getLessonBySlug(
  courseSlug: string,
  lessonSlug: string,
  courseOverride?: Course
): Promise<LessonWithContext | null> {
  const course = courseOverride ?? (await getCourseBySlug(courseSlug));
  if (!course) return null;
  return getLessonBySlugFromCourse(course, lessonSlug);
});

export async function filterCourses(params: FilterParams): Promise<Course[]> {
  const active = await getActiveCourses();
  const track = params.track;
  const difficulty = params.difficulty;
  const q = params.q?.toLowerCase();
  const filtered = active.filter((c) => {
    if (track && c.trackId !== track) return false;
    if (difficulty !== undefined && c.difficulty !== difficulty) return false;
    if (q) {
      const matches =
        c.title.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q) ||
        c.tags.some((tag) => tag.includes(q));
      if (!matches) return false;
    }
    return true;
  });

  switch (params.sort) {
    case "xp-high":
      filtered.sort((a, b) => b.xpReward - a.xpReward);
      break;
    case "xp-low":
      filtered.sort((a, b) => a.xpReward - b.xpReward);
      break;
    case "newest":
      filtered.reverse();
      break;
    case "popular":
    default:
      filtered.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
      break;
  }

  return filtered;
}

export function getAllTracks(): Track[] {
  return tracks;
}

export function getTrackById(id: string): Track | undefined {
  return tracks.find((t) => t.id === id);
}
