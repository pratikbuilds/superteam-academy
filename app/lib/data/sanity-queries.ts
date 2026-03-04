import { sanityClient } from "@/lib/sanity/client";
import { coursesQuery, courseBySlugQuery } from "@/lib/sanity/queries";
import { mapSanityCourseToCourse } from "@/lib/sanity/mappers";
import type { Course } from "./types";

export async function fetchCoursesFromSanity(): Promise<Course[]> {
  const docs = await sanityClient.fetch<
    Parameters<typeof mapSanityCourseToCourse>[0][]
  >(coursesQuery);
  if (!Array.isArray(docs)) return [];
  return docs
    .map((d) => mapSanityCourseToCourse(d))
    .filter((c): c is Course => c !== null);
}

export async function fetchCourseBySlugFromSanity(
  slug: string
): Promise<Course | null> {
  const doc = await sanityClient.fetch(courseBySlugQuery, { slug });
  return mapSanityCourseToCourse(doc);
}
