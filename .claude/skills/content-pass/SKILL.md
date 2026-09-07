---
name: content-pass
description: Revisit and update a page that already exists on aliwallick.com — a project write-up, About, the homepage, microcopy. Use when the user wants to refresh a project after new work on it, asks for a content pass on a named page, says a page reads thin or stale, or wants an existing entry reworked. Handles the method and the audit; write-copy governs how the sentences sound, and a brand-new entry starts with add-project instead.
---

# Revisit a page

The per-page method for improving a page that already exists. **One page per branch, one PR per
page** — a pass that touches four pages at once can't be reviewed, because the only review that
matters is Ali reading one page in the real design.

**This skill is the method. `write-copy` is the voice.** Both apply, and `write-copy` gets read
before a word is written — it carries the measured evidence (17-word mean, zero em dashes) the
sentences are judged against.

For a project that doesn't exist yet, start with `add-project` (front matter) and
`write-project-page` (the prose body). Come back here when it's time to revisit what shipped.

## 1. Know what's being asked

If the ask is an issue, **read its comments, not just its body** — bodies go stale, and a correction
often lives only in a comment. Note what the ask puts explicitly out of scope; most page-level asks
are about tone, length, and voice, not fact-correctness.

## 2. Run the audit

Build first — the audit reads `dist/`, because every check only works on rendered output.

```bash
SHOW_DRAFTS=true npm run build
node .claude/skills/content-pass/scripts/audit-page.mjs /projects/<slug>
```

It reports three things, each of which was missed by hand at least once:

| Check                          | Why it needs a script                                                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Em dashes in rendered copy** | `role`, `summary`, `caption`, and link `label` are front matter that **renders as visible copy**. A grep of body prose sees none of them. It attributes each hit back to its source line and key. |
| **Sentence stats on the page** | `copy-stats.mjs` measures the file. This measures what a reader sees, which includes the summary and captions.                                                                                    |
| **Unused media**               | The Phase 3 asset migration moved the whole keep-list into `src/assets/`; only heroes ever got wired up, so a page's own screenshots may be sitting unreferenced.                                 |

`--all` sweeps every project. Use it to find cross-page patterns, not to batch the pass.

**Two deliberate asymmetries in the script**, so its output isn't confusing:

- **Em dashes are scanned across all of `<main>`; sentence stats exclude the metadata strip and
  backlink.** An em dash in `role` is a real finding, but "Game jam 2011 Unity Georgia Tech" is not
  a sentence and wrecks the mean on a short page.
- **The `<title>` / `og:title` template (`{title} — Ali Wallick`) carries an em dash on every
  route and stays.** It's a structural separator, not prose. It lives outside `<main>`, so it never
  appears in the audit.

## 3. Fill the gaps the audit can't see

The audit measures what's on the page. It can't tell you what isn't.

- **Source material lives in more places than the page itself.** `write-project-page` §1 has the
  full table — the blog in `content/archive/`, the 2019 resume bullets preserved in
  `src/content/jobs/`, `src/assets/images/`, the Wayback Machine, and Ali. `content/archive/` and
  `snapshot/` — the old site's own pages, the reference for "what did the old page say?" — are both
  read-only; `.claude/hooks/guard-preserved.sh` refuses a Write or Edit to either.
