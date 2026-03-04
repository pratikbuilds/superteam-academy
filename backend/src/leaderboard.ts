import { address, createSolanaRpc, fetchEncodedAccounts } from "@solana/kit";
import { decodeToken } from "@solana-program/token-2022";
import { fetchMaybeConfig, getConfigPda } from "@superteam/academy-sdk";
import { env } from "./env";

export type LeaderboardEntry = {
  rank: number;
  wallet: string;
  xp: number;
};

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const rpc = createSolanaRpc(env.RPC_URL);
  const programAddress = address(env.PROGRAM_ID);
  const configPda = await getConfigPda(programAddress);
  const maybe = await fetchMaybeConfig(
    rpc as Parameters<typeof fetchMaybeConfig>[0],
    configPda,
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
    tokenAccountAddresses,
  );

  const results = encodedAccounts.map((encoded, i) => {
    const acc = accounts[i];
    if (!acc) return null;
    const xp = Number(acc.amount);
    const decoded = decodeToken(encoded);
    if (!decoded.exists) {
      return { wallet: "Unknown", xp };
    }
    return { wallet: decoded.data.owner as string, xp };
  });

  return results
    .filter((r): r is { wallet: string; xp: number } => r !== null)
    .map((r, i) => ({
      rank: i + 1,
      wallet: r.wallet,
      xp: r.xp,
    }));
}
