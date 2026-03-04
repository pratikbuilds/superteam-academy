# CMS Guide

This guide explains how to create and maintain academy content in `studio-lms/`.

## CMS Stack

- Studio app: `studio-lms/` (Sanity Studio)
- Project config: `studio-lms/sanity.config.ts`
- Schema entrypoint: `studio-lms/schemaTypes/index.ts`

## Content Schema

Core document and object types:

- `course` (document)
- `module` (object)
- `contentLesson` (object)
- `challengeLesson` (object)
- `testCase` (object)
- `creator` (object, currently optional/future-facing)

## Course Model (`course`)

Important fields:
- `slug` (required): must match the on-chain `course_id`
- `title`, `description`, `shortDescription` (required)
- `thumbnail` (image)
- `trackId` (required enum):
  - `solana-fundamentals`
  - `anchor-development`
  - `defi-on-solana`
- `difficulty` (required enum 1-3)
- `modules` (required array, min 1)
- `xpReward` (required)
- `prerequisiteSlug` (optional)
- `isActive` (boolean)
- `tags` (string tags)

## Lesson Models

`contentLesson`:
- `id`, `title`, `duration`, `xp`, `body` required
- `body` is markdown text
- optional `videoUrl`

`challengeLesson`:
- `id`, `title`, `duration`, `xp`, `prompt`, `starterCode`, `language`, `testCases` required
- `language` is `rust` or `typescript`
- `testCases` are `{ input, expectedOutput, label }`

## Local Studio Development

1. Install dependencies:

```bash
pnpm install
```

2. Start studio:

```bash
pnpm -C studio-lms dev
```

3. Open the local Studio URL shown in terminal (usually `http://localhost:3333`).

## Course Authoring Workflow

1. Create or open a `course` document.
2. Set `slug.current` to exact on-chain course ID.
3. Add metadata (`title`, descriptions, track, difficulty, tags, image).
4. Build module list (`modules[]`), each with unique `id` and ordered lessons.
5. Add lesson content:
- for content lessons, write markdown body
- for challenge lessons, add prompt, starter code, language, and test cases
6. Set `isActive=true` only when the course should be visible in catalog.
7. Publish the document.

## Editing Existing Courses

- Preserve stable IDs:
  - `course.slug`
  - `module.id`
  - `lesson.id`
- Avoid changing `slug` once a course is initialized on-chain.
- Reordering lessons changes lesson index expectations; coordinate with on-chain setup.
- If lesson count changes, ensure on-chain `lesson_count` for that course is aligned.

## Publishing Workflow

Sanity supports draft and published states:

1. Edit draft content in Studio.
2. Use preview in Studio where needed.
3. Publish when ready.
4. App queries fetch published documents by default.

Recommended release practice:
- publish during low-traffic windows
- validate affected course pages in app after publish
- verify challenge lesson fields and test case rendering

## App Integration Contract

The app reads CMS content from:
- `app/lib/sanity/queries.ts`
- `app/lib/sanity/mappers.ts`

Data is transformed into app `Course` types in `app/lib/data/types.ts`.

Contract rules to preserve:
- `slug` must map cleanly to app course `id`
- `modules` and nested `lessons` arrays must be present
- challenge lessons must include `testCases`

## Operational Tips

- Keep markdown concise and use fenced code blocks for commands/snippets.
- Add thumbnails for every course to avoid fallback-only visuals.
- Use tags consistently for better catalog filtering.
- Keep `isActive` false for work-in-progress content.

## Deployment

To deploy Studio:

```bash
pnpm -C studio-lms build
pnpm -C studio-lms deploy
```

Ensure frontend Sanity env (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`) matches deployed Studio data source.
