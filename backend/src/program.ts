import {
  AccountRole,
  address,
  appendTransactionMessageInstruction,
  createKeyPairSignerFromBytes,
  createKeyPairSignerFromPrivateKeyBytes,
  generateKeyPairSigner,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  getSignatureFromTransaction,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type Address,
  type GetAccountInfoApi,
  type GetEpochInfoApi,
  type GetLatestBlockhashApi,
  type GetSignatureStatusesApi,
  type Instruction,
  type KeyPairSigner,
  type Rpc,
  type RpcSubscriptions,
  type SendTransactionApi,
  type SignatureNotificationsApi,
  type SlotNotificationsApi,
} from "@solana/kit";
import {
  ONCHAIN_ACADEMY_ERROR__COURSE_NOT_FINALIZED,
  ONCHAIN_ACADEMY_ERROR__COURSE_ALREADY_FINALIZED,
  ONCHAIN_ACADEMY_ERROR__COURSE_NOT_COMPLETED,
  ONCHAIN_ACADEMY_ERROR__CREDENTIAL_ALREADY_ISSUED,
  ONCHAIN_ACADEMY_ERROR__CREDENTIAL_ASSET_MISMATCH,
  ONCHAIN_ACADEMY_ERROR__LESSON_ALREADY_COMPLETED,
  ONCHAIN_ACADEMY_ERROR__LESSON_OUT_OF_BOUNDS,
  fetchMaybeConfig,
  fetchMaybeCourse,
  fetchMaybeEnrollment,
  getCompleteLessonInstructionAsync,
  getConfigPda,
  getCoursePda,
  getEnrollmentPda,
  getFinalizeCourseInstructionAsync,
  getIssueCredentialInstructionAsync,
  getUpgradeCredentialInstructionAsync,
  getXpAta,
  isOnchainAcademyError,
} from "@superteam/academy-sdk";
import { env } from "./env";

const TOKEN_2022_PROGRAM_ADDRESS = address(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
);
const ASSOCIATED_TOKEN_PROGRAM_ADDRESS = address(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);
const SYSTEM_PROGRAM_ADDRESS = address("11111111111111111111111111111111");

type RpcLike = Rpc<
  GetAccountInfoApi &
    GetEpochInfoApi &
    GetLatestBlockhashApi &
    GetSignatureStatusesApi &
    SendTransactionApi
>;
type RpcSubscriptionsLike = RpcSubscriptions<
  SignatureNotificationsApi & SlotNotificationsApi
>;

type ProgramContext = {
  rpc: RpcLike;
  rpcSubscriptions: RpcSubscriptionsLike;
  programAddress: Address;
  backendSigner: KeyPairSigner;
};

let contextPromise: Promise<ProgramContext> | null = null;

export class ProgramError extends Error {
  status: number;
  code: string;

  constructor(code: string, status = 400, message?: string) {
    super(message ?? code);
    this.code = code;
    this.status = status;
  }
}

function deriveRpcWsUrl(rpcUrl: string): string {
  const url = new URL(rpcUrl);
  if (url.protocol === "https:") url.protocol = "wss:";
  if (url.protocol === "http:") url.protocol = "ws:";
  return url.toString();
}

export function parseBase64SecretKey(input: string): Uint8Array {
  const decoded = Buffer.from(input, "base64");
  const maybeJson = decoded.toString("utf8").trim();
  if (maybeJson.startsWith("[")) {
    const parsed = JSON.parse(maybeJson) as unknown;
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (value) => Number.isInteger(value) && value >= 0 && value <= 255,
      )
    ) {
      return Uint8Array.from(parsed);
    }
  }
  return Uint8Array.from(decoded);
}

async function loadBackendSigner(
  secretKeyBase64: string,
): Promise<KeyPairSigner> {
  const secretKeyBytes = parseBase64SecretKey(secretKeyBase64);
  if (secretKeyBytes.length === 64) {
    return createKeyPairSignerFromBytes(secretKeyBytes);
  }
  if (secretKeyBytes.length === 32) {
    return createKeyPairSignerFromPrivateKeyBytes(secretKeyBytes);
  }
  throw new ProgramError(
    "INVALID_BACKEND_SIGNER",
    500,
    "BACKEND_SIGNER_KEYPAIR must decode to 64-byte keypair bytes or 32-byte private key bytes",
  );
}

