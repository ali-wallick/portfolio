# CLAUDE.md

Standing brief for `aliwallick.com`. Read this before doing anything else in this repo — it exists
so you start informed instead of re-deriving context from scrollback, and so decisions already made
don't get relitigated.

Keep it current. If you make a decision that a future session would otherwise have to guess at,
write it down here.

---

## What this is

Ali Wallick's portfolio. Ali is a game developer — 15 years, currently a client engineer at Second
Dinner, shipped Marvel Snap, now on an unannounced mobile title in Godot. **She is not a web
developer, and the site should read that way on purpose rather than by accident.**

The previous site was hand-written PHP from college, last touched meaningfully in 2016. It was
replaced in 2026 for two reasons, and the second one matters as much as the first:

1. Ship a portfolio that is accurate, modern, and distinctly not-a-template.
2. Use the rebuild as a hands-on study of agentic workflows at small scale.

Because of #2, this repo deliberately over-invests in tooling and process relative to a normal
portfolio project. The tooling is half the point, not overhead around the real work. Notes for the
eventual build-in-public page accumulate in [`docs/REBUILD-LOG.md`](docs/REBUILD-LOG.md) — add to it
as you go rather than reconstructing at the end.

The full plan lives at `~/.claude/plans/i-first-built-this-glistening-book.md`.

---

## Settled — do not relitigate

| Decision                | Choice                                                                                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack                   | Astro, Markdown content collections, `output: 'static'`. No framework, no adapter.                                                                                                                                                                            |
| Deploy                  | Cloudflare **Workers** static assets, git push, one preview URL per branch. (The plan said Pages; Cloudflare has frozen Pages for new features and routes new Git projects to Workers. Same review loop, plus native `_redirects`. See `docs/CLOUDFLARE.md`.) |
| Registrar / DNS / email | Cloudflare + iCloud+. **Closed in Phase 1. Out of scope. Do not touch.**                                                                                                                                                                                      |
| Public address          | `contact@aliwallick.com`                                                                                                                                                                                                                                      |
| Blog                    | Scraped to Markdown, mined for content. **No live blog section.**                                                                                                                                                                                             |
| Projects                | Two tiers — 5 deep write-ups, ~12 in a compact scannable archive.                                                                                                                                                                                             |
| Marvel Snap             | A full public credit. Second Dinner places no restriction on it.                                                                                                                                                                                              |
| Current work            | Described only as "an unannounced mobile title in Godot".                                                                                                                                                                                                     |
| Contact form            | None. A `mailto:` and vetted social links. The old PHP form had no CSRF token, no rate limiting, and silently discarded the sender's name.                                                                                                                    |
| Visual design           | Deferred to Phase 5, deliberately last.                                                                                                                                                                                                                       |
| URLs                    | Extensionless (`/about`, `/projects/firefall`), matching the old `.htaccess` rewrites, so Phase 6's redirect map stays small.                                                                                                                                 |

---

## Phases

| Phase | What                                               | State                             |
| ----- | -------------------------------------------------- | --------------------------------- |
| 0     | Preserve — blog scrape, snapshot, asset inventory  | ✅ merged                         |
| 1     | Infrastructure — domain, DNS, email                | ✅ merged                         |
| 2     | Foundation & agentic tooling                       | ✅ merged                         |
| 3     | Content: get it true                               | ← needs a gate conversation first |
| 4     | Resume, one source                                 |                                   |
| 5     | Design                                             |                                   |
| 6     | Launch — favicon, OG, a11y, redirects, DNS cutover |                                   |
| 7     | Keep it alive                                      |                                   |

**Sequencing principle: structure before skin.** Phases 2–4 produce a complete, correct,
deliberately unstyled site. Design lands in Phase 5 onto content that already exists, so directions
get judged against real material instead of lorem ipsum.

**Phase gates are real.** Stop and talk before starting a phase. Don't roll forward into the next
one because the current one finished early.

### Staying in your phase