- **Interview Ali when the page's premise has aged out, not just one fact on it.** If the ask itself
  says "rethink this," don't spend the first round mining written sources for something that isn't
  in them. `/about` ([#141](https://github.com/ali-wallick/Portfolio/issues/141)) got its richest
  material — speaking to a college class and a Girl Scout troop, a synagogue board seat — from a
  direct interview, and none of it had any trace in the repo to find by reading harder.
- **"The sources are exhausted" is not "the facts are exhausted."** If a page still reads generic
  after the audit, ask her before writing final copy.

## 4. Decide the shape before writing

`src/content.config.ts` is the contract, and the tiers behave differently — see
`write-project-page` for what each tier's body may carry.

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

## 6. Read the rendered page

Four things no script catches, all of them found by a human looking at the built page:

- **A caption restating the body paragraph beside it.** The audit measures each field in isolation,
  so it can't see "Touching one is instant death" sitting under a sentence ending "...and touching a
  zombie means instant death" ([#92](https://github.com/ali-wallick/Portfolio/issues/92)).
- **A `summary` read by someone who never clicks through.** Archive cards on `/projects` don't render
  `summary` at all, but featured cards do, and that card may be the only prose a reader ever sees
  ([#101](https://github.com/ali-wallick/Portfolio/issues/101)).
- **A floated image only wraps the paragraphs that follow it in the DOM.** Adding a second paragraph
  next to an existing single-paragraph-plus-float layout leaves the first one full width and the
  edge visibly ragged. Move the figure above both, don't change the float
  ([#141](https://github.com/ali-wallick/Portfolio/issues/141)).
- **Ragged gallery bottoms are cosmetic now.** `.gallery` uses `align-items: start`, which pins every
  image's top — the one alignment a mixed-aspect-ratio row can guarantee. Matching caption line
  counts only tidies the bottom edge; it isn't a correctness fix
  ([#93](https://github.com/ali-wallick/Portfolio/issues/93)).

**A shared field holds facts; the page owns the sentence.** `jobs[].current` is `{ since, doing }`,
and the homepage and About each compose their own sentence around it — the homepage names the
studio and takes the exclamation, About says "the studio" and links the whole predicate to the W4
announcement ([#207](https://github.com/ali-wallick/Portfolio/issues/207)). Edit the field to
change the fact; edit the page to change its framing. Don't put a finished sentence back in the
field: it used to be one, and About ended up splitting it on the word "Godot" to get a link in.

## 7. Verify

```bash
npm run verify
```

**Any of `build-pdf.mjs`'s hashed inputs invalidates the resume PDFs, and that list is wider than a
page's own content file.** Read `byteHashedFiles()` in `scripts/build-pdf.mjs` for the current list
— it includes `base.css`, `tokens.css`, `site.ts`, `content.ts`, `content-rules.ts`, and the resume
components. Adding icon markup to `.button` in `base.css` — a change with nothing to do
with the resume — still changed `scripts/resume-pdf.lock.json`
([#184](https://github.com/ali-wallick/Portfolio/pull/184)). `npm run build` regenerates them; commit
`public/*.pdf` and the lock with your change, even when the PDFs render pixel-identical, or
`npm run check:pdf` fails the deploy. **If a branch touches sitewide CSS or `site.ts` for any reason,
check `git status` for regenerated PDFs before opening the PR.**

## 8. Branch, preview, PR

Per `CLAUDE.md`'s review loop. Copy is Ali's, and "it builds" proves nothing about tone.

```bash
git checkout -b content-pass-<slug>
git push -u origin content-pass-<slug>
gh pr create --draft --title "Content pass: /projects/<slug>" --body "..."
```

**Lead the PR body with `Closes #<n>`** when there's an issue. GitHub only auto-closes on merge if
the keyword is in the body or a commit message — a title that merely references the number does not
close it. First line of the body, not buried in a markdown link mid-paragraph.

The body should say what changed and why, what you cut on purpose, and the measured numbers. Not a
diff summary — the diff is right there.

**Budget for more than one round.** A page typically moves two or three times after the first draft:
a fact only Ali has, a reframe, then a trim once the reframe makes an earlier paragraph read as
clutter. That's the review loop working, not the pass failing. Keep the PR description current as the
page moves, so it reflects where the page landed and not just where it started.

**Rebase onto `main` before finishing.** Content branches land in quick succession and several touch
shared CSS (`.gallery`, `.media`), not just their own content file, so a branch opened a day earlier
can be missing a fix a sibling pass already shipped.

## 9. File what you found sideways

A per-page pass keeps surfacing cross-page problems. **Open an issue** rather than appending to a
doc or leaving it in a `TODO(...)` comment, per `CLAUDE.md`.

**And correct `CLAUDE.md` when the pass disproves something in it.** It's the file every session
reads first, which makes a false line there more expensive than anywhere else.

## 10. Pass the skills themselves

Every pass is a live test of whether the guidance in `content-pass`, `write-copy`, `add-project` and
`write-project-page` holds up against a real page and Ali's real reactions. Before the PR merges,
look back: a tell that slipped through every mechanical check until Ali caught it on read, a line of
guidance that turned out too rigid, a working pattern worth naming. If a future pass would hit the
same thing blind, write it into the skill that governs it — **one rule, one home**, since a rule
recorded in two skills drifts.

**Then check whether it already shipped elsewhere.** A rule that didn't have a name yet may be live
on a page written before it existed. Mechanical patterns are a grep or an `--all` sweep away;
phrasing patterns need a spot-check. **Suggest, don't fix** — a finding on another page is that
page's own pass, with its own branch and its own PR.

**Not every pass will find something, and that's a fine outcome.** Don't manufacture a finding to
fill the step.

## Open findings

Recorded here rather than lost, because they're judgment calls for Ali and they recur:

- **Link `label` fields use `Title — Source` as a citation format** (`Kaneva — Virtual Worlds
Museum`, `"Welcome Ali!" — Second Dinner`). Rendered as visible copy, so the audit flags them.
  They read as a deliberate convention rather than prose, like the `<title>` template. **Not
  changed. Ask before treating one as a finding.**
- **Archive cards on `/projects` don't render `summary` at all** — only featured cards do. So an
  archive page's summary is seen on the detail page and in the meta description, and nowhere else.
  Worth knowing when judging how hard a summary has to work.