async function getProgramContext(): Promise<ProgramContext> {
  if (!contextPromise) {
    contextPromise = (async () => {
      const rpc = createSolanaRpc(env.RPC_URL) as RpcLike;
      const rpcSubscriptions = createSolanaRpcSubscriptions(
        env.RPC_WS_URL ?? deriveRpcWsUrl(env.RPC_URL),
      ) as RpcSubscriptionsLike;
      const programAddress = address(env.PROGRAM_ID);
      const backendSigner = await loadBackendSigner(env.BACKEND_SIGNER_KEYPAIR);
      return {
        rpc,
        rpcSubscriptions,
        programAddress,
        backendSigner,
      };
    })();
  }

  return contextPromise;
}

function getCreateAssociatedTokenInstruction(params: {
  payer: Address;
  owner: Address;
  mint: Address;
  ata: Address;
}): Instruction {
  return {
    programAddress: ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
    accounts: [
      { address: params.payer, role: AccountRole.WRITABLE_SIGNER },
      { address: params.ata, role: AccountRole.WRITABLE },
      { address: params.owner, role: AccountRole.READONLY },
      { address: params.mint, role: AccountRole.READONLY },
      { address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY },
      { address: TOKEN_2022_PROGRAM_ADDRESS, role: AccountRole.READONLY },
    ],
    data: new Uint8Array(),
  };
}

function assertBackendSignerMatchesConfig(input: {
  backendSigner: Address;
  configBackendSigner: Address;
}): void {
  if (input.configBackendSigner !== input.backendSigner) {
    throw new ProgramError(
      "BACKEND_SIGNER_MISMATCH",
      500,
      "Config backend signer does not match BACKEND_SIGNER_KEYPAIR",
    );
  }
}

async function signAndSendTransaction(params: {
  context: ProgramContext;
  transactionMessage: Parameters<typeof signTransactionMessageWithSigners>[0];
}): Promise<string> {
  const signedTransaction = await signTransactionMessageWithSigners(
    params.transactionMessage,
  );
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    rpc: params.context.rpc,
    rpcSubscriptions: params.context.rpcSubscriptions,
  });

  await sendAndConfirmTransaction(
    signedTransaction as Parameters<typeof sendAndConfirmTransaction>[0],
    { commitment: "confirmed" },
  );

  return getSignatureFromTransaction(signedTransaction);
}

