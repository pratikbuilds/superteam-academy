import { z } from "zod";

const U32_MAX = 4_294_967_295;

export const totalXpSchema = z.union([
  z.number().int().min(0),
  z.string().regex(/^\d+$/),
]);

export const completeLessonRequestSchema = z.object({
  courseId: z.string().min(1),
  lessonIndex: z.number().int().min(0).max(255),
  nonce: z.string().min(8),
  output: z.unknown(),
  learner: z.string().min(32).optional(),
});

export const finalizeCourseRequestSchema = z.object({
  courseId: z.string().min(1),
  nonce: z.string().min(8),
  output: z.unknown(),
  learner: z.string().min(32).optional(),
});

export const issueCredentialRequestSchema = z.object({
  courseId: z.string().min(1),
  trackCollection: z.string().min(32),
  credentialName: z.string().min(1).max(128),
  metadataUri: z.string().url().max(512),
  coursesCompleted: z.number().int().min(0).max(U32_MAX),
  totalXp: totalXpSchema,
  nonce: z.string().min(8),
  output: z.unknown(),
  learner: z.string().min(32).optional(),
});

export const upgradeCredentialRequestSchema = z.object({
  courseId: z.string().min(1),
  trackCollection: z.string().min(32),
  credentialAsset: z.string().min(32),
  credentialName: z.string().min(1).max(128),
  metadataUri: z.string().url().max(512),
  coursesCompleted: z.number().int().min(0).max(U32_MAX),
  totalXp: totalXpSchema,
  nonce: z.string().min(8),
  output: z.unknown(),
  learner: z.string().min(32).optional(),
});

export const executeCodeRequestSchema = z.object({
  code: z.string().min(1).max(100_000),
  language: z.enum(["rust", "typescript"]),
  testCases: z
    .array(
      z.object({
        input: z.string().max(20_000),
        expectedOutput: z.string().max(20_000),
        label: z.string().min(1).max(200),
      }),
    )
    .min(1)
    .max(30),
});

export const learnerQuerySchema = z.object({
  learner: z.string().min(32),
});

const socialLinksSchema = z
  .object({
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    website: z.string().url().optional(),
  })
  .optional();

export const updateProfileRequestSchema = z.object({
  username: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  displayName: z.string().max(128).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().max(512).optional(),
  socialLinks: socialLinksSchema,
  visibility: z.enum(["public", "private"]).optional(),
  nonce: z.string().min(8),
  output: z.unknown(),
});
