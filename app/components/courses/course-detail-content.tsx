"use client";

import { CourseDetailHeader } from "./course-detail-header";
import { CourseDetailSidebar } from "./course-detail-sidebar";
import { CourseCurriculum } from "./course-curriculum";
import { useEnrollmentStatus } from "@/lib/hooks/use-enrollment-status";
import type { Course } from "@/lib/data/types";

type Props = { course: Course };

export function CourseDetailContent({ course }: Props) {
  const enrollment = useEnrollmentStatus(course.id, course.totalLessons);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-10">
        <CourseDetailHeader course={course} />
        <section id="curriculum">
          <CourseCurriculum course={course} enrollment={enrollment} />
        </section>
      </div>
      <div>
        <div className=" lg:top-24">
          <CourseDetailSidebar course={course} enrollment={enrollment} />
        </div>
      </div>
    </div>
  );
}