export async function completeLessonOnChain(input: {
  courseId: string;
  lessonIndex: number;
  learner: Address;
}): Promise<{ signature: string }> {
  console.log("[completeLessonOnChain] input:", {
    courseId: input.courseId,
    lessonIndex: input.lessonIndex,
    learner: String(input.learner),
  });

  const context = await getProgramContext();
  const configPda = await getConfigPda(context.programAddress);
  const coursePda = await getCoursePda(input.courseId, context.programAddress);
  const enrollmentPda = await getEnrollmentPda(
    input.courseId,
    input.learner,
    context.programAddress,
  );

  const maybeConfig = await fetchMaybeConfig(context.rpc, configPda);
  if (!maybeConfig.exists) {
    throw new ProgramError("CONFIG_NOT_INITIALIZED", 500);
  }

  const config = maybeConfig.data;
  assertBackendSignerMatchesConfig({
    backendSigner: context.backendSigner.address,
    configBackendSigner: config.backendSigner,
  });

  const maybeCourse = await fetchMaybeCourse(context.rpc, coursePda);
  if (!maybeCourse.exists) {
    throw new ProgramError("COURSE_NOT_FOUND", 404);
  }

  const course = maybeCourse.data;
  const lessonIndexU8 = Math.max(
    0,
    Math.min(255, Number(input.lessonIndex) | 0),
  ) as number;
  if (lessonIndexU8 >= course.lessonCount) {
    throw new ProgramError(
      "LESSON_OUT_OF_BOUNDS",
      400,
      `Lesson index ${lessonIndexU8} >= course lesson count ${course.lessonCount}`,
    );
  }

  const maybeEnrollment = await fetchMaybeEnrollment(
    context.rpc,
    enrollmentPda,
  );
  if (!maybeEnrollment.exists) {
    throw new ProgramError("ENROLLMENT_NOT_FOUND", 403);
  }

  const learnerTokenAccount = await getXpAta(input.learner, config.xpMint);
  const learnerTokenAccountInfo = await context.rpc
    .getAccountInfo(learnerTokenAccount, {
      encoding: "base64",
    })
    .send();
  const shouldCreateLearnerAta = learnerTokenAccountInfo.value == null;

  const completeInstruction = await getCompleteLessonInstructionAsync(
    {
      config: configPda,
      course: coursePda,
      enrollment: enrollmentPda,
      learner: input.learner,
      learnerTokenAccount,
      xpMint: config.xpMint,
      backendSigner: context.backendSigner,
      lessonIndex: lessonIndexU8,
    },
    {
      programAddress: context.programAddress,
    },
  );

  const { value: latestBlockhash } = await context.rpc
    .getLatestBlockhash()
    .send();
  let transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (message) =>
      setTransactionMessageFeePayerSigner(context.backendSigner, message),
    (message) =>
      setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, message),
  );

  if (shouldCreateLearnerAta) {
    transactionMessage = appendTransactionMessageInstruction(
      getCreateAssociatedTokenInstruction({
        payer: context.backendSigner.address,
        owner: input.learner,
        mint: config.xpMint,
        ata: learnerTokenAccount,
      }),
      transactionMessage,
    );
  }

  transactionMessage = appendTransactionMessageInstruction(
    completeInstruction,
    transactionMessage,
  );

  try {
    const signature = await signAndSendTransaction({
      context,
      transactionMessage,
    });
    return { signature };
  } catch (error) {
    if (
      isOnchainAcademyError(
        error,
        transactionMessage,
        ONCHAIN_ACADEMY_ERROR__LESSON_ALREADY_COMPLETED,
      )
    ) {
      throw new ProgramError(
        "LESSON_ALREADY_COMPLETED",
        409,
        "Lesson already completed",
      );
    }
    if (
      isOnchainAcademyError(
        error,
        transactionMessage,
        ONCHAIN_ACADEMY_ERROR__LESSON_OUT_OF_BOUNDS,
      )
    ) {
      throw new ProgramError(
        "LESSON_OUT_OF_BOUNDS",
        400,
        `Lesson index >= course.lesson_count on-chain. Create/use a course with lesson_count >= ${input.lessonIndex + 1}.`,
      );
    }

    const err = error as unknown as Record<string, unknown> | undefined;
    const logs = err?.logs ?? err?.transactionLogs ?? err?.data?.logs;
    console.error("[completeLessonOnChain] transaction failed:", {
      message: error instanceof Error ? error.message : String(error),
      cause: error instanceof Error ? error.cause : undefined,
      ...(Array.isArray(logs) && logs.length > 0
        ? { simulationLogs: logs }
        : {}),
    });
    throw new ProgramError("COMPLETE_LESSON_FAILED", 500, String(error));
  }
}

export type CompleteLessonOnChain = typeof completeLessonOnChain;