The most useful thing this file does is stop work leaking across phase boundaries. If you notice
something that belongs to a later phase, **leave a `TODO(phase-N):` comment and move on**. There are
a lot of them in the codebase already; that is the system working, not debt.

- Writing prose for a project page or the bio → Phase 3.
- Resume copy, the printable PDF → Phase 4.
- Picking colors, type, or layout → Phase 5.
- Favicon, OG images, redirects, analytics → Phase 6.

---

## The content model

`src/content.config.ts` is the contract. Read it — it is heavily commented and it is the file most
worth understanding before changing anything.

Two rules drive it:

1. **Adding a project or a job is one Markdown file.** Never a layout change, never a
   hand-maintained index, never a second place to update.
2. **Every fact lives in exactly one place.** The resume page, the About timeline, and project pages
   all read the same collections. They cannot drift apart — which is exactly how the old site ended
   up describing the Marvel game as "upcoming" on four separate pages simultaneously.

A third rule follows: **make the old site's mistakes unrepresentable, not merely fixed.**

| Guard                                        | The bug it prevents                                                                                                                                                         |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| YouTube stored as a bare 11-char video ID    | Five `http://` embeds, all blocked as mixed content. There is now no protocol for anyone to get wrong.                                                                      |
| Images via Astro's `image()`, `alt` required | Broken `<img>` shipping silently; no alt text anywhere on the old site.                                                                                                     |
| `links[].dead: true`                         | firefall.com, kaneva.com and argamestudio.org linked as live calls to action for years after going dark. The credit is true; the link isn't. Those are two different facts. |
| `status` enum on every project               | A 48-hour jam entry reading like a shipped commercial title.                                                                                                                |
| `job:` as a collection reference             | A project and the resume disagreeing about who Ali worked for.                                                                                                              |

### Drafts

`draft: true` relaxes completeness. `draft: false` enforces it — a published project **must** have a
`summary`, a `role`, and a `hero`, or the build fails. That is what "done" means for a project page,
expressed as a build error rather than a note in a document nobody reads.

Drafts render in `astro dev` and on Cloudflare **preview** deploys (`SHOW_DRAFTS=true`), and are
excluded from production. Every project seeded in Phase 2 is a draft carrying real metadata and no
prose.

### Adding things

Use the skills — they encode the schema, the conventions, and the verification step:

- `.claude/skills/add-project/` — add or update a project entry.
- `.claude/skills/write-project-page/` — write a project write-up from source material.
- `.claude/skills/pre-launch-check/` — the full pre-merge / pre-launch sweep.

Note: the skill list loads at session start, so a skill added mid-session isn't invocable until the
next one. Read its `SKILL.md` and follow it directly in that case.

---

## Voice and content conventions

Settled now:

- **First person.** "I built", not "Ali built" and not "we built" for solo work.
- **Past tense for past work.** The single biggest factual problem with the old site was present
  tense that stopped being true in 2019 and stayed on the page for seven years.
- **Specific over impressive.** "Architected the menu animation system, adopted by both the UI and
  game teams" beats "contributed to UI development." Ali's own old pages are full of the specific
  kind; keep that.
- **Honest framing in the archive tier.** It is history, not a portfolio pitch. A student project
  should say so and be interesting anyway.
- **Never claim more than the source supports.** If the old page doesn't say what something was
  built in, leave the field empty. Guessing "6502 assembly" because it's an Atari game is inventing
  a fact. Empty fields degrade gracefully; wrong ones don't.
- **Tone target:** modern, a bit irreverent. It should be obvious a game developer made this and not
  obvious which template they used.

Not settled: the actual prose. That's Phase 3, and it needs a gate conversation about how to frame
the Marvel Snap credit, what's publicly describable from 2019–2022, and a media inventory.

### Facts worth having on hand

- Second Dinner, 2019–present — the longest tenure by far, and nearly absent from the old site.
- Marvel Snap shipped **October 2022**.
- _It Fits I Sits_ — pitched by Ali at MobilityWare's annual game jam, prototyped with a team in a
  week, won the People's Choice Award, shipped on Facebook Instant Games. **It had no page at all on
  the old site.** Biggest content gap.
