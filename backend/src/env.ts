import { z } from "zod";

const backendSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  AUTH_DOMAIN: z.string().min(1).default("localhost"),
  AUTH_URI: z.url().default("http://localhost:3000"),
  AUTH_CHAIN_ID: z.string().min(1).default("solana:devnet"),
  RPC_URL: z.url(),
  PROGRAM_ID: z.string().min(32),
  BACKEND_SIGNER_KEYPAIR: z.string().min(1),
  AUTHORITY_KEYPAIR: z.string().min(1).optional(),
});

const parsed = backendSchema.safeParse({
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  AUTH_DOMAIN: process.env.AUTH_DOMAIN,
  AUTH_URI: process.env.AUTH_URI,
  AUTH_CHAIN_ID: process.env.AUTH_CHAIN_ID,
  RPC_URL: process.env.RPC_URL,
  PROGRAM_ID: process.env.PROGRAM_ID,
  BACKEND_SIGNER_KEYPAIR: process.env.BACKEND_SIGNER_KEYPAIR,
  AUTHORITY_KEYPAIR: process.env.AUTHORITY_KEYPAIR,
});

if (!parsed.success) {
  const pretty = z.prettifyError(parsed.error);
  console.error("Invalid backend environment variables:\n", pretty);
  throw new Error("Invalid backend environment variables");
}

export const env = parsed.data;
export type Env = z.infer<typeof backendSchema>;
