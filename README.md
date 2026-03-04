# Superteam Academy

Superteam Academy is a Solana-native learning platform with:
- a Next.js learner app (`app/`)
- a Hono backend for authenticated on-chain actions (`backend/`)
- an Anchor program (`onchain-academy/`)
- a generated TypeScript SDK (`sdk/`)
- a Sanity Studio CMS (`studio-lms/`)

## Documentation Index

- [ARCHITECTURE.md](./ARCHITECTURE.md) — system architecture, components, data flow, and service interfaces
- [CMS_GUIDE.md](./CMS_GUIDE.md) — course/content authoring and publishing workflow
- [CUSTOMIZATION.md](./CUSTOMIZATION.md) — theme, localization, and gamification extension guide

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui |
| Wallet + Solana Client | `@solana/connector`, `@solana/kit` |
| On-chain SDK | `@superteam/academy-sdk` (Codama-generated from Anchor IDL) |
| Backend API | Hono + Node + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Program | Anchor (Rust) |
| CMS | Sanity Studio |

## Monorepo Layout

```text
superteam-academy/
├── app/               # Next.js app
├── backend/           # Hono API, DB, on-chain orchestration
├── onchain-academy/   # Anchor program + tests/scripts
├── sdk/               # Generated TS SDK used by app/backend
├── studio-lms/        # Sanity Studio content backend
├── docs/              # Legacy specs and supporting docs
└── scripts/           # Repository scripts (program id updates, etc.)
```

## Prerequisites

- Node.js 22+
- pnpm 9+
- PostgreSQL 14+
- Solana/Anchor toolchain (for on-chain development and SDK regeneration)

## Local Development

1. Install dependencies at repo root:

```bash
pnpm install
```

2. Create environment files:

```bash
cp app/.env.example app/.env.local
cp backend/.env.example backend/.env
```

3. Start backend:

```bash
pnpm run dev:backend
```

4. Start app (new terminal):

```bash
pnpm -C app dev
```

5. Optional: run Sanity Studio for content editing:

```bash
pnpm -C studio-lms dev
```

App defaults to `http://localhost:3000`, backend to `http://localhost:3001`.

## Environment Variables

### `app/.env.local`

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SOLANA_NETWORK` | Yes | `mainnet`, `mainnet-beta`, `devnet`, `testnet`, or `localnet` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | No | Explicit RPC URL override |
| `NEXT_PUBLIC_ACADEMY_API_URL` | Yes | Backend base URL |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog host (`https://us.i.posthog.com` or EU host) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | No | Sanity project ID (defaults to `4ko8hobj`) |
| `NEXT_PUBLIC_SANITY_DATASET` | No | Sanity dataset (defaults to `production`) |

### `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | API port (default `3001`) |
| `CORS_ORIGIN` | Yes | One or more comma-separated frontend origins |
| `AUTH_DOMAIN` | Yes | SIWS domain |
| `AUTH_URI` | Yes | SIWS URI |
| `AUTH_CHAIN_ID` | Yes | SIWS chain id (example: `solana:devnet`) |
| `PISTON_EXECUTE_URL` | Yes | Remote code execution API URL |
| `RPC_URL` | Yes | Solana RPC endpoint |
| `RPC_WS_URL` | No | Solana websocket endpoint (derived from `RPC_URL` when omitted) |
| `PROGRAM_ID` | Yes | On-chain academy program id |
| `BACKEND_SIGNER_KEYPAIR` | Yes | Base64 secret key for backend signer |
| `AUTHORITY_KEYPAIR` | No | Required by admin scripts (e.g. `create-course`) |
| `TRACK_COLLECTION` | No | Default track collection for credential operations |
| `CREDENTIAL_METADATA_URI` | No | Default metadata URI used for credential issuance |
| `CREDENTIAL_NAME` | No | Default credential name |

## Build and Run

### App

```bash
pnpm run build:app
pnpm run start:app
```

### Backend

```bash
pnpm run build:backend
pnpm run start:backend
```

### Full Build (SDK + App)

```bash
pnpm run build
```

## Program ID and SDK Sync

Client app and backend consume program addresses/instructions from `@superteam/academy-sdk`.

When you change/redeploy the on-chain program ID:

1. Update program + Anchor config:

```bash
./scripts/update-program-id.sh
```

2. Rebuild SDK from fresh IDL:

```bash
pnpm run build:sdk
```

Skipping SDK rebuild can leave app/backend pointed at stale program metadata.

## Deployment

### Backend (Railway)

- Railway is configured to build from `Dockerfile.backend`.
- Backend service config is `backend/railway.toml`.
- In Railway service settings, set config path to `backend/railway.toml`.
- Ensure production env vars are set (especially DB/RPC/program/signer).

### App

- Deploy `app/` as a Next.js service (for example, Vercel).
- Set all `NEXT_PUBLIC_*` runtime variables.
- Set `NEXT_PUBLIC_ACADEMY_API_URL` to deployed backend URL.

### Sanity Studio

- Deploy with `pnpm -C studio-lms deploy`.
- Keep project/dataset aligned with app-side Sanity env vars.

## Notes

- App and backend enforce env validation with Zod and fail fast on invalid config.
- Wallet integration is Connector Kit based (`@solana/connector`), and Solana client operations use `@solana/kit`.
- New UI primitives should be added via shadcn CLI (`pnpm exec shadcn add <component>` from `app/`).
