import { ProgramError } from "../program";

const U64_MAX = 18_446_744_073_709_551_615n;

export function parseU64OrThrow(value: string | number): bigint {
  if (typeof value === "number" && !Number.isSafeInteger(value)) {
    throw new ProgramError(
      "TOTAL_XP_UNSAFE_INTEGER",
      400,
      "totalXp must be a string when above Number.MAX_SAFE_INTEGER"
    );
  }
  const asBigInt = typeof value === "number" ? BigInt(value) : BigInt(value);
  if (asBigInt < 0n || asBigInt > U64_MAX) {
    throw new ProgramError("TOTAL_XP_OUT_OF_RANGE", 400);
  }
  return asBigInt;
}
