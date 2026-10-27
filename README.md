# Learnix

An explainable, steerable course recommender for degree-program advising, built around a
content-based, multi-criteria recommendation algorithm: courses are scored against a student's
career-goal skill profile, weighted by five adjustable signals, and every score decomposes into
plain-language reasons. Built with Next.js 16 (App Router), TypeScript, Tailwind v4, Prisma +
PostgreSQL, and Auth.js (NextAuth v5).

## Setup

```bash
pnpm install
cp .env.example .env          # fill in DATABASE_URL, DIRECT_URL and AUTH_SECRET
pnpm db:migrate                # applies the schema to your Postgres database
pnpm db:seed                   # seeds careers, courses, instructors, reviews and a demo account
pnpm dev
```

Open http://localhost:3000. The landing page is public; everything else requires signing in,
enforced by `proxy.ts`.

**Demo account:** `demo@learnix.app` / `learnix-demo` — or create your own at `/signup`.

### Database

Learnix targets PostgreSQL (not SQLite) so it survives redeploys on serverless hosts. Any
Postgres works — Neon, Supabase and Vercel Postgres all have a free tier that's enough for this
project. You need two connection strings in `.env`:

- `DATABASE_URL` — a **pooled** connection (e.g. Supabase's "Transaction pooler", port 6543),
  used by the running app.
- `DIRECT_URL` — a **direct** connection (port 5432), used only by `prisma migrate`, since
  connection poolers don't support the prepared statements migrations rely on.

This project uses `pnpm`, not `npm` — the npm CLI's dependency resolver crashes on this repo's
transitive optional dependencies (a known npm/arborist bug). `pnpm install` does not hit it.

## Scripts

- `pnpm dev` / `pnpm build` / `pnpm start` — Next.js dev, build, and production server
- `pnpm test` — scoring-engine unit tests (Vitest)
- `pnpm lint` — ESLint
- `pnpm db:migrate` — apply Prisma migrations
- `pnpm db:seed` — seed careers, catalogue and the demo account
- `pnpm db:studio` — Prisma Studio, a GUI over the database

## How recommendations work

Learnix is a **content-based, multi-criteria recommender**. Every course carries a skill vector
across five axes (machine learning, statistics, systems, algorithms, engineering practice); every
career target carries the same. A course's match for a student is:

1. **Subscores** (0–99 each), computed live from the student's actual profile — not pre-baked:
   - `goals` — similarity between the course's skill vector and the career target (a weighted
     cosine-style match), plus a small bonus if a stated interest appears in the course title or
     description.
   - `gap` — weights that same similarity by how far the student's *current* skills (derived
     only from confirmed transcript courses — no invented baseline) fall short of the target, so
     a course that closes a bigger, more-numerous gap scores higher than one that repeats a skill
     the student already has.
   - `history` — a base score, halved if a prerequisite the catalogue can check hasn't been
     confirmed.
   - `schedule` — a base score, discounted if the course alone would eat an outsized share of
     the student's weekly time budget.
   - `cost` — a fixed credit-value score.
2. **Weighted match %** — `Σ(subscore × weight) / Σweight`, weights normalised on every read so a
   student's sliders never need to sum to 100. Bands: ≥85 "Great fit", ≥72 "Good fit", else
   "Okay fit".
3. **Explanation** — the top-scoring signals map to plain-language reasons, shown as the
   course's "why it fits you" text everywhere it appears.
4. **Exclusion and conflicts** — hidden courses and courses on a declared unavailable day are
   removed *before* ranking, not scored low. Saved courses are checked pairwise for day/time
   overlap.

See `lib/scoring/` — pure functions, no React, fully unit-tested (`lib/scoring/score.test.ts`).
`lib/data/path.ts` extends this into a greedy multi-term planner (topological by prerequisite,
packed by credit/hour budget) for the bonus Path screen.

Nothing here is a fixture at runtime: courses, careers, instructors, reviews, transcripts, saved
courses, notifications, degree-requirement progress and GPA are all read from and written to
Postgres via `lib/data/repository.ts` — the one seam between the app and its data.

## Architecture

- `lib/scoring/` — the recommendation engine: skill vectors, subscore formulas, weighted
  ranking, band classification, reason generation, exclusion filters, schedule-conflict
  detection.
- `lib/data/repository.ts` — every read and write, all Prisma-backed. `lib/data/path.ts` and
  `lib/compare.ts` build on top of it for the bonus Compare/Path screens.
- `lib/store/useToastStore.ts` — the one piece of genuinely client-only state (the toast+undo
  pattern); everything else (career, interests, weights, saved, hidden, read, settings) is
  persisted server-side per student.
- `auth.ts` / `lib/auth.config.ts` / `proxy.ts` — Auth.js v5 with a Credentials provider over
  Prisma; `auth.config.ts` is the edge-safe half used by the proxy (route protection).
- `prisma/schema.prisma` — the full relational schema (User, Profile, WeightsProfile, Career,
  Course, Instructor, Review, ProgramRequirement, TranscriptEntry, SavedCourse, HiddenCourse,
  Notification). Degree-requirement progress and GPA are deliberately **not** stored — they're
  derived at query time from the transcript, so they can never go stale or be hand-edited.
- `app/(app)/` — the authenticated app shell (top nav, all nine screens plus the bonus Compare
  and Path screens), gated by both `proxy.ts` (redirect at the edge) and the group's own
  `layout.tsx`.
- `app/onboarding/` — the four-step wizard, deliberately outside the app shell (full-screen, no
  nav) so nothing distracts from it.
- `app/(auth)/` — login, signup, logout.
- `app/page.tsx` — the public landing page.

## Design system

Desktop-first, built from the Learnix design handoff (see `design_handoff_learnix/README.md` for
the full visual/behavioural spec) — the "Salt & pepper + Gothic noir" palette (`#F5F4F1` salt
background through `#7A1F2B` oxblood accent), Archivo for headings/body and Space Mono for small
uppercase labels, 28px tile radius with pill (999px) buttons/chips/toasts, and a dot-grid brand
texture. Tokens live in `app/globals.css` as a Tailwind v4 `@theme` layer. Entrance and ambient
motion use Framer Motion (`components/ui/Reveal.tsx`), respect `prefers-reduced-motion`, and
never hide content if a script fails to load.

## Deployment

Any Next.js host works; Vercel is the path of least resistance:

1. Provision a Postgres database (Neon, Supabase, or Vercel Postgres) and grab its pooled +
   direct connection strings.
2. Set `DATABASE_URL`, `DIRECT_URL` and `AUTH_SECRET` (`npx auth secret`) as environment
   variables on the host.
3. Run `pnpm db:migrate` and `pnpm db:seed` once against that database (locally, pointed at the
   production `DATABASE_URL`/`DIRECT_URL`, or via the host's build step).
4. Deploy. `pnpm build` / `pnpm start` are the standard Next.js production commands.
