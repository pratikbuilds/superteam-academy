"use client";

import { address, getAddressEncoder } from "@solana/kit";
import { createSignInMessage } from "@solana/wallet-standard-util";
import { z } from "zod";
import { env } from "@/lib/env";
import {
  updateProfile,
  type Profile,
  type UpdateProfileInput,
} from "@/lib/api/academy";

const createSigninDataResponseSchema = z.object({
  ok: z.literal(true),
  nonce: z.string().min(8),
  input: z.object({
    domain: z.string().min(1),
    address: z.string().min(32),
    statement: z.string().optional(),
    uri: z.string().min(1),
    version: z.string().min(1),
    chainId: z.string().optional(),
    nonce: z.string().min(8),
    issuedAt: z.string().optional(),
    expirationTime: z.string().optional(),
    requestId: z.string().optional(),
  }),
});

type ApiErrorPayload = { ok?: boolean; error?: string };

export type WalletMessageSigner = {
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
};

function normalizeApiBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

async function postJson(path: string, body: unknown): Promise<unknown> {
  const response = await fetch(
    `${normalizeApiBaseUrl(env.NEXT_PUBLIC_ACADEMY_API_URL)}${path}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const payload = (await response.json()) as unknown;
  if (!response.ok) {
    const apiError = payload as ApiErrorPayload;
    throw new Error(apiError.error ?? "API_ERROR");
  }
  return payload;
}

function toUpdateInput(input: {
  nonce: string;
  output: unknown;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  socialLinks: { twitter?: string; github?: string; website?: string };
  visibility: "public" | "private";
}): UpdateProfileInput {
  return {
    username: input.username,
    displayName: input.displayName || undefined,
    bio: input.bio || undefined,
    avatarUrl: input.avatarUrl || undefined,
    socialLinks:
      input.socialLinks.twitter ||
      input.socialLinks.github ||
      input.socialLinks.website
        ? input.socialLinks
        : undefined,
    visibility: input.visibility,
    nonce: input.nonce,
    output: input.output,
  };
}

export async function saveProfileWithWalletAuth(input: {
  wallet: string;
  signer: WalletMessageSigner;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  socialLinks: { twitter?: string; github?: string; website?: string };
  visibility: "public" | "private";
}): Promise<{ ok: true; profile: Profile } | { ok: false; error: string }> {
  if (!input.signer.signMessage) {
    return { ok: false, error: "SIGN_MESSAGE_UNSUPPORTED" };
  }

  const challengePayload = await postJson("/auth/create-signin-data", {
    wallet: input.wallet,
    action: "profile",
    courseId: null,
    lessonIndex: null,
  });
  const challenge = createSigninDataResponseSchema.parse(challengePayload);
  if (challenge.input.address !== input.wallet) {
    return { ok: false, error: "INVALID_WALLET_BINDING" };
  }

  const message = createSignInMessage(challenge.input);
  let signature: Uint8Array;
  try {
    signature = await input.signer.signMessage(message);
  } catch (signError) {
    const msg =
      signError instanceof Error ? signError.message : String(signError);
    if (/sign|denied|rejected|cancel/i.test(msg)) {
      return { ok: false, error: "SIGNATURE_REJECTED" };
    }
    return { ok: false, error: "SIGN_MESSAGE_FAILED" };
  }

  const walletPublicKey = Array.from(
    getAddressEncoder().encode(address(input.wallet))
  );
  const output = {
    account: {
      address: input.wallet,
      publicKey: walletPublicKey,
      chains: challenge.input.chainId ? [challenge.input.chainId] : [],
      features: ["solana:signIn", "solana:signMessage"],
    },
    signedMessage: Array.from(message),
    signature: Array.from(signature),
    signatureType: "ed25519" as const,
  };

  const result = await updateProfile(
    toUpdateInput({
      nonce: challenge.nonce,
      output,
      username: input.username.trim(),
      displayName: input.displayName.trim(),
      bio: input.bio.trim(),
      avatarUrl: input.avatarUrl.trim(),
      socialLinks: input.socialLinks,
      visibility: input.visibility,
    })
  );

  if (!result.ok || !result.profile) {
    return { ok: false, error: result.error ?? "PROFILE_UPDATE_FAILED" };
  }

  return { ok: true, profile: result.profile };
}
