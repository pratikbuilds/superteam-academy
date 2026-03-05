import { address, createSolanaRpc, fetchEncodedAccounts } from "@solana/kit";
import { decodeToken } from "@solana-program/token-2022";
import { fetchMaybeConfig, getConfigPda } from "@superteam/academy-sdk";
import { env } from "./env.js";

export type LeaderboardEntry = {
  rank: number;
  wallet: string;
  xp: number;
};

const LEADERBOARD_LIMIT = 20;

function normalizeWallet(owner: unknown): string {
  if (typeof owner === "string" && owner.length > 0) return owner;
  if (
    owner != null &&
    typeof (owner as { toString?: () => string }).toString === "function"
  ) {
    return (owner as { toString: () => string }).toString();
  }
  return "";
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const rpc = createSolanaRpc(env.RPC_URL);
  const programAddress = address(env.PROGRAM_ID);
  const configPda = await getConfigPda(programAddress);
  const maybe = await fetchMaybeConfig(
    rpc as Parameters<typeof fetchMaybeConfig>[0],
    configPda
  );
  if (!maybe.exists) {
    throw new Error("Config not found");
  }
  const xpMint = address(maybe.data.xpMint);

  const { value: largest } = await rpc.getTokenLargestAccounts(xpMint).send();
  const accounts = largest ?? [];
  if (accounts.length === 0) {
    return [];
  }

  const tokenAccountAddresses = accounts.map((a) => address(a.address));
  const encodedAccounts = await fetchEncodedAccounts(
    rpc,
    tokenAccountAddresses
  );

  const withOwner = encodedAccounts
    .map((encoded, i) => {
      const acc = accounts[i];
      if (!acc) return null;
      const amount = acc.amount;
      const xp = typeof amount === "bigint" ? Number(amount) : Number(amount);
      if (!Number.isFinite(xp) || xp < 0) return null;
      const decoded = decodeToken(encoded);
      if (!decoded.exists) return null;
      const wallet = normalizeWallet(decoded.data.owner);
      if (!wallet) return null;
      return { wallet, xp };
    })
    .filter((r): r is { wallet: string; xp: number } => r !== null);

  const sorted = [...withOwner].sort((a, b) => b.xp - a.xp);
  return sorted.slice(0, LEADERBOARD_LIMIT).map((r, i) => ({
    rank: i + 1,
    wallet: r.wallet,
    xp: r.xp,
  }));
}
