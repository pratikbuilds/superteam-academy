import { address, createSolanaRpc } from "@solana/kit";
import { eq } from "drizzle-orm";
import {
  ACHIEVEMENT_TYPE_DISCRIMINATOR,
  fetchAllCoursesByProgram,
  fetchAllMaybeAchievementType,
  fetchMaybeAchievementReceipt,
  fetchMaybeConfig,
  fetchMaybeCourse,
  fetchMaybeEnrollment,
  getAchievementReceiptPda,
  getConfigPda,
  getCoursePda,
  getEnrollmentPda,
  getXpAta,
} from "@superteam/academy-sdk";
import { db } from "./db";
import { completedEnrollments } from "./db/schema";
import { env } from "./env";

const programAddress = address(env.PROGRAM_ID);

function getRpc() {
  return createSolanaRpc(env.RPC_URL);
}

export async function readConfig(): Promise<{
  xpMint: string;
  backendSigner?: string;
  authority?: string;
}> {
  const rpc = getRpc();
  const configPda = await getConfigPda(programAddress);
  const maybe = await fetchMaybeConfig(
    rpc as Parameters<typeof fetchMaybeConfig>[0],
    configPda
  );
  if (!maybe.exists) {
    throw new Error("CONFIG_NOT_INITIALIZED");
  }
  const data = maybe.data;
  return {
    xpMint: data.xpMint,
    backendSigner: data.backendSigner,
    authority: data.authority,
  };
}

export async function readCourses(activeOnly = true): Promise<
  Array<{
    courseId: string;
    lessonCount: number;
    xpPerLesson: number;
    isActive: boolean;
    creator: string;
    [key: string]: unknown;
  }>
> {
  const rpc = getRpc();
  const maybeCourses = await fetchAllCoursesByProgram(
    rpc as unknown as Parameters<typeof fetchAllCoursesByProgram>[0],
    programAddress
  );
  return maybeCourses
    .filter((m) => m.exists)
    .map((m) => m.data)
    .filter((c) => !activeOnly || c.isActive)
    .map((c) => ({
      courseId: c.courseId,
      lessonCount: c.lessonCount,
      xpPerLesson: c.xpPerLesson,
      isActive: c.isActive,
      creator: c.creator,
    }));
}

export async function readCourse(courseId: string): Promise<{
  courseId: string;
  lessonCount: number;
  xpPerLesson: number;
  isActive: boolean;
  creator: string;
  [key: string]: unknown;
} | null> {
  const rpc = getRpc();
  const coursePda = await getCoursePda(courseId, programAddress);
  const maybe = await fetchMaybeCourse(
    rpc as Parameters<typeof fetchMaybeCourse>[0],
    coursePda
  );
  if (!maybe.exists) {
    return null;
  }
  const c = maybe.data;
  return {
    courseId: c.courseId,
    lessonCount: c.lessonCount,
    xpPerLesson: c.xpPerLesson,
    isActive: c.isActive,
    creator: c.creator,
  };
}

export async function readEnrollment(courseId: string, learner: string) {
  const rpc = getRpc();
  const learnerAddress = address(learner);
  const enrollmentPda = await getEnrollmentPda(
    courseId,
    learnerAddress,
    programAddress
  );
  const maybe = await fetchMaybeEnrollment(
    rpc as Parameters<typeof fetchMaybeEnrollment>[0],
    enrollmentPda
  );
  if (!maybe.exists) {
    return null;
  }
  const d = maybe.data;
  return {
    lessonFlags: d.lessonFlags.map((f) => String(f)),
    completedAt: d.completedAt != null ? String(d.completedAt) : null,
    credentialAsset:
      d.credentialAsset != null &&
      typeof d.credentialAsset === "object" &&
      "__option" in d.credentialAsset &&
      (d.credentialAsset as { __option: string }).__option === "Some" &&
      "value" in d.credentialAsset
        ? String((d.credentialAsset as { value: unknown }).value)
        : typeof d.credentialAsset === "string"
        ? d.credentialAsset
        : null,
  };
}