export async function finalizeCourseOnChain(input: {
  courseId: string;
  learner: Address;
}): Promise<{ signature: string }> {
  const context = await getProgramContext();
  const configPda = await getConfigPda(context.programAddress);
  const coursePda = await getCoursePda(input.courseId, context.programAddress);
  const enrollmentPda = await getEnrollmentPda(
    input.courseId,
    input.learner,
    context.programAddress,
  );

  const maybeConfig = await fetchMaybeConfig(context.rpc, configPda);
  if (!maybeConfig.exists) {
    throw new ProgramError("CONFIG_NOT_INITIALIZED", 500);
  }

  const config = maybeConfig.data;
  assertBackendSignerMatchesConfig({
    backendSigner: context.backendSigner.address,
    configBackendSigner: config.backendSigner,
  });

  const maybeCourse = await fetchMaybeCourse(context.rpc, coursePda);
  if (!maybeCourse.exists) {
    throw new ProgramError("COURSE_NOT_FOUND", 404);
  }

  const course = maybeCourse.data;
  const maybeEnrollment = await fetchMaybeEnrollment(
    context.rpc,
    enrollmentPda,
  );
  if (!maybeEnrollment.exists) {
    throw new ProgramError("ENROLLMENT_NOT_FOUND", 403);
  }

  const learnerTokenAccount = await getXpAta(input.learner, config.xpMint);
  const creatorTokenAccount = await getXpAta(course.creator, config.xpMint);

  const [learnerTokenAccountInfo, creatorTokenAccountInfo] = await Promise.all([
    context.rpc
      .getAccountInfo(learnerTokenAccount, {
        encoding: "base64",
      })
      .send(),
    context.rpc
      .getAccountInfo(creatorTokenAccount, {
        encoding: "base64",
      })
      .send(),
  ]);
  const shouldCreateLearnerAta = learnerTokenAccountInfo.value == null;
  const shouldCreateCreatorAta = creatorTokenAccountInfo.value == null;

  const finalizeInstruction = await getFinalizeCourseInstructionAsync(
    {
      course: coursePda,
      enrollment: enrollmentPda,
      learner: input.learner,
      learnerTokenAccount,
      creatorTokenAccount,
      creator: course.creator,
      xpMint: config.xpMint,
      backendSigner: context.backendSigner,
    },
    {
      programAddress: context.programAddress,
    },
  );

  const { value: latestBlockhash } = await context.rpc
    .getLatestBlockhash()
    .send();
  let transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (message) =>
      setTransactionMessageFeePayerSigner(context.backendSigner, message),
    (message) =>
      setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, message),
  );

  if (shouldCreateLearnerAta) {
    transactionMessage = appendTransactionMessageInstruction(
      getCreateAssociatedTokenInstruction({
        payer: context.backendSigner.address,
        owner: input.learner,
        mint: config.xpMint,
        ata: learnerTokenAccount,
      }),
      transactionMessage,
    );
  }
  if (shouldCreateCreatorAta) {
    transactionMessage = appendTransactionMessageInstruction(
      getCreateAssociatedTokenInstruction({
        payer: context.backendSigner.address,
        owner: course.creator,
        mint: config.xpMint,
        ata: creatorTokenAccount,
      }),
      transactionMessage,
    );
  }

  transactionMessage = appendTransactionMessageInstruction(
    finalizeInstruction,
    transactionMessage,
  );

  try {
    const signature = await signAndSendTransaction({
      context,
      transactionMessage,
    });
    return { signature };
  } catch (error) {
    if (
      isOnchainAcademyError(
        error,
        transactionMessage,
        ONCHAIN_ACADEMY_ERROR__COURSE_NOT_COMPLETED,
      )
    ) {
      throw new ProgramError(
        "COURSE_NOT_COMPLETED",
        409,
        "Not all lessons are completed",
      );
    }
    if (
      isOnchainAcademyError(
        error,
        transactionMessage,
        ONCHAIN_ACADEMY_ERROR__COURSE_ALREADY_FINALIZED,
      )
    ) {
      throw new ProgramError(
        "COURSE_ALREADY_FINALIZED",
        409,
        "Course already finalized",
      );
    }

    throw new ProgramError("FINALIZE_COURSE_FAILED", 500, String(error));
  }
}

export async function issueCredentialOnChain(input: {
  courseId: string;
  learner: Address;
  trackCollection: Address;
  credentialName: string;
  metadataUri: string;
  coursesCompleted: number;
  totalXp: bigint;
}): Promise<{ signature: string; credentialAsset: Address }> {
  const context = await getProgramContext();
  const configPda = await getConfigPda(context.programAddress);
  const coursePda = await getCoursePda(input.courseId, context.programAddress);
  const enrollmentPda = await getEnrollmentPda(
    input.courseId,
    input.learner,
    context.programAddress,
  );

  const maybeConfig = await fetchMaybeConfig(context.rpc, configPda);
  if (!maybeConfig.exists) {
    throw new ProgramError("CONFIG_NOT_INITIALIZED", 500);
  }
  assertBackendSignerMatchesConfig({
    backendSigner: context.backendSigner.address,
    configBackendSigner: maybeConfig.data.backendSigner,
  });

  const maybeCourse = await fetchMaybeCourse(context.rpc, coursePda);
  if (!maybeCourse.exists) {
    throw new ProgramError("COURSE_NOT_FOUND", 404);
  }

  const maybeEnrollment = await fetchMaybeEnrollment(
    context.rpc,
    enrollmentPda,
  );
  if (!maybeEnrollment.exists) {
    throw new ProgramError("ENROLLMENT_NOT_FOUND", 403);
  }

  const credentialAssetSigner = await generateKeyPairSigner();
  const issueInstruction = await getIssueCredentialInstructionAsync(
    {
      course: coursePda,
      enrollment: enrollmentPda,
      learner: input.learner,
      credentialAsset: credentialAssetSigner,
      trackCollection: input.trackCollection,
      payer: context.backendSigner,
      backendSigner: context.backendSigner,
      credentialName: input.credentialName,
      metadataUri: input.metadataUri,
      coursesCompleted: input.coursesCompleted,
      totalXp: input.totalXp,
    },
    {
      programAddress: context.programAddress,
    },
  );

  const { value: latestBlockhash } = await context.rpc
    .getLatestBlockhash()
    .send();
  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (message) =>
      setTransactionMessageFeePayerSigner(context.backendSigner, message),
    (message) =>
      setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, message),
    (message) => appendTransactionMessageInstruction(issueInstruction, message),
  );

  try {
    const signature = await signAndSendTransaction({
      context,
      transactionMessage,
    });
    return { signature, credentialAsset: credentialAssetSigner.address };
  } catch (error) {
    if (
      isOnchainAcademyError(
        error,
        transactionMessage,
        ONCHAIN_ACADEMY_ERROR__COURSE_NOT_FINALIZED,
      )
    ) {
      throw new ProgramError(
        "COURSE_NOT_FINALIZED",
        409,
        "Course must be finalized before issuing credential",
      );
    }
    if (
      isOnchainAcademyError(
        error,
        transactionMessage,
        ONCHAIN_ACADEMY_ERROR__CREDENTIAL_ALREADY_ISSUED,
      )
    ) {
      throw new ProgramError(
        "CREDENTIAL_ALREADY_ISSUED",
        409,
        "Credential already issued for this enrollment",
      );
    }

    throw new ProgramError("ISSUE_CREDENTIAL_FAILED", 500, String(error));
  }
}

