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
- `src/config/resume.ts` — three hand-curated blocks, all settled with Ali directly:
  - **Skills** (Engines & Tools / Languages / Platforms), settled 2026-08-23 (#39). **Don't add or
    remove an entry without asking** — it's a depth claim, not a capability list, and every current
    entry and omission traces to a direct decision from Ali, not inference.
  - **`resumeSummary`**, settled 2026-08-26 (#32). Three sentences, **`/resume/full` only**.
  - **`resumeLocation`**, settled 2026-08-26 (#32). The header's region line, on both variants. It
    replaced the per-entry location lines on the one-pager rather than joining them — see the
    supersession note in CLAUDE.md's Phase 4 section, which used to say "no home address at all".
  - **`resumePersonalProjects`**, settled 2026-08-26 (#32). Three entries, **`/resume/full` only**.
    Hand-curated rather than derived from the `projects` collection, because the achievements live
    in those files' prose bodies and there is no `award` field. Game Over Ever After was a fourth
    and Ali cut it; the file records why, and why not to restore it.

**A bullet is `{ label, text, extended? }`, not a string** (2026-08-26, #32). It renders as
**`Label:`** plus a clipped formal clause, which is how Ali's own 2019 resume was built. The label is
capped at 28 characters by the schema so it stays a topic rather than growing into a sentence. For
how the words should sound, the `write-copy` skill's §2.1 is the authority; this file only says where
they live.

**Labels are title case** (2026-08-26, #32). `write-copy` §2.1 carries the reasoning and the
AP/Chicago rules.

**Second Dinner renders as grouped blocks, and which tier renders on which density is not
symmetric.** `bulletGroups` gives a job a heading per body of work. The group's `label` and `intro`
render on **both** densities; its `dates` render on `/resume/full` only. The practical consequence,
which already changed a decision: **a group `intro` is not a free place to park a two-pager fact.**
Marvel Snap's sits at four characters of headroom, so anything appended to it costs a one-pager
line. When something belongs to the long version only, the mechanism is a `highlightsExtended`
bullet. Full rationale in CLAUDE.md's "Second Dinner renders as grouped blocks".

**`extended` is a continuation, not an override.** It is appended to `text` on `/resume/full` and in
`docs/LINKEDIN.md`, and omitted on the one-pager. Reach for it when one topic wants a short form on
the one-pager and a fuller one on the two-pager — Kaneva's UI programming bullet and Firefall's are
the two that exist. **Never add a field that _replaces_ `highlights` for the concise variant**; that
is the two-lists shape `highlightsExtended` exists to rule out, and it reintroduces the drift the
whole content model is built against. If the short and long forms would say different things rather
than one saying more, write two bullets.

## 2. Sourcing a new bullet

**Never invent a fact.** If the source material doesn't say what something was built in, ask rather
than produce a plausible sentence — same rule as the `write-project-page` skill. Good sources, in
order:

1. Ask the user directly — the richest source for anything from 2019 onward.
2. An existing project write-up (`src/content/projects/`), if one covers the same work.
3. The job file's "Source material (2019 resume, verbatim)" section — but read the weighting note
   below before leaning on this one.

**Read the matching project page before concluding a job has no more material.** A job file's
`highlights` are a compression of its project page, and **compressions lose things silently** — the
same reason a page is worth reading against its own sources rather than on its own. It paid three
times in one #32 session: the card credits feature, the CJK/Thai font work, and the Unity Editor tooling
were all written up on `src/content/projects/marvel-snap.md` and had reached **no version** of the
resume. A job file's `highlights` are a compression of the project page, and compressions lose
things silently. When you add such a fact, check whether it should flow the other way too -- the
language count went onto both, since the project page had no number either.

**A number that is also her scope beats a bigger number that isn't.** Ali's instinct on this was
right and it generalises. Award wins and download counts are scale attached to nothing she did; "15
languages" is scale attached to the thing she owned end to end, and it reads as a competency and a
quantified outcome in the same clause. Reach for the second kind first. If a credential belongs to
the product rather than to Ali, it can still go on -- but **name its subject** ("Marvel Snap won Best
Mobile Game…"), against the register's usual subject-dropping, or a bare "Won Best Mobile Game"
reads as a personal award.

**The 2019-resume source material is richest for the oldest jobs and thinnest for the most important
one (Second Dinner).** Writing bullets straight from it produces a resume weighted backwards. Prefer
first-person interview material or an existing write-up over the stale verbatim bullet.

**For how a bullet should _read_ — the résumé register, and what to avoid — use the `write-copy`
skill.** This skill covers where bullets live, how they're sourced, and what to regenerate; that one
covers the words. Résumé register is labelled, verb-first, subject dropped, no contractions and no
exclamations, and it is deliberately different from the site's prose voice. `write-copy` §2.1 is the
authority on the labelled format.

**Craft, not product, for anything from the 2024–present Second Dinner era.** Godot, "a new team at
Second Dinner", and nothing else — no title, genre, feature, or monetization detail; "mobile" is
sayable on Ali's own statement (2026-08-26, #32). Read CLAUDE.md's Phase 3 gate outcome if this
ceiling is unfamiliar.

## 3. Fitting the budget: per-job floor, recency-weighted

A job carries a **1-bullet floor in `highlights`** and a **2-bullet floor across `highlights` +
`highlightsExtended` combined**. Space above the floor is weighted toward recency — a more recent job
earns more detail before an older one does.

### Measure headroom before writing, not after

```bash
npm run build && npm run resume:headroom
```

It prints, per bullet, how many printed lines it occupies **and how many more characters its last
line can take before it wraps**. That second number is the one that governs a wording edit, and it
is not guessable: during #32 a language count went into the Localization bullet for free (62
characters of headroom), a phrase naming who used a tool fit where the spelled-out version did not
(7), and title-casing fifteen labels cost zero height at all.

`--try 'Label=candidate text'` measures a candidate **without editing a file**, repeatable for
comparing several. Use it before you commit to wording -- three of the five candidate phrasings
tried in #32 wrapped, and the winner was picked on measured headroom rather than on which read best
in isolation.

**Headroom is why the slack does not convert to type size.** Several bullets sit at 2--5 characters,
so they all wrap together on any size increase: the density curve is a cliff, not a slope, and it is
a property of the current wording rather than of the type. Keep about two lines of document slack in
reserve for the same reason -- with four bullets one word from a wrap, an edit you did not plan for
can cost a line.

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

> **Runs anywhere now.** Paper is set in self-hosted faces (Public Sans, and Gabarito for the
> name — #191, #235), so the PDFs no longer depend on the machine that renders them. The older
> warning here about `system-ui` resolving to SF Pro or DejaVu Sans described the state before
> #191; CLAUDE.md's "Working here" has the current rules, including that a Claude Code web session
> can regenerate. Two things still hold: `npm run build` writes both PDFs _before_ it asserts page
> counts, so `git status` after a failed run; and `npm run build:linkedin` has no font dependency.

Any change to a job's `highlights` / `highlightsExtended` / `roles` / dates, or to `resumeTools`,
touches five files. **Run the pipeline in this order and commit all of it together** — a partial
regen fails `npm run verify` and, worse, can ship a stale PDF next to correct HTML:

```bash
npm run build                # regenerates public/resume.pdf, public/resume-full.pdf, scripts/resume-pdf.lock.json
npm run check:resume-print   # diffs rendered element geometry against the committed baseline
```

**The budget is 960px on page 1 and 912px on every page after it** (#235). Pages after the first
carry a 1in top margin for the running header — the name and "Page 2 of 2" — so
`npm run resume:headroom` reads the two-pager against 1872, not 1920. And the two-pager breaks
before MobilityWare, because a job never splits across pages: page 1 is the header, Summary, Skills
and the whole Second Dinner entry. If that entry ever grows past a page it will split inside itself,
which is the case to watch when adding to it.

**To see the printed page on screen with its real breaks before regenerating anything**, build the
sheet from the design-switcher skill's `references/resume-paper-sheet/`. It is a template, not a
route in the repo, for the reason recorded there; it takes a few minutes to stand up and shows
exactly what `build:pdf` will print.

If the differ reports changes, read them — they should match what you actually changed (new bullets
appearing, trimmed ones disappearing) and nothing else. If everything reported is expected:

```bash
npm run update:resume-print  # rewrites scripts/resume-print-baseline.json
```

If the differ reports something you _didn't_ intend to change, stop — that's a layout regression, not
a baseline update to wave through.

**Since the density toggle (both densities in one DOM, full-only nodes hidden by
`data-full-only`), every resume edit renumbers paths on BOTH routes.** The baseline's
`nth-of-type` counts hidden siblings, so adding a `highlightsExtended` bullet shifts the
one-pager's visible `li` paths too. Expect noisier `--update` diffs than the edit alone suggests;
what matters is that the _values_ (y/height especially) of visible rows didn't move, not that
paths were renamed.

**A row with `"hidden": true` is the root of a subtree the print block, or the concise density,
hides (#330).** It asserts only that it is still hidden — no geometry, no colour — and its
descendants are not captured at all. So a full-only bullet reads as one hidden row on `/resume`
and a full set of rendered rows on `/resume/full`, and a `display: none → rendered` diff on one of
those rows means something that should never reach paper just did.

**Two signatures worth being able to read, because both look alarming and neither is:**

- **All `rect`, heights identical, widths changed.** A casing or single-word edit that reflowed
  nothing. Title-casing fifteen labels produced exactly this: 25 changes, every one width-only.
- **A handful of `rect` ratios like 0.5, 0.33 or 2.0 in one list.** Almost always **selector shift,
  not reflow.** The baseline keys on `li:nth-of-type(N)`, so inserting a bullet mid-list renumbers
  every sibling under it and the differ compares a 1-line bullet against whatever used to hold that
  position. **Do not read those ratios as a rewrap** — confirm with per-bullet line counts from
  `npm run resume:headroom` instead, which is keyed by label and immune to the renumbering.

Conversely, a genuine reflow shows as a height ratio near 1.5 or 2.0 on the element you actually
edited, and a pure leading change shows as _every_ height scaling by the same small factor with no
element rewrapping.

**It renders at 701px (paper width) as of 2026-08-26 (#32).** Before that it used Playwright's
default 1280px while emulating print media, which is print CSS at a screen width — a combination that
exists on no sheet of paper. Colour, font and weight leaks are width-independent so it still caught
everything #35 built it for, but reflow is not: trimming a bullet from three printed lines to two
moved **zero** elements in the old setup, and 92 in the fixed one. If you ever measure this document
by hand, measure it at 701px too.

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
cannot fix itself — a partial commit here is a broken deploy, not a lint warning. `check:pdf` also
asserts the embedded print face (`assertPrintFace` in `scripts/build-pdf.mjs`, Public Sans and
static Gabarito, no Type 3), so a `check:pdf` failure after anything font-related is that check, not
staleness.

## 5. Guardrails that will bite silently otherwise

- **The page-count assertion only catches an overflow, not a leak smaller than a full page.** 19pt of
  silent reflow shipped once before the print-geometry differ existed (issue #35) — that's what step
  4's differ is for. Don't skip it just because the page count still passes.
- **The one-pager's slack is real but finite, and the number must be measured at print width.**
  It renders 928px into a 960px box (measured 2026-08-26, #32, after that pass spent its slack on
  content). That is ~32px, under two bullet lines — and **re-measure with `npm run resume:headroom`
  rather than trusting that number**, which is the whole point of this bullet: the scaled-set table
  in `resume.css` sat stale through several commits and was wrong in the unsafe direction, and the
  figure quoted here has already been wrong twice for the same reason.
  **Measure at a 701px viewport** — letter's 8.5in less
  `@page`'s 0.6in side margins, times 96 — against a 960px height budget (11in less the 0.5in top and
  bottom margins). At Playwright's default 1280px the prose wraps to far fewer lines, which
  under-reported the height by ~200px during #32 and briefly produced the opposite conclusion: that
  the document had 2.3 inches to spare and the type could grow. It could not, at the time.
  `src/styles/resume.css`'s density comment carries the full scaled-set table, why the leading
  moved to 1.35 and the type size did not, and why 9.4pt is not too small (point size measures the
  em box, not the letters; this stack's x-height makes it read as ~10.7pt Times).
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
