import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { getAsset } from "../lib/das.js";
import {
  verifyAndConsumeSiwsProof,
  assertSiwsIntentMatches,
  AuthError,
} from "../auth.js";
import { db } from "../db/index.js";
import { profiles, completedEnrollments } from "../db/schema.js";
import { handleRouteError } from "../lib/errors.js";
import { parseJsonBody } from "../lib/parse.js";
import { readAchievementsForWallet } from "../read.js";
import {
  learnerQuerySchema,
  updateProfileRequestSchema,
} from "../schemas/requests.js";
import { env } from "../env.js";

export const profileRoutes = new Hono();

profileRoutes.get("/profile/me", async (c) => {
  const parsed = learnerQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json(
      { error: "MALFORMED_REQUEST", details: "learner required" },
      400
    );
  }
  try {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.wallet, parsed.data.learner))
      .limit(1);
    if (!profile) {
      return c.json(null, 200);
    }
    return c.json(profile);
  } catch (error) {
    return handleRouteError(c, error, "PROFILE_FETCH_FAILED", 500);
  }
});

profileRoutes.put("/profile", async (c) => {
  const body = await parseJsonBody(c);
  const parsed = updateProfileRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: "MALFORMED_REQUEST" }, 400);
  }
  try {
    const session = verifyAndConsumeSiwsProof({
      request: { nonce: parsed.data.nonce, output: parsed.data.output },
    });
    assertSiwsIntentMatches(session, {
      action: "profile",
      courseId: null,
      lessonIndex: null,
    });

    const { nonce, output, ...updates } = parsed.data;
    const wallet = session.wallet;

    if (updates.username != null) {
      const [existing] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.username, updates.username))
        .limit(1);
      if (existing && existing.wallet !== wallet) {
        return c.json({ ok: false, error: "USERNAME_TAKEN" }, 409);
      }
    }

    const now = new Date();
    const [existing] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.wallet, wallet))
      .limit(1);

    if (existing) {
      await db
        .update(profiles)
        .set({
          ...(updates.username != null && { username: updates.username }),
          ...(updates.displayName != null && {
            displayName: updates.displayName,
          }),
          ...(updates.bio != null && { bio: updates.bio }),
          ...(updates.avatarUrl != null && { avatarUrl: updates.avatarUrl }),
          ...(updates.socialLinks != null && {
            socialLinks: JSON.stringify(updates.socialLinks),
          }),
          ...(updates.visibility != null && { visibility: updates.visibility }),
          updatedAt: now,
        })
        .where(eq(profiles.wallet, wallet));
    } else {
      if (!updates.username) {
        return c.json({ ok: false, error: "USERNAME_REQUIRED" }, 400);
      }
      await db.insert(profiles).values({
        wallet,
        username: updates.username,
        displayName: updates.displayName ?? null,
        bio: updates.bio ?? null,
        avatarUrl: updates.avatarUrl ?? null,
        socialLinks:
          updates.socialLinks != null
            ? JSON.stringify(updates.socialLinks)
            : null,
        joinDate: now,
        visibility: updates.visibility ?? "public",
        createdAt: now,
        updatedAt: now,
      });
    }

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.wallet, wallet))
      .limit(1);
    return c.json({ ok: true, profile });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json(
        { ok: false, error: error.code },
        error.status as 400 | 401 | 409
      );
    }
    return handleRouteError(c, error, "PROFILE_UPDATE_FAILED", 500);
  }
});

profileRoutes.get("/profile/by-wallet/:wallet", async (c) => {
  const wallet = c.req.param("wallet");
  if (!wallet || wallet.length < 32) {
    return c.json({ error: "INVALID_WALLET" }, 400);
  }
  try {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(
        and(eq(profiles.wallet, wallet), eq(profiles.visibility, "public"))
      )
      .limit(1);
    if (!profile) {
      return c.json({ error: "PROFILE_NOT_FOUND" }, 404);
    }
    return c.json(profile);
  } catch (error) {
    return handleRouteError(c, error, "PROFILE_FETCH_FAILED", 500);
  }
});

profileRoutes.get("/profile/by-username/:username", async (c) => {
  const username = c.req.param("username");
  if (!username) {
    return c.json({ error: "INVALID_USERNAME" }, 400);
  }
  try {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(
        and(eq(profiles.username, username), eq(profiles.visibility, "public"))
      )
      .limit(1);
    if (!profile) {
      return c.json({ error: "PROFILE_NOT_FOUND" }, 404);
    }
    return c.json(profile);
  } catch (error) {
    return handleRouteError(c, error, "PROFILE_FETCH_FAILED", 500);
  }
});

