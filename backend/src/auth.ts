import { randomBytes } from "node:crypto";
import { verifySignIn } from "@solana/wallet-standard-util";
import type {
  SolanaSignInInput,
  SolanaSignInOutput,
} from "@solana/wallet-standard-features";
import { z } from "zod";

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 30 * 1000;

export type AuthAction =
  | "complete-lesson"
  | "finalize-course"
  | "issue-credential"
  | "upgrade-credential"
  | "profile";

type AuthErrorCode =
  | "MALFORMED_REQUEST"
  | "INVALID_NONCE"
  | "EXPIRED_MESSAGE"
  | "REPLAYED_NONCE"
  | "INVALID_SIGNATURE"
  | "INVALID_WALLET_BINDING"
  | "INTENT_MISMATCH";

type ChallengeRecord = {
  wallet: string;
  action: AuthAction | null;
  courseId: string | null;
  lessonIndex: number | null;
  input: SolanaSignInInput;
  issuedAtMs: number;
  expiresAtMs: number;
  consumed: boolean;
};

const challengeStore = new Map<string, ChallengeRecord>();

const serializedBytesSchema = z.union([
  z.string().min(1),
  z.array(z.number().int().min(0).max(255)),
]);

const challengeRequestSchema = z
  .object({
    wallet: z.string().min(32),
    action: z
      .enum([
        "complete-lesson",
        "finalize-course",
        "issue-credential",
        "upgrade-credential",
        "profile",
      ])
      .nullable()
      .optional(),
    courseId: z.string().min(1).nullable().optional(),
    lessonIndex: z.number().int().min(0).nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.action === "complete-lesson" && value.lessonIndex == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "lessonIndex required for complete-lesson",
      });
    }
    if (
      value.action != null &&
      value.action !== "profile" &&
      value.courseId == null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "courseId required when action is provided",
      });
    }
    if (value.action !== "complete-lesson" && value.lessonIndex != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "lessonIndex allowed only for complete-lesson",
      });
    }
  });

const verifyRequestSchema = z.object({
  nonce: z.string().min(8),
  output: z.object({
    account: z.object({
      address: z.string().min(32),
      publicKey: serializedBytesSchema,
      chains: z.array(z.string()).optional(),
      features: z.array(z.string()).optional(),
    }),
    signedMessage: serializedBytesSchema,
    signature: serializedBytesSchema,
    signatureType: z.literal("ed25519").optional(),
  }),
});

export class AuthError extends Error {
  code: AuthErrorCode;
  status: number;

