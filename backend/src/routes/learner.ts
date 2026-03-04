import { Hono } from "hono";
import { address } from "@solana/kit";
import {
  AuthError,
  assertSiwsIntentMatches,
  verifyAndConsumeSiwsProof,
} from "../auth";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { completedEnrollments } from "../db/schema";
import { handleRouteError } from "../lib/errors";
import { parseJsonBody } from "../lib/parse";
import { readCourse } from "../read";
import { parseU64OrThrow } from "../lib/parse-u64";
import {
  completeLessonOnChain,
  finalizeCourseOnChain,
  issueCredentialOnChain,
  ProgramError,
  type CompleteLessonOnChain as CompleteLessonOnChainFn,
  upgradeCredentialOnChain,
} from "../program";
import {
  completeLessonRequestSchema,
  finalizeCourseRequestSchema,
  issueCredentialRequestSchema,
  upgradeCredentialRequestSchema,
} from "../schemas/requests";

export function createLearnerRoutes(overrides?: {
  completeLessonOnChain?: CompleteLessonOnChainFn;
}): Hono {
  const learner = new Hono();
  const doCompleteLesson =
    overrides?.completeLessonOnChain ?? completeLessonOnChain;

  learner.post("/complete-lesson", async (c) => {
    const body = await parseJsonBody(c);
    const parsed = completeLessonRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ ok: false, error: "MALFORMED_REQUEST" }, 400);
    }
    try {
      const request = parsed.data;
      const session = verifyAndConsumeSiwsProof({
        request: { nonce: request.nonce, output: request.output },
      });
      assertSiwsIntentMatches(session, {
        action: "complete-lesson",
        courseId: request.courseId,
        lessonIndex: request.lessonIndex,
      });
      if (request.learner && request.learner !== session.wallet) {
        throw new AuthError("INVALID_WALLET_BINDING", 401);
      }
      const result = await doCompleteLesson({
        courseId: request.courseId,
        lessonIndex: request.lessonIndex,
        learner: address(session.wallet),
      });
      return c.json({
        ok: true,
        signature: result.signature,
        learner: session.wallet,
      });
    } catch (error) {
      return handleRouteError(
        c,
        error,
        "UNEXPECTED_COMPLETE_LESSON_ERROR",
        500,
      );
    }
  });

  learner.post("/finalize-course", async (c) => {
    const body = await parseJsonBody(c);
    const parsed = finalizeCourseRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ ok: false, error: "MALFORMED_REQUEST" }, 400);
    }
    try {
      const request = parsed.data;
      const session = verifyAndConsumeSiwsProof({
        request: { nonce: request.nonce, output: request.output },
      });
      assertSiwsIntentMatches(session, {
        action: "finalize-course",
        courseId: request.courseId,
        lessonIndex: null,
      });
      if (request.learner && request.learner !== session.wallet) {
        throw new AuthError("INVALID_WALLET_BINDING", 401);
      }
      const result = await finalizeCourseOnChain({
        courseId: request.courseId,
        learner: address(session.wallet),
      });

      const course = await readCourse(request.courseId);
      if (course && "trackId" in course && "trackLevel" in course) {
        const trackId = Number(course.trackId);
        const trackLevel = Number(course.trackLevel);
        if (!Number.isInteger(trackId) || !Number.isInteger(trackLevel))
          return handleRouteError(
            c,
            new Error("Invalid track"),
            "UNEXPECTED_FINALIZE_COURSE_ERROR",
            500,
          );
        await db.insert(completedEnrollments).values({
          wallet: session.wallet,
          courseId: request.courseId,
          completedAt: new Date(),
          credentialAsset: null,
          trackId,
          trackLevel,
        });
      }

      return c.json({
        ok: true,
        signature: result.signature,
        learner: session.wallet,
      });
    } catch (error) {
      return handleRouteError(
        c,
        error,
        "UNEXPECTED_FINALIZE_COURSE_ERROR",
        500,
      );
    }
  });

  learner.post("/issue-credential", async (c) => {
    const body = await parseJsonBody(c);
    const parsed = issueCredentialRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ ok: false, error: "MALFORMED_REQUEST" }, 400);
    }
    try {
      const request = parsed.data;
      const session = verifyAndConsumeSiwsProof({
        request: { nonce: request.nonce, output: request.output },
      });
      assertSiwsIntentMatches(session, {
        action: "issue-credential",
        courseId: request.courseId,
        lessonIndex: null,
      });
      if (request.learner && request.learner !== session.wallet) {
        throw new AuthError("INVALID_WALLET_BINDING", 401);
      }
      let trackCollectionAddress: ReturnType<typeof address>;
      try {
        trackCollectionAddress = address(request.trackCollection);
      } catch {
        throw new ProgramError("INVALID_TRACK_COLLECTION", 400);
      }
      const result = await issueCredentialOnChain({
        courseId: request.courseId,
        learner: address(session.wallet),
        trackCollection: trackCollectionAddress,
        credentialName: request.credentialName,
        metadataUri: request.metadataUri,
        coursesCompleted: request.coursesCompleted,
        totalXp: parseU64OrThrow(request.totalXp),
      });

      await db
        .update(completedEnrollments)
        .set({ credentialAsset: String(result.credentialAsset) })
        .where(
          and(
            eq(completedEnrollments.wallet, session.wallet),
            eq(completedEnrollments.courseId, request.courseId),
          ),
        );

      return c.json({
        ok: true,
        signature: result.signature,
        learner: session.wallet,
        credentialAsset: result.credentialAsset,
      });
    } catch (error) {
      return handleRouteError(
        c,
        error,
        "UNEXPECTED_ISSUE_CREDENTIAL_ERROR",
        500,
      );
    }
  });

  learner.post("/upgrade-credential", async (c) => {
    const body = await parseJsonBody(c);
    const parsed = upgradeCredentialRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ ok: false, error: "MALFORMED_REQUEST" }, 400);
    }
    try {
      const request = parsed.data;
      const session = verifyAndConsumeSiwsProof({
        request: { nonce: request.nonce, output: request.output },
      });
      assertSiwsIntentMatches(session, {
        action: "upgrade-credential",
        courseId: request.courseId,
        lessonIndex: null,
      });
      if (request.learner && request.learner !== session.wallet) {
        throw new AuthError("INVALID_WALLET_BINDING", 401);
      }
      let trackCollectionAddress: ReturnType<typeof address>;
      let credentialAssetAddress: ReturnType<typeof address>;
      try {
        trackCollectionAddress = address(request.trackCollection);
        credentialAssetAddress = address(request.credentialAsset);
      } catch {
        throw new ProgramError("INVALID_CREDENTIAL_ACCOUNTS", 400);
      }
      const result = await upgradeCredentialOnChain({
        courseId: request.courseId,
        learner: address(session.wallet),
        credentialAsset: credentialAssetAddress,
        trackCollection: trackCollectionAddress,
        credentialName: request.credentialName,
        metadataUri: request.metadataUri,
        coursesCompleted: request.coursesCompleted,
        totalXp: parseU64OrThrow(request.totalXp),
      });
      return c.json({
        ok: true,
        signature: result.signature,
        learner: session.wallet,
        credentialAsset: result.credentialAsset,
      });
    } catch (error) {
      return handleRouteError(
        c,
        error,
        "UNEXPECTED_UPGRADE_CREDENTIAL_ERROR",
        500,
      );
    }
  });

  return learner;
}
