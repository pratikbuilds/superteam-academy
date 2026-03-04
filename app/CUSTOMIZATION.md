# Customization Guide

This guide covers three extension areas:
- theme customization
- adding languages
- extending gamification

## Theme Customization

Theme tokens and visual system are defined in:
- `app/app/globals.css`

## What exists today

- Light and dark themes are implemented via CSS variables (`:root` and `.dark`).
- Tailwind v4 tokens are mapped through `@theme inline`.
- Typography uses:
  - `Inter Variable` for body
  - `Archivo Variable` for headings
  - `Commit Mono` for code
- Theme toggle uses `next-themes`.

## How to customize safely

1. Update semantic tokens first (`--background`, `--foreground`, `--primary`, etc.) in `globals.css`.
2. Keep contrast stable for both light and dark variants.
3. If adding new semantic colors, map them in the `@theme inline` block.
4. Reuse shadcn component variants before introducing ad-hoc one-off styles.

## Add a new color token example

1. Define variable in `:root` and `.dark`.
2. Map to Tailwind token in `@theme inline`.
3. Consume with utility classes.

## Adding Languages

Localization is powered by `next-intl`.

Key files:
- locale routing: `app/i18n/routing.ts`
- language switcher: `app/components/language-switcher.tsx`
- message files:
  - `app/messages/en.json`
  - `app/messages/es.json`
  - `app/messages/pt-BR.json`

## Current locales

- `en` (default)
- `es`
- `pt-BR`

## Add a new locale

1. Add locale code to `routing.locales` in `app/i18n/routing.ts`.
2. Create `app/messages/<locale>.json` by copying `en.json`.
3. Add UI option in `language-switcher.tsx`:
- include `value` and translation key
4. Add translated label key under `language` namespace in all message files.
5. Validate major routes under `/[locale]/...`.

## Translation quality checks

- Ensure all keys exist in all locale files.
- Keep interpolation placeholders unchanged (example: `{amount}`, `{count}`).
- Avoid changing JSON key names unless all locales are updated together.

## Extending Gamification

Gamification currently combines on-chain and off-chain signals.

On-chain gamification:
- XP minting and balances
- lesson completion bitmap
- course finalization
- credential issuance/upgrades
- achievement receipts

Off-chain gamification:
- profile metadata (username, bio, socials)
- completion records (`completed_enrollments`) for credential context and profile feed
- leaderboard ranking derived from XP mint accounts

Key code paths:
- frontend hooks:
  - `app/lib/hooks/use-xp-balance.ts`
  - `app/lib/hooks/use-enrollment-status.ts`
  - `app/lib/hooks/use-lesson-completion.ts`
- backend read/aggregation:
  - `backend/src/read.ts`
  - `backend/src/leaderboard.ts`
  - `backend/src/routes/profile.ts`
- DB schema:
  - `backend/src/db/schema.ts`

## Practical extension patterns

1. Add new dashboard progression metrics
- derive from existing XP/enrollment/achievement sources
- expose via new read endpoint or compute client-side if cheap

2. Add streak/reward mechanics
- short term: off-chain streak computation and display
- long term: add on-chain reward instruction + SDK regeneration

3. Add tiered badges
- introduce new achievement types and awarding criteria
- expose metadata in profile and dashboard views

4. Add track-specific progression
- aggregate `completed_enrollments` by `trackId` and `trackLevel`
- display progress and unlock milestones per track

## If on-chain behavior changes

When adding/changing gamification instructions in the Anchor program:

1. update on-chain code in `onchain-academy/`
2. rebuild SDK:

```bash
pnpm run build:sdk
```

3. update backend/app integration to consume new generated instruction/account types
4. update docs and env defaults if new config is required

## Guardrails

- Keep wallet/on-chain integration on `@solana/connector` + `@solana/kit`.
- Keep env access through validated `env` modules.
- Add new UI primitives via shadcn CLI from `app/`.
- Treat `course.slug` and on-chain `course_id` as immutable linkage once live.
