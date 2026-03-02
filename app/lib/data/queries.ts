import { courses } from "./courses";
import { tracks } from "./tracks";
import type { Course, FilterParams, Lesson, Module, Track } from "./types";

export type LessonWithContext = {
  lesson: Lesson;
  lessonIndex: number;
  lessonIndexInModule: number;
  moduleIndex: number;
  module: Module;
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
};

export function getLessonBySlug(
  courseSlug: string,
  lessonSlug: string
): LessonWithContext | null {
  const course = getCourseBySlug(courseSlug);
  if (!course) return null;

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

function getLessonAtFlatIndex(
  course: Course,
  index: number
): { id: string; title: string } | null {
  let flatIndex = 0;
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (flatIndex === index) return { id: lesson.id, title: lesson.title };
      flatIndex++;
    }
  }
  return null;
}

export function getAllCourses(): Course[] {
  return courses;
}

export function getActiveCourses(): Course[] {
  return courses.filter((c) => c.isActive);
}

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getCoursesByTrack(trackId: string): Course[] {
  return courses.filter((c) => c.trackId === trackId && c.isActive);
}

export function filterCourses(params: FilterParams): Course[] {
  let filtered = getActiveCourses();

  if (params.track) {
    filtered = filtered.filter((c) => c.trackId === params.track);
  }

  if (params.difficulty) {
    filtered = filtered.filter((c) => c.difficulty === params.difficulty);
  }

  if (params.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.shortDescription.toLowerCase().includes(query) ||
        c.tags.some((tag) => tag.includes(query)),
    );
  }

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