  constructor(code: AuthErrorCode, status = 401) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

export type VerifiedSiwsSession = {
  wallet: string;
  action: AuthAction | null;
  courseId: string | null;
  lessonIndex: number | null;
  nonce: string;
  issuedAt: string | undefined;
  expirationTime: string | undefined;
};

function cleanupExpiredChallenges(nowMs: number): void {
  for (const [nonce, record] of challengeStore.entries()) {
    if (record.expiresAtMs + MAX_FUTURE_SKEW_MS <= nowMs) {
      challengeStore.delete(nonce);
    }
  }
}

function bytesFromSerialized(input: string | number[]): Uint8Array {
  if (Array.isArray(input)) {
    return Uint8Array.from(input);
  }
  return Uint8Array.from(Buffer.from(input, "base64"));
}

function encodeBase58(bytes: Uint8Array): string {
  let value = 0n;
  for (const byte of bytes) {
    value = (value << 8n) + BigInt(byte);
  }

  let out = "";
  while (value > 0n) {
    const mod = Number(value % 58n);
    out = BASE58_ALPHABET[mod] + out;
    value /= 58n;
  }

  for (let i = 0; i < bytes.length && bytes[i] === 0; i += 1) {
    out = `1${out}`;
  }

  return out || "1";
}

function buildRequestId(input: {
  action: AuthAction | null;
  courseId: string | null;
  lessonIndex: number | null;
}): string {
  return [
    "academy",
    input.action ?? "-",
    input.courseId ?? "-",
    input.lessonIndex ?? "-",
  ].join(":");
}

export function createSiwsChallenge(params: {
  request: unknown;
  authDomain: string;
  authUri: string;
  authChainId: string;
}): {
  nonce: string;
  input: SolanaSignInInput;
  action: AuthAction | null;
  courseId: string | null;
  lessonIndex: number | null;
} {
  const parsed = challengeRequestSchema.safeParse(params.request);
  if (!parsed.success) {
    throw new AuthError("MALFORMED_REQUEST", 400);
  }

  const request = parsed.data;
  const nonce = randomBytes(16).toString("hex");
  const nowMs = Date.now();
  cleanupExpiredChallenges(nowMs);
  const issuedAt = new Date(nowMs).toISOString();
  const expirationTime = new Date(nowMs + DEFAULT_TTL_MS).toISOString();
  const action = request.action ?? null;
  const courseId = request.courseId ?? null;
  const lessonIndex = request.lessonIndex ?? null;

  const input: SolanaSignInInput = {
    domain: params.authDomain,
    address: request.wallet,
    statement: "Sign in to Superteam Academy",
    uri: params.authUri,
    version: "1",
    chainId: params.authChainId,
    nonce,
    issuedAt,
    expirationTime,
    requestId: buildRequestId({ action, courseId, lessonIndex }),
  };

  challengeStore.set(nonce, {
    wallet: request.wallet,
    action,
    courseId,
    lessonIndex,
    input,
    issuedAtMs: nowMs,
    expiresAtMs: nowMs + DEFAULT_TTL_MS,
    consumed: false,
  });

  return { nonce, input, action, courseId, lessonIndex };
}

export function verifyAndConsumeSiwsProof(params: {
  request: unknown;
}): VerifiedSiwsSession {
  const parsed = verifyRequestSchema.safeParse(params.request);
  if (!parsed.success) {
    throw new AuthError("MALFORMED_REQUEST", 400);
  }

  const nowMs = Date.now();
  const { nonce, output } = parsed.data;
  const record = challengeStore.get(nonce);
  if (!record) {
    cleanupExpiredChallenges(nowMs);
    throw new AuthError("INVALID_NONCE");
  }
  if (record.consumed) {
    throw new AuthError("REPLAYED_NONCE", 409);
  }
  if (nowMs > record.expiresAtMs + MAX_FUTURE_SKEW_MS) {
    challengeStore.delete(nonce);
    throw new AuthError("EXPIRED_MESSAGE");
  }

  const normalizedOutput = {
    account: {
      address: output.account.address,
      publicKey: new Uint8Array(bytesFromSerialized(output.account.publicKey)),
      chains: (output.account.chains ??
        []) as SolanaSignInOutput["account"]["chains"],
      features: (output.account.features ??
        []) as SolanaSignInOutput["account"]["features"],
    },
    signedMessage: new Uint8Array(bytesFromSerialized(output.signedMessage)),
    signature: new Uint8Array(bytesFromSerialized(output.signature)),
    signatureType: output.signatureType,
  } satisfies SolanaSignInOutput;

  const walletFromPublicKey = encodeBase58(normalizedOutput.account.publicKey);
  if (
    normalizedOutput.account.address !== record.wallet ||
    walletFromPublicKey !== record.wallet
  ) {
    throw new AuthError("INVALID_WALLET_BINDING");
  }

  const verified = verifySignIn(record.input, normalizedOutput);
  if (!verified) {
    throw new AuthError("INVALID_SIGNATURE");
  }

  record.consumed = true;
  challengeStore.set(nonce, record);

  return {
    wallet: record.wallet,
    action: record.action,
    courseId: record.courseId,
    lessonIndex: record.lessonIndex,
    nonce,
    issuedAt: record.input.issuedAt,
    expirationTime: record.input.expirationTime,
  };
}

export function assertSiwsIntentMatches(
  session: VerifiedSiwsSession,
  expected: {
    action: AuthAction;
    courseId: string | null;
    lessonIndex: number | null;
  }
): void {
  const courseIdMatch =
    expected.action === "profile"
      ? true
      : session.courseId === expected.courseId;
  if (
    session.action !== expected.action ||
    !courseIdMatch ||
    session.lessonIndex !== expected.lessonIndex
  ) {
    throw new AuthError("INTENT_MISMATCH", 401);
  }
}

export function expireNonceForTest(nonce: string): void {
  const record = challengeStore.get(nonce);
  if (!record) return;
  record.expiresAtMs = Date.now() - MAX_FUTURE_SKEW_MS - 1;
  challengeStore.set(nonce, record);
}
