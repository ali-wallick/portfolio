---
name: update-resume
description: Add, update, or rebalance resume content on aliwallick.com — job bullets, the Skills section, or education. Use when the user wants to add a resume bullet, detail a job's work in more depth, trim or rebalance highlights across jobs to make room for new content, or update the Skills/education sections. Handles the mechanics and the regeneration pipeline; for the settled rationale behind why the resume is built this way, see CLAUDE.md's Phase 4 section instead.
---

# Update resume content

The resume has one source: the `jobs` and `education` content collections. `/resume`, `/resume/full`,
the generated PDFs, and `docs/LINKEDIN.md` all render from it — there is no second place to edit.

**For why the resume is built this way, read CLAUDE.md's "Phase 4 gate outcome" section and its
follow-ups first.** This skill is the how; that section is the why, and duplicating it here would
recreate the two-copies-drift problem the content model exists to prevent.

## 1. The model

- `src/content/jobs/<company>.md` — `highlights` (one-pager) and `highlightsExtended` (appended for
  the two-pager — a strict superset, never a second copy of the same fact worded differently).
- `src/content/education/*.md`
- `src/config/resume.ts` — the Skills section (Engines & Tools / Languages / Platforms). Hand-curated,
  settled 2026-08-23 (#39). **Don't add or remove an entry without asking** — it's a depth claim, not
  a capability list, and every current entry and omission traces to a direct decision from Ali, not
  inference.

## 2. Sourcing a new bullet

**Never invent a fact.** If the source material doesn't say what something was built in, ask rather
than produce a plausible sentence — same rule as the `write-project-page` skill. Good sources, in
order:

1. Ask the user directly — the richest source for anything from 2019 onward.
2. An existing project write-up (`src/content/projects/`), if one covers the same work.
3. The job file's "Source material (2019 resume, verbatim)" section — but read the weighting note
   below before leaning on this one.

**The 2019-resume source material is richest for the oldest jobs and thinnest for the most important
one (Second Dinner).** Writing bullets straight from it produces a resume weighted backwards. Prefer
first-person interview material or an existing write-up over the stale verbatim bullet.

**For how a bullet should _read_ — the résumé register, and what to avoid — use the `write-copy`
skill.** This skill covers where bullets live, how they're sourced, and what to regenerate; that one
covers the words. Résumé register is verb-first, subject dropped, no contractions, no exclamations,
and it is deliberately different from the site's prose voice.

**Craft, not product, for anything from the 2024–present Second Dinner era.** Godot, "the studio's
next team", and nothing else — no title, platform, genre, feature, or monetization detail. Read
CLAUDE.md's Phase 3 gate outcome if this ceiling is unfamiliar.

## 3. Fitting the budget: per-job floor, recency-weighted

A job carries a **1-bullet floor in `highlights`** and a **2-bullet floor across `highlights` +
`highlightsExtended` combined**. Space above the floor is weighted toward recency — a more recent job
earns more detail before an older one does.

When a new bullet needs room on the one-pager:

1. Find the **oldest job that's still above its floor**. That's where the trim comes from — not
   whichever job happens to already be open.
2. Move one of its `highlights` bullets down to `highlightsExtended` (never delete it — the
   two-pager should still carry the fuller record).
3. Don't demote a bullet from the job you're actively adding to just because it's convenient; the
   rule is about the _oldest_ job with slack, not the nearest one to hand.

This is a standing rule, not a one-time cut — apply it every time the budget gets tight, and check
with the user if the "which job" answer isn't obvious (e.g. two jobs tied at the floor).

## 4. The regeneration pipeline

Any change to a job's `highlights` / `highlightsExtended` / `roles` / dates, or to `resumeTools`,
touches five files. **Run the pipeline in this order and commit all of it together** — a partial
regen fails `npm run verify` and, worse, can ship a stale PDF next to correct HTML:

```bash
npm run build                # regenerates public/resume.pdf, public/resume-full.pdf, scripts/resume-pdf.lock.json
npm run check:resume-print   # diffs rendered element geometry against the committed baseline
```

If the differ reports changes, read them — they should match what you actually changed (new bullets
appearing, trimmed ones disappearing) and nothing else. If everything reported is expected:

```bash
npm run update:resume-print  # rewrites scripts/resume-print-baseline.json
```

If the differ reports something you _didn't_ intend to change, stop — that's a layout regression, not
a baseline update to wave through.

Then regenerate LinkedIn, since its content is the same collections rendered differently:

```bash
npm run build:linkedin
```

Finish with the full gate:

```bash
npm run verify
```

**Commit together:** the content file(s), `public/resume.pdf`, `public/resume-full.pdf`,
`scripts/resume-pdf.lock.json`, `scripts/resume-print-baseline.json` (if it changed), and
`docs/LINKEDIN.md`. `npm run check:pdf` hashes every input and fails CI if the PDFs are stale, and it
cannot fix itself — a partial commit here is a broken deploy, not a lint warning.

## 5. Guardrails that will bite silently otherwise

- **The page-count assertion only catches an overflow, not a leak smaller than a full page.** 19pt of
  silent reflow shipped once before the print-geometry differ existed (issue #35) — that's what step
  4's differ is for. Don't skip it just because the page count still passes.
- **If a design token you touch reaches the resume, add it to `src/styles/resume.css`'s
  `@media print` block too.** That block pins paper by redefining tokens, and only covers the ones
  already listed — a new token silently reaches the PDF undefined. This mostly comes up doing design
  work rather than resume-content work, but it's the reason resume changes should always run through
  `check:resume-print` rather than being assumed safe.
- **Pinning a token is not sufficient on its own.** Any selector that outranks a bare `:root` beats
  the print block regardless of the media query — this bit once via a higher-specificity palette
  selector, coloring 28 PDF elements wrong while the page-count assertion saw nothing (colour costs
  no height). If you add palette- or theme-scoped rules to `resume.css`, scope them inside
  `@media screen` so they structurally cannot reach paper.
- **`resumeTools` (`src/config/resume.ts`) is typed as `Record<ResumeToolCategory, string[]>`
  specifically so a miscategorized or new-category tool fails `npm run check` instead of silently
  compiling.** If TypeScript rejects an edit here, that's the guard working — reclassify the entry
  rather than widening the type.

## 6. Verify

```bash
npm run dev
```

Read `/resume` and `/resume/full` in the browser — confirm the new content reads correctly and the
recency weighting looks right (the most recent job should visibly carry the most detail). Then
confirm the PDFs still hold their page counts (`npm run build:pdf` prints this) before reporting done.
