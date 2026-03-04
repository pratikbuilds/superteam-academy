import { Hono } from "hono";
import {
  readConfig,
  readCourse,
  readCourses,
  readEnrollment,
  readXpBalance,
} from "../read";
import { learnerQuerySchema } from "../schemas/requests";

export const readRoutes = new Hono();

readRoutes.get("/config", async (c) => {
  try {
    const data = await readConfig();
    return c.json(data);
  } catch (error) {
    if (error instanceof Error && error.message === "CONFIG_NOT_INITIALIZED") {
      return c.json({ error: "CONFIG_NOT_INITIALIZED" }, 404);
    }
    return c.json({ error: "CONFIG_FETCH_FAILED" }, 500);
  }
});

readRoutes.get("/courses", async (c) => {
  try {
    const activeOnly = c.req.query("active") !== "false";
    const courses = await readCourses(activeOnly);
    return c.json(courses);
  } catch (error) {
    console.error("Courses fetch error", error);
    return c.json({ error: "COURSES_FETCH_FAILED" }, 500);
  }
});

readRoutes.get("/courses/:courseId", async (c) => {
  const courseId = c.req.param("courseId");
  try {
    const course = await readCourse(courseId);
    if (!course) {
      return c.json({ error: "COURSE_NOT_FOUND" }, 404);
    }
    return c.json(course);
  } catch (error) {
    console.error("Course fetch error", error);
    return c.json({ error: "COURSE_FETCH_FAILED" }, 500);
  }
});

readRoutes.get("/courses/:courseId/enrollment", async (c) => {
  const courseId = c.req.param("courseId");
  const parsed = learnerQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json(
      { error: "MALFORMED_REQUEST", details: "learner required" },
      400,
    );
  }
  try {
    const enrollment = await readEnrollment(courseId, parsed.data.learner);
    if (!enrollment) {
      return c.json({ error: "ENROLLMENT_NOT_FOUND" }, 404);
    }
    return c.json(enrollment);
  } catch (error) {
    console.error("Enrollment fetch error", error);
    return c.json({ error: "ENROLLMENT_FETCH_FAILED" }, 500);
  }
});

readRoutes.get("/xp-balance", async (c) => {
  const parsed = learnerQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json(
      { error: "MALFORMED_REQUEST", details: "learner required" },
      400,
    );
  }
  try {
    const data = await readXpBalance(parsed.data.learner);
    return c.json(data);
  } catch (error) {
    if (error instanceof Error && error.message === "CONFIG_NOT_INITIALIZED") {
      return c.json({ error: "CONFIG_NOT_INITIALIZED" }, 404);
    }
    console.error("XP balance fetch error", error);
    return c.json({ error: "XP_BALANCE_FETCH_FAILED" }, 500);
  }
});