async function resolveWallet(walletOrUsername: string): Promise<string | null> {
  if (walletOrUsername.length >= 32) {
    return walletOrUsername;
  }
  const [profile] = await db
    .select({ wallet: profiles.wallet })
    .from(profiles)
    .where(eq(profiles.username, walletOrUsername))
    .limit(1);
  return profile?.wallet ?? null;
}

profileRoutes.get("/profile/:walletOrUsername/completed-courses", async (c) => {
  const walletOrUsername = c.req.param("walletOrUsername");
  if (!walletOrUsername) {
    return c.json({ error: "INVALID_PARAM" }, 400);
  }
  try {
    const wallet = await resolveWallet(walletOrUsername);
    if (!wallet) {
      return c.json({ error: "PROFILE_NOT_FOUND" }, 404);
    }
    const rows = await db
      .select()
      .from(completedEnrollments)
      .where(eq(completedEnrollments.wallet, wallet))
      .orderBy(desc(completedEnrollments.completedAt));
    return c.json(rows);
  } catch (error) {
    return handleRouteError(c, error, "COMPLETED_COURSES_FETCH_FAILED", 500);
  }
});

profileRoutes.get("/certificates/:assetId", async (c) => {
  const assetId = c.req.param("assetId");
  if (!assetId || assetId.length < 32) {
    return c.json({ error: "INVALID_ASSET_ID" }, 400);
  }
  try {
    const [row] = await db
      .select()
      .from(completedEnrollments)
      .where(eq(completedEnrollments.credentialAsset, assetId))
      .limit(1);
    if (!row) {
      console.log("[certificates] not found", assetId);
      return c.json({ error: "CERTIFICATE_NOT_FOUND" }, 404);
    }
    const isDevnet = env.RPC_URL.includes("devnet");
    const verificationLink = `https://explorer.solana.com/address/${assetId}${
      isDevnet ? "?cluster=devnet" : ""
    }`;
    const base = {
      wallet: row.wallet,
      courseId: row.courseId,
      completedAt: row.completedAt.toISOString(),
      credentialAsset: row.credentialAsset!,
      trackId: row.trackId,
      trackLevel: row.trackLevel,
      verificationLink,
    };
    const dasAsset = await getAsset(assetId);
    if (dasAsset) {
      console.log(
        "[certificates] found with DAS",
        assetId,
        "owner:",
        dasAsset.ownership?.owner
      );
      return c.json({
        ...base,
        mint: dasAsset.id,
        metadataUri: dasAsset.content?.json_uri ?? null,
        owner: dasAsset.ownership?.owner ?? null,
      });
    }
    console.log("[certificates] found", assetId);
    return c.json(base);
  } catch (error) {
    return handleRouteError(c, error, "CERTIFICATE_FETCH_FAILED", 500);
  }
});

profileRoutes.get("/profile/:wallet/credentials", async (c) => {
  const wallet = c.req.param("wallet");
  if (!wallet || wallet.length < 32) {
    return c.json({ error: "INVALID_WALLET" }, 400);
  }
  try {
    const withAsset = await db
      .select()
      .from(completedEnrollments)
      .where(eq(completedEnrollments.wallet, wallet));
    const credentials = withAsset
      .filter((e) => e.credentialAsset != null)
      .map((e) => ({
        asset: e.credentialAsset!,
        trackId: e.trackId,
        trackLevel: e.trackLevel,
        verificationLink: `${
          env.RPC_URL.includes("devnet")
            ? "https://explorer.solana.com"
            : "https://explorer.solana.com"
        }/address/${e.credentialAsset}${
          env.RPC_URL.includes("devnet") ? "?cluster=devnet" : ""
        }`,
      }));
    return c.json(credentials);
  } catch (error) {
    return handleRouteError(c, error, "CREDENTIALS_FETCH_FAILED", 500);
  }
});

profileRoutes.get("/profile/:wallet/achievements", async (c) => {
  const wallet = c.req.param("wallet");
  if (!wallet || wallet.length < 32) {
    return c.json({ error: "INVALID_WALLET" }, 400);
  }
  try {
    const achievements = await readAchievementsForWallet(wallet);
    return c.json(achievements);
  } catch (error) {
    return handleRouteError(c, error, "ACHIEVEMENTS_FETCH_FAILED", 500);
  }
});
