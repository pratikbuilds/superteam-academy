import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_SOLANA_NETWORK: z
    .enum(["mainnet", "devnet", "testnet"])
    .default("devnet"),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
});

const clientEnv = {
  NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
};

const parsed = clientSchema.safeParse(clientEnv);

if (!parsed.success) {
  const pretty = z.prettifyError(parsed.error);
  console.error("Invalid environment variables:\n", pretty);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
export type Env = z.infer<typeof clientSchema>;