export async function upgradeCredentialOnChain(input: {
  courseId: string;
  learner: Address;
  credentialAsset: Address;
  trackCollection: Address;
  credentialName: string;
  metadataUri: string;
  coursesCompleted: number;
  totalXp: bigint;
}): Promise<{ signature: string; credentialAsset: Address }> {
  const context = await getProgramContext();
  const configPda = await getConfigPda(context.programAddress);
  const coursePda = await getCoursePda(input.courseId, context.programAddress);
  const enrollmentPda = await getEnrollmentPda(
    input.courseId,
    input.learner,
    context.programAddress,
  );

  const maybeConfig = await fetchMaybeConfig(context.rpc, configPda);
  if (!maybeConfig.exists) {
    throw new ProgramError("CONFIG_NOT_INITIALIZED", 500);
  }
  assertBackendSignerMatchesConfig({
    backendSigner: context.backendSigner.address,
    configBackendSigner: maybeConfig.data.backendSigner,
  });

  const maybeCourse = await fetchMaybeCourse(context.rpc, coursePda);
  if (!maybeCourse.exists) {
    throw new ProgramError("COURSE_NOT_FOUND", 404);
  }

  const maybeEnrollment = await fetchMaybeEnrollment(
    context.rpc,
    enrollmentPda,
  );
  if (!maybeEnrollment.exists) {
    throw new ProgramError("ENROLLMENT_NOT_FOUND", 403);
  }

  const upgradeInstruction = await getUpgradeCredentialInstructionAsync(
    {
      course: coursePda,
      enrollment: enrollmentPda,
      learner: input.learner,
      credentialAsset: input.credentialAsset,
      trackCollection: input.trackCollection,
      payer: context.backendSigner,
      backendSigner: context.backendSigner,
      credentialName: input.credentialName,
      metadataUri: input.metadataUri,
      coursesCompleted: input.coursesCompleted,
      totalXp: input.totalXp,
    },
    {
      programAddress: context.programAddress,
    },
  );

  const { value: latestBlockhash } = await context.rpc
    .getLatestBlockhash()
    .send();
  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (message) =>
      setTransactionMessageFeePayerSigner(context.backendSigner, message),
    (message) =>
      setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, message),
    (message) =>
      appendTransactionMessageInstruction(upgradeInstruction, message),
  );

  try {
    const signature = await signAndSendTransaction({
      context,
      transactionMessage,
    });
    return { signature, credentialAsset: input.credentialAsset };
  } catch (error) {
    if (
      isOnchainAcademyError(
        error,
        transactionMessage,
        ONCHAIN_ACADEMY_ERROR__COURSE_NOT_FINALIZED,
      )
    ) {
      throw new ProgramError(
        "COURSE_NOT_FINALIZED",
        409,
        "Course must be finalized before upgrading credential",
      );
    }
    if (
      isOnchainAcademyError(
        error,
        transactionMessage,
        ONCHAIN_ACADEMY_ERROR__CREDENTIAL_ASSET_MISMATCH,
      )
    ) {
      throw new ProgramError(
        "CREDENTIAL_ASSET_MISMATCH",
        409,
        "Credential asset does not match enrollment record",
      );
    }

    throw new ProgramError("UPGRADE_CREDENTIAL_FAILED", 500, String(error));
  }
}