export async function readXpBalance(learner: string): Promise<{
  balance: number;
  ata: string;
}> {
  const rpc = getRpc();
  const configPda = await getConfigPda(programAddress);
  const maybeConfig = await fetchMaybeConfig(
    rpc as Parameters<typeof fetchMaybeConfig>[0],
    configPda
  );
  if (!maybeConfig.exists) {
    throw new Error("CONFIG_NOT_INITIALIZED");
  }
  const learnerAddress = address(learner);
  const ata = await getXpAta(learnerAddress, maybeConfig.data.xpMint);
  try {
    const { value } = await rpc.getTokenAccountBalance(ata).send();
    return {
      balance: Number(value.amount),
      ata,
    };
  } catch {
    return { balance: 0, ata };
  }
}

export async function readAchievementsForWallet(learner: string): Promise<
  Array<{
    achievementId: string;
    name: string;
    asset: string;
    awardedAt: number;
  }>
> {
  const rpc = getRpc();
  const learnerAddress = address(learner);
  const discriminatorB64 = Buffer.from(ACHIEVEMENT_TYPE_DISCRIMINATOR).toString(
    "base64"
  );
  const rpcWithGpa = rpc as unknown as {
    getProgramAccounts: (
      program: typeof programAddress,
      config?: {
        commitment?: string;
        filters?: Array<{ memcmp: { offset: bigint; bytes: string } }>;
      }
    ) => {
      send: () => Promise<{ value: Array<{ pubkey: typeof programAddress }> }>;
    };
  };
  const { value: accounts } = await rpcWithGpa
    .getProgramAccounts(programAddress, {
      commitment: "confirmed",
      filters: [
        {
          memcmp: {
            offset: 0n,
            bytes: `base64:${discriminatorB64}`,
          },
        },
      ],
    })
    .send();

  if (!accounts || accounts.length === 0) {
    return [];
  }

  const addresses = accounts.map((a) => a.pubkey);
  const maybeTypes = await fetchAllMaybeAchievementType(
    rpc as Parameters<typeof fetchAllMaybeAchievementType>[0],
    addresses
  );

  const results: Array<{
    achievementId: string;
    name: string;
    asset: string;
    awardedAt: number;
  }> = [];

  for (const maybeType of maybeTypes) {
    if (!maybeType.exists) continue;
    const type = maybeType.data;
    const receiptPda = await getAchievementReceiptPda(
      type.achievementId,
      learnerAddress,
      programAddress
    );
    const maybeReceipt = await fetchMaybeAchievementReceipt(
      rpc as Parameters<typeof fetchMaybeAchievementReceipt>[0],
      receiptPda
    );
    if (maybeReceipt.exists) {
      results.push({
        achievementId: type.achievementId,
        name: type.name,
        asset: String(maybeReceipt.data.asset),
        awardedAt: Number(maybeReceipt.data.awardedAt),
      });
    }
  }

  return results;
}

export async function readCredentialParams(learner: string): Promise<{
  trackCollection: string;
  credentialName: string;
  metadataUri: string;
  coursesCompleted: number;
  totalXp: number;
} | null> {
  const trackCollection = env.TRACK_COLLECTION;
  if (!trackCollection) {
    return null;
  }
  const rows = await db
    .select()
    .from(completedEnrollments)
    .where(eq(completedEnrollments.wallet, learner));
  const coursesCompleted = rows.length;
  const xpData = await readXpBalance(learner);
  return {
    trackCollection,
    credentialName: env.CREDENTIAL_NAME ?? "Superteam Academy Credential",
    metadataUri:
      env.CREDENTIAL_METADATA_URI ??
      "https://arweave.net/superteam-academy-credential",
    coursesCompleted,
    totalXp: xpData.balance,
  };
}
