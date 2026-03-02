"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, Lock, Play } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/data/types";
import type { EnrollmentStatus } from "@/lib/hooks/use-enrollment-status";

type Props = {
  course: Course;
  enrollment: EnrollmentStatus;
};

type ModuleStatus = "completed" | "in-progress" | "locked";

export function CourseCurriculum({ course, enrollment }: Props) {
  const t = useTranslations("courseDetail");
  let offset = 0;

  const modules = course.modules.map((mod, i) => {
    const start = offset;
    const total = mod.lessons.length;
    const done = mod.lessons.filter((_, j) =>
      enrollment.completedLessons.includes(start + j)
    ).length;

    let status: ModuleStatus = "locked";
    if (!enrollment.enrolled) {
      status = i === 0 ? "in-progress" : "locked";
    } else if (done === total) {
      status = "completed";
    } else if (
      i === 0 ||
      enrollment.completedLessons.filter((idx) => idx < start).length === start
    ) {
      status = "in-progress";
    }

    offset += total;
    return { mod, start, total, done, status };
  });

  const defaultOpen = modules
    .filter((m) => m.status === "in-progress")
    .map((m) => m.mod.id);

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-mono text-base font-bold sm:text-lg">
          {t("curriculum")}
        </h2>
        <span className="font-mono text-xs text-muted-foreground sm:text-sm">
          {course.modules.length} Modules &bull; {course.totalLessons} Lessons
        </span>
      </div>

      <Accordion
        type="multiple"
        defaultValue={defaultOpen}
        className="flex flex-col gap-3"
      >
        {modules.map(({ mod, start, total, done, status }, moduleIdx) => (
          <AccordionItem
            key={mod.id}
            value={mod.id}
            className={cn(
              "rounded-xl border",
              status === "in-progress" && "border-primary",
              status === "locked" && "border-border/60"
            )}
          >
            <AccordionTrigger className="gap-3 px-4 py-3.5 hover:no-underline sm:px-5 sm:py-4 data-[state=open]:pb-2">
              <div className="flex flex-1 items-center gap-3 text-left">
                {/* badge */}
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm sm:size-9",
                    status === "completed" && "bg-primary/15 text-primary",
                    status === "in-progress" &&
                      "border border-primary/40 font-mono font-bold text-primary",
                    status === "locked" && "bg-muted text-muted-foreground"
                  )}
                >
                  {status === "completed" ? (
                    <CheckCircle className="size-4 sm:size-5" weight="fill" />
                  ) : status === "locked" ? (
                    <Lock className="size-4" weight="bold" />
                  ) : (
                    String(moduleIdx + 1).padStart(2, "0")
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold sm:text-base">
                    Module {String(moduleIdx + 1).padStart(2, "0")}:{" "}
                    {mod.title}
                  </span>
                  <span
                    className={cn(
                      "block font-mono text-[10px] font-medium uppercase tracking-widest sm:text-[11px]",
                      status === "in-progress"
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {status === "completed" &&
                      `COMPLETED \u2022 ${done === total ? 100 : Math.round((done / total) * 100)}% YIELD`}
                    {status === "in-progress" &&
                      "IN PROGRESS \u2022 RESUME SEQUENCE"}
                    {status === "locked" &&
                      `LOCKED \u2022 REQUIRES MODULE ${String(moduleIdx).padStart(2, "0")}`}
                  </span>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pb-3 sm:px-5 sm:pb-4">
              <ul className="divide-y divide-border/60">
                {mod.lessons.map((lesson, i) => {
                  const idx = start + i;
                  const completed = enrollment.completedLessons.includes(idx);
                  const prevDone =
                    i === 0 ||
                    enrollment.completedLessons.includes(idx - 1);
                  const isNext = enrollment.enrolled && !completed && prevDone;
                  const locked = enrollment.enrolled && !completed && !prevDone;

                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/courses/${course.slug}/lessons/${lesson.id}`}
                        className={cn(
                          "flex items-center gap-3 py-2.5 sm:py-3 transition-colors hover:bg-muted/50 -mx-4 px-4 sm:-mx-5 sm:px-5 rounded-md",
                          locked && "opacity-40"
                        )}
                      >
                        {/* left icon */}
                        {completed ? (
                          <span className="size-4 shrink-0" />
                        ) : isNext ? (
                          <Play
                            className="size-4 shrink-0 text-primary"
                            weight="fill"
                          />
                        ) : (
                          <Lock
                            className="size-4 shrink-0 text-muted-foreground"
                            weight="bold"
                          />
                        )}

                        <span
                          className={cn(
                            "min-w-0 flex-1 text-sm",
                            completed &&
                              "text-muted-foreground line-through decoration-muted-foreground/40"
                          )}
                        >
                          {moduleIdx + 1}.{i + 1} {lesson.title}
                        </span>

                        {/* right side */}
                        {completed ? (
                          <CheckCircle
                            className="size-4 shrink-0 text-primary sm:size-5"
                            weight="fill"
                          />
                        ) : (
                          <span className="shrink-0 font-mono text-xs text-muted-foreground">
                            {lesson.duration} min
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
