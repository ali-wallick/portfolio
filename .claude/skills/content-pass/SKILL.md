---
name: content-pass
description: Run the per-page content revisit pass on aliwallick.com — one sub-issue of #31 at a time. Use when the user names a content-pass issue, says "let's do the content pass on /projects/X", wants a page compared against its old version on the pre-2026 site, or asks why a page reads thin. Handles the method and the audit; write-copy governs how the resulting sentences sound.
---

# Run a content pass on one page

The per-page pass behind [#31](https://github.com/ali-wallick/Portfolio/issues/31) and its 21
sub-issues. One page per branch, one PR per page.

**This skill is the method. `write-copy` is the voice.** Both apply, and `write-copy` gets read
before a word is written — it carries the measured evidence (17-word mean, zero em dashes) that the
sentences are judged against.

## The thing this skill exists to stop

#31 calls itself "an edit pass, not a re-reporting pass," and that framing is right about **facts**
and misleading about **coverage**. Phase 3 wrote every page by compressing an old page down to a
summary. A tone pass that only reads the current page inherits every compression silently.

On the first page worked ([#97](https://github.com/ali-wallick/Portfolio/issues/97)), the current
copy was clean — 23 words, two sentences, no em dash, well inside Ali's measured baseline. Read on
its own it needed nothing. Read against the old page it had dropped the biblical parable the game is
named for, the two-mode design that was the whole engineering story, and Ali's own note about which
art wasn't hers. **The last one had quietly made a claim broader than the source supported.**

So: **read the old page every time, before deciding the current one is fine.**

## 1. Read the issue, then the issue's comments

The body may be stale. #97's quoted a summary that
[#134](https://github.com/ali-wallick/Portfolio/pull/134) had already rewritten, and only a comment
said so.

```bash
gh issue view <n> --comments
```

Note what the issue puts **out** of scope. Most say "read for tone, length, and voice consistency,
not fact-correctness — Phase 3's facts hold."

## 2. Run the audit

Build first — the audit reads `dist/`, because several checks only work on rendered output.

```bash
SHOW_DRAFTS=true npm run build
node .claude/skills/content-pass/scripts/audit-page.mjs /projects/<slug>
```

It reports four things, each of which was missed by hand at least once:

| Check                          | Why it needs a script                                                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Em dashes in rendered copy** | `role`, `summary`, `caption`, and link `label` are front matter that **renders as visible copy**. A grep of body prose sees none of them. It also attributes each hit back to its source line and key. |
| **Sentence stats on the page** | `copy-stats.mjs` measures the file. This measures what a reader sees, which includes the summary and captions.                                                                                         |
| **The old page's prose**       | Printed in full, so what the summary dropped is visible rather than remembered. Snapshot filenames are the old site's camelCase and don't match slugs, so it fuzzy-matches and prints what it matched. |
| **Unused media**               | The Phase 3 migration moved the whole keep-list into `src/assets/`; only heroes ever got wired up. 9 of 11 archive entries have unused images sitting in the repo right now.                           |

`--all` sweeps every project. Use it to find cross-page patterns, not to batch the pass.

**Two deliberate asymmetries in the script**, so its output isn't confusing:

- **Em dashes are scanned across all of `<main>`; sentence stats exclude the metadata strip and
  backlink.** An em dash in `role` is a real finding, but "Game jam 2011 Unity Georgia Tech" is not
  a sentence and wrecks the mean on a short page.
- **The `<title>` / `og:title` template (`{title} — Ali Wallick`) carries an em dash on all 23
  routes and stays.** It's a structural separator, not prose. It lives outside `<main>`, so it never
  appears in the audit.

## 3. Read the old page for content, not wording

The old prose is 2009–2016 Ali. Don't port its voice. Do ask what it knew that the current page
doesn't:

- **Why is it called that?** Titles frequently carry a fact the summary dropped.
- **What was the actual design or system?** This is what makes an entry interesting rather than a
  credit.
- **What did she say about her own contribution?** Especially any limit she put on it. A Phase 3
  `role` field can be broader than the sentence it was compressed from.
- **What is safe to drop?** Old pages carry control manuals, "click here to play" for dead
  downloads, and second-person instructions. Cut those without ceremony.
- **Is there context only Ali has?** The old page and the blog archive are not the only place a
  fact can live. Prodigal's strongest material — a named Georgia Tech course, built on real
  hardware in C and assembly — was in neither. No amount of re-reading old pages would have
  surfaced it; it only came out once Ali saw the draft and reacted. Don't treat "the sources are
  exhausted" as "the facts are exhausted." If a page still reads generic after the audit and the
  old page, ask her directly before writing final copy.

## 4. Decide the shape before writing

The tiers behave differently, and `src/content.config.ts` is the contract:

- **Featured** — a real write-up, `## What I built` / `## What I learned`. Already exists on all
  five; the pass is editing, not expanding.
- **Archive** — one line, and **optionally a short body plus a `gallery`** where there is material
  worth having. Settled 2026-08-24 via #97. **Permission, not a quota**: an entry with nothing more
  to say stays summary-only, and that is a correct outcome. What preserves the tier is **no
  featured-tier section headings** (`## What I built` / `## What I learned`) — length itself is a
  **guideline, not a hard cap**. It was written as "one paragraph" on the first pass and loosened
  the same day once Ali flagged the case that broke it: she expects to eventually move Kaneva into
  this tier and doesn't want that to mean losing much of its existing detail. The guideline is
  calibrated to what the tier mostly is — early student and jam work that doesn't need much — not a
  ceiling on a richer entry demoted into it later. Prodigal shipped at one short paragraph after two
  rounds of trimming a longer draft — that trend (write more than you'll need, then cut on review)
  is the working reference, not a word count.

**If the shape changes, that is a decision, not an edit.** Stop and get Ali's call, because it sets
a pattern across a tier rather than fixing one page. Then record it in `CLAUDE.md` _and_ in
`content.config.ts`'s tier comment, since a decision recorded in one place drifts.

## 5. Write it

Follow `write-copy`. Then measure both ways — they answer different questions:

```bash
node .claude/skills/write-copy/scripts/copy-stats.mjs src/content/projects/<slug>.md
SHOW_DRAFTS=true npm run build
node .claude/skills/content-pass/scripts/audit-page.mjs /projects/<slug>
```

The audit should come back with **no em dashes** and a mean in the neighbourhood of 17. Under 17 is
fine and common on archive pages, where most of the text describes a game rather than an argument.
A low first-person count on an archive page is also fine and not worth chasing.

**Apostrophes:** Markdown body text gets typographic quotes (`didn’t`); front matter does not
(`didn't`). Both render on the same page, and a caption next to a paragraph shows the difference.
Type the curly apostrophe directly in YAML when the two sit near each other.

## 6. Verify

```bash
npm run verify
```

Two known traps:

- **`npm run verify` may be red before you start.** Prettier scans git worktrees under
  `.claude/worktrees/`, which `.prettierignore` can't reach — tracked in
  [#144](https://github.com/ali-wallick/Portfolio/issues/144). Confirm it fails on a clean tree
  before blaming your branch, and check your own files directly:
  `npx prettier --check <files>`.
- **Touching `src/content.config.ts` invalidates the resume PDFs.** It's one of
  `build-pdf.mjs`'s hashed inputs, so even a comment edit changes `scripts/resume-pdf.lock.json`.
  `npm run build` regenerates them; commit `public/*.pdf` and the lock with your change or
  `npm run check:pdf` fails the deploy.

## 7. Branch, preview, PR

Per `CLAUDE.md`'s review loop. Copy is Ali's, and "it builds" proves nothing about tone.

```bash
git checkout -b content-pass-<slug>
git push -u origin content-pass-<slug>
gh pr create --title "Content pass: /projects/<slug> (#<n>)" --body "..."
```

The PR body should say **what the old page had that the new one didn't**, what you cut on purpose,
and the measured numbers. Not a diff summary — the diff is right there.

**Budget for more than one round.** Prodigal's PR went through three rounds of changes after the
first audit-driven draft — dropping a credit that didn't hold up, a full reframe around a fact only
Ali had, then a further trim once the reframe made two earlier paragraphs read as clutter. None of
that was the audit or the old page failing; it's what "branch → push → look at it → react" in
`CLAUDE.md`'s review loop actually produces once there's a real page to react to. Keep the PR
description current as the page moves — a comment noting what changed and why is fine mid-flight,
but rewrite the description itself before the PR is done, so it reflects where the page landed and
not just where it started.

## 8. File what you found sideways

A per-page pass keeps surfacing cross-page problems. **Comment on the affected page's own
content-pass issue rather than opening a new one** — every page has one, listed on #31. Open a new
issue only for something no existing issue covers (tooling, build, a sitewide mechanism).

Issue numbers, for reference: #89 art-of-rescue, #90 cor-ex-machina, #91 critter-3, #92 dead-booty,
#93 it-will-kill-you, #94 kinoclue, #95 mini-mages, #96 night-light, #97 prodigal, #98 secret-garden,
#99 tilting-at-windmills, #100 /contact, #101 /projects, #104 /404, #129 homepage, #136 marvel-snap,
#137 vegas-blvd-slots, #138 it-fits-i-sits, #139 firefall, #140 kaneva, #141 /about. `/resume` and
`/resume/full` are #32.

**And correct `CLAUDE.md` when the pass disproves something in it.** It's the file every session
reads first, which makes a false line there more expensive than anywhere else. #97 found that its
claim about em dashes being eliminated was wrong by four instances.

## Open findings this skill has not resolved

Recorded here rather than lost, because they're judgment calls for Ali and they recur:

- **Link `label` fields use `Title — Source` as a citation format** (`Kaneva — Virtual Worlds
Museum`, `"Welcome Ali!" — Second Dinner`). Rendered as visible copy, so the audit flags them.
  They read as a deliberate convention rather than prose, like the `<title>` template. **Not
  changed. Ask before treating one as a finding.**
- **Archive cards on `/projects` don't render `summary` at all** — only featured cards do. So an
  archive page's summary is seen on the detail page and in the meta description, and nowhere else.
  Worth knowing when judging how hard a summary has to work.
