# Superteam Academy Architecture

## System Overview

Superteam Academy is a multi-service system with five core parts:

1. `app/` (Next.js learner UI)
2. `backend/` (Hono API for auth, reads, profile, and on-chain write orchestration)
3. `onchain-academy/` (Anchor program)
4. `sdk/` (generated TS SDK consumed by app/backend)
5. `studio-lms/` (Sanity CMS for course and lesson content)

At runtime:
- UI content comes from Sanity.
- Learning state, XP, and credentials are on Solana.
- Sensitive write actions (lesson completion/finalization/credential ops) are backend-mediated with SIWS verification.
- Supplemental profile/completion metadata is stored in PostgreSQL.

## Component Structure

## `app/` (Frontend)

Primary responsibilities:
- render catalog/course/lesson/profile/dashboard/leaderboard UI
- connect wallets with Connector Kit
- submit learner-signed enrollment transactions directly on-chain
- call backend APIs for SIWS-authenticated flows and read APIs

Key modules:
- `app/components/providers.tsx`: wallet/network provider setup
- `app/lib/env.ts`: frontend env schema validation
- `app/lib/academy/*`: Solana interaction helpers
- `app/lib/api/academy.ts`: backend API client
- `app/lib/sanity/*`: CMS client/queries/mappers
- `app/lib/hooks/*`: XP/enrollment/completion hooks

## `backend/` (API + Orchestration)

Primary responsibilities:
- issue/verify SIWS challenges
- execute backend-signed on-chain instructions
- expose read APIs for config/courses/enrollment/xp
- manage leaderboard/profile/completion metadata
- proxy code execution tests to configured execution service

Key modules:
- `backend/src/app.ts`: route wiring and CORS
- `backend/src/auth.ts`: nonce challenge + SIWS verification
- `backend/src/program.ts`: on-chain instruction builders/submission
- `backend/src/read.ts`: chain reads and credential parameter derivation
- `backend/src/routes/*`: route handlers by domain
- `backend/src/db/*`: Drizzle schema + DB access

## `onchain-academy/` (Program)

Primary responsibilities:
- enforce enrollment and progress rules
- mint XP rewards
- finalize course completion
- issue/upgrade credentials
- support minter and achievement flows

The program is surfaced in client code through generated SDK APIs (`@superteam/academy-sdk`).

## `sdk/` (Generated client)

Primary responsibilities:
- PDA derivation helpers
- typed fetch/decode utilities for accounts
- typed instruction constructors
- canonical program address exports (including `ONCHAIN_ACADEMY_PROGRAM_ADDRESS`)

## `studio-lms/` (CMS)

Primary responsibilities:
- manage course documents, modules, and lessons
- keep `course.slug` synchronized with on-chain `course_id`
- publish course content consumed by app queries

## Data Flow

## 1. Course Discovery

1. Editor publishes content in Sanity (`course`, `module`, `contentLesson`, `challengeLesson`).
2. App fetches content using `app/lib/sanity/queries.ts`.
3. App maps CMS shape to UI model in `app/lib/sanity/mappers.ts`.

## 2. Enrollment Flow

1. User connects wallet in app.
2. App builds `enroll` instruction using SDK helpers (`getEnrollInstructionAsync`).
3. User signs transaction client-side and submits to Solana RPC.
4. Enrollment PDA becomes source of truth for learner progress state.

## 3. Lesson Completion Flow (Backend-mediated)

1. App requests SIWS challenge: `POST /auth/create-signin-data`.
2. User signs SIWS message with wallet.
3. App submits signature + intent to `POST /complete-lesson`.
4. Backend verifies nonce/signature/intent and calls `completeLessonOnChain`.
5. Program updates lesson bitmap and mints XP.

## 4. Finalize + Credential Flow

1. App completes SIWS auth for `finalize-course` and calls `POST /finalize-course`.
2. Backend submits `finalizeCourse` on-chain, then stores completion row in DB.
3. App fetches credential params from `GET /credential-params`.
4. App executes SIWS-authenticated `POST /issue-credential` or `POST /upgrade-credential`.
5. Backend records resulting `credentialAsset` in `completed_enrollments`.

## 5. Profile/Leaderboard/Achievement Flow

1. Profiles are stored in PostgreSQL (`profiles`).
2. Public profile queries resolve by wallet or username.
3. Leaderboard is read from Token-2022 largest accounts on XP mint.
4. Achievements are discovered from chain accounts and receipts.

## Service Interfaces

## Backend HTTP Interfaces

Auth:
- `POST /auth/create-signin-data`
- `POST /auth/verify`

Learner actions:
- `POST /complete-lesson`
- `POST /finalize-course`
- `POST /issue-credential`
- `POST /upgrade-credential`

Read endpoints:
- `GET /config`
- `GET /courses`
- `GET /courses/:courseId`
- `GET /courses/:courseId/enrollment?learner=<wallet>`
- `GET /xp-balance?learner=<wallet>`
- `GET /credential-params?learner=<wallet>`

Community/profile:
- `GET /leaderboard`
- `GET /profile/me?learner=<wallet>`
- `PUT /profile`
- `GET /profile/by-wallet/:wallet`
- `GET /profile/by-username/:username`
- `GET /profile/:walletOrUsername/completed-courses`
- `GET /profile/:walletOrUsername/credentials`
- `GET /profile/:walletOrUsername/achievements`
- `GET /certificates/:assetId`

Execution:
- `POST /execute-code`

## On-chain Integration Points

The app/backend integrate with on-chain state through `@superteam/academy-sdk` and `@solana/kit`.

Common account access patterns:
- `getConfigPda`, `fetchMaybeConfig`
- `getCoursePda`, `fetchMaybeCourse`
- `getEnrollmentPda`, `fetchMaybeEnrollment`
- `getXpAta`

Instruction builders used in codebase include:
- learner path: `getEnrollInstructionAsync`
- backend path: `getCompleteLessonInstructionAsync`, `getFinalizeCourseInstructionAsync`, `getIssueCredentialInstructionAsync`, `getUpgradeCredentialInstructionAsync`

## Off-chain Data Models

`profiles`:
- wallet identity and public metadata (`username`, bio, socials, visibility)

`completed_enrollments`:
- completion history used for credential metadata and profile surfaces
- stores optional credential asset id after issuance

## Deployment Topology

Typical production topology:
- Next.js app deployment (frontend)
- Railway backend deployment built from `Dockerfile.backend`
- managed Postgres
- Solana RPC provider (for example Helius or public cluster endpoints)
- Sanity hosted dataset

## Operational Notes

- Env values are validated at process startup in both app and backend.
- Program ID drift is avoided by regenerating SDK after program ID changes.
- SIWS nonces are single-use and expiring, reducing replay risk for backend-mediated actions.