- Critter³ is a **2011** jam entry. The old projects index filed it under 2013.
- The 20 posts in `content/archive/` are first-person source material — GGJ 2013, GDC 2013, "My
  First 2 Panels", MobilityWare, It Fits I Sits. This is where the site gets personality that can't
  be templated.

---

## Design

Phase 5 owns all of it. Until then:

- `src/styles/tokens.css` holds **placeholder** tokens. They are deliberately boring — a slot for a
  decision, not a decision.
- **Use the variables.** Never write a raw color or a raw `px` font size in a component. Phase 5
  should be a palette-and-type swap, not a hunt through every file.
- Responsive from the start. The old site had no viewport meta and rendered zoomed out on every
  phone ever made.
- **Preserve the one good idea from the old site.** `resources/js/nav.js` has a hand-rolled easing
  sticky sidebar built before `position: sticky` existed — it lags and settles rather than snapping.
  It's the only part of the old site with real personality. Reinterpret it; don't just delete it.

---

## Working here

```bash
npm run dev                        # localhost:4321, drafts visible
npm run verify                     # everything CI runs
SHOW_DRAFTS=true npm run build     # what a Cloudflare preview serves
```

Node is pinned by `.nvmrc` (22). Local dev on a newer Node is fine; CI and Cloudflare both read the
file.

### The review loop

This loop — not any single tool — is what makes agentic work on a visual project good, and it is the
thing the old DreamHost setup could not do at all:

**branch → push → Cloudflare posts a preview URL → look at it on a phone → react.**

So: **work on a branch, always.** Never commit straight to `master`, and don't merge without
checking in. Push early enough that there's a preview URL to look at while the work is still cheap
to redirect. Setup and troubleshooting: [`docs/CLOUDFLARE.md`](docs/CLOUDFLARE.md).

### Don't touch

- **DNS, the registrar, email.** Phase 1 is closed. None of it is back in scope.
- **`content/archive/`, `snapshot/`, `infra/`.** Preservation records from Phases 0–1. Their value is
  being faithful, so reformatting or "improving" them destroys the point. A `PreToolUse` hook blocks
  writes to the first two.
- **Anything on the Phase 0 asset keep/drop list** (`resources/images/ASSET_INVENTORY.md`) without
  checking in first. The inventory exists; it hasn't been acted on. `projects/downloads/nightLight.unity3d`
  (6.3 MB, unplayable) is the obvious candidate and is still deliberately in place.

---

## Notes for agents

**Subagents, used honestly.** Some work here genuinely fans out and most doesn't. Part of the point
of this project is building that judgment rather than guessing, so be deliberate and record what you
chose in `docs/REBUILD-LOG.md`.

- Worth it: surveying something genuinely unknown, checking many pages in parallel, independent
  research threads that don't need each other's output.
- Not worth it: anything you could do inline in a few tool calls. Each subagent starts cold and
  builds its own context from scratch, so a 30-second task can cost more delegated than done.

**Context length dominates cost.** Every turn re-sends the whole conversation, so one 100-turn
session costs far more than five focused ones doing the same work. Prefer a fresh session per phase,
with this file and the plan carrying context forward. That's cheaper _and_ produces better work — a
session dragging 80 turns of unrelated history reasons worse than one starting from a tight brief.

**Where things are:**

| Path                      | What                                                                      |
| ------------------------- | ------------------------------------------------------------------------- |
| `src/content.config.ts`   | The content model. Start here.                                            |
| `src/lib/content.ts`      | Collection queries and the only date/year formatting in the codebase.     |
| `src/config/site.ts`      | Name, email, nav, social links (all `pending` until Phase 3 audits them). |
| `scripts/check-links.mjs` | Post-build checks. Every rule is a regression guard for a real old bug.   |
| `docs/REBUILD-LOG.md`     | Running record. Phase 7's source material.                                |
| `snapshot/`               | The old site as it stood. The reference for "what did the old page say?"  |
