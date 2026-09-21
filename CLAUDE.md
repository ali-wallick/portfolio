# CLAUDE.md

Standing brief for `aliwallick.com`. Read this before doing anything else in this repo — it exists
so you start informed instead of re-deriving context from scrollback, and so decisions already made
don't get relitigated.

Keep it current. A decision a future session would otherwise have to guess at goes in the record
for its domain — see "The decision record" below — and its rule is promoted into this file only
when no build guard catches a violation.

## What this is

Ali Wallick's portfolio. Ali is a game developer — 15 years, currently a Senior Software Engineer I
at Second Dinner, shipped Marvel Snap, and since 2024 on the studio's next game in Godot. **She is
not a web developer, and the site should read that way on purpose rather than by accident.**

The previous site was hand-written PHP from college, last touched meaningfully in 2016. It was
replaced in 2026 for two reasons, and the second one matters as much as the first:

1. Ship a portfolio that is accurate, modern, and distinctly not-a-template.
2. Use the rebuild as a hands-on study of agentic workflows at small scale.

Because of #2, this repo deliberately over-invests in tooling and process relative to a normal
portfolio project. The tooling is half the point, not overhead around the real work. Notes for the
eventual build-in-public page accumulate in [`docs/REBUILD-LOG.md`](docs/REBUILD-LOG.md) — add to it
as you go rather than reconstructing at the end.

How the project was actually run — the phase gates, the model allocation, what drove cost — and a
per-phase record including what the plan got wrong, live in
[`docs/REBUILD-LOG.md`](docs/REBUILD-LOG.md). There is no separate plan file: it moved into the repo
on 2026-08-20, was narrowed to a record, and was folded into the log the same day once it became
clear it was a second, thinner source for the same build-in-public page the log already feeds.

**A decision is written down exactly once, and the split below is a move rather than a copy.**
When two documents described the same decision they drifted — the plan's decisions table still listed Second Dinner's current work under a
phrasing retired below. That is the failure mode the guard table further down exists to rule out.

**Remaining work is tracked as GitHub issues, not in a document.** Most of it carries no
milestone at all — milestones here mark a genuine distinction, not a status label, so once
`Pre-launch` and `Launch` closed at the cutover, `Post-launch` stopped discriminating anything (every
open issue is trivially "after launch" once the domain has moved) and was closed too
(2026-08-28), the same call the Phase 6 gate made when it deleted the stage labels for being a 1:1
echo of their milestone. **`Deferred` followed the same way on 2026-09-08**: once everything
non-deferred was done, every open issue left in it was, by definition, deferred, so the milestone
had stopped discriminating too and was retired — the same call, not a new one. What it grouped is
now the `blocked` label, carried on the issue itself rather than a milestone tag, so it shows up in
a plain issue list instead of requiring a milestone filter. The last milestone,
[`DreamHost renewal deadline`](https://github.com/ali-wallick/Portfolio/milestone/4), earned its
place by marking something a plain issue list can't — the one piece of this project that depended
on someone else's timeline — and closed with its single issue (#52) on 2026-09-13. A new milestone
needs that kind of distinction, not a status. Each issue carries its source, why it's blocked, and
what unblocks it, so a cold session can pick one up without reading scrollback.

Three labels do real work. **`decision`** marks the four things that block work rather than being
work — they need a call from Ali, not a commit, and several issues are explicitly blocked on them.
**`needs-ali`** marks everything an agent cannot do because Ali is the only source: the 2024–present
Godot detail, the resume's tooling line, the Kaneva title. **`blocked`**
(added 2026-09-08, replacing the `Deferred` milestone) marks an issue Ali can't move forward on
right now because it's waiting on someone or something outside her control — a person's reply, an
external system, a future date — as distinct from `needs-ali`, which she could sit down and act on
today. The two aren't mutually exclusive: #52 carried both, since closing out DreamHost needed Ali as
the decider _and_ waited on Robert's migration.

**If you find a follow-up, open an issue.** Don't append it to a doc and don't leave it only
in a `TODO(...)` comment — the comments mark _where in the code_ later work lands, the issues are
what actually gets worked. **Every `TODO(...)` cites its issue number**; keep it that way, so a
marker in the source is never a dead end. The marker is `TODO(#n)`, the issue number and nothing
else — the stage-name form this file prescribed until 2026-09-07 (`TODO(launch)`) was never used,
and the phase-numbered form (`TODO(phase-3-revisit)`) is history with zero markers left.
`grep -rn 'TODO(' src/` is the whole sweep; a marker whose issue is closed goes with the change
that closed it.

**And keep status out of this file.** The rule, which is why the phase sections in the record carry
conventions and constraints but no worklists: _if a sentence here would need editing when an issue
closes, it belongs in the issue._ This file says what was **decided**; issues say what is **left**.
Decisions don't go stale, status does — and this is the one document every session reads before
doing anything, which makes it the worst possible place for a sentence that quietly becomes false.
It had five such sections on 2026-08-20, describing work that was already tracked as #32, #33, #35,
#37, #39, #40 and #46.

## Settled — do not relitigate

| Decision                | Choice                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stack                   | Astro, Markdown content collections, `output: 'static'`. No framework, no adapter.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Deploy                  | Cloudflare **Workers** static assets, git push, one preview URL per branch. (The plan said Pages; Cloudflare has frozen Pages for new features and routes new Git projects to Workers. Same review loop, plus native `_redirects`. See `docs/CLOUDFLARE.md`.)                                                                                                                                                                                                                                          |
| Registrar / DNS / email | Cloudflare + iCloud+. **Closed in Phase 1. Out of scope. Do not touch.**                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Public address          | `contact@aliwallick.com`                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Blog                    | Scraped to Markdown, mined for content. **No live blog section.**                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Projects                | Two tiers — 5 deep write-ups, ~12 in a compact scannable archive.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Marvel Snap             | A full public credit. Officially credited at [marvelsnap.com/credits](https://marvelsnap.com/credits/) as **Senior Software Engineer I** — link it rather than asserting it.                                                                                                                                                                                                                                                                                                                           |
| Current work            | **"A new team at Second Dinner, building the studio's first game in Godot."** The studio went public in Aug 2024, so the old "an unannounced mobile title" hedge was vaguer than reality. Corrected twice since — see "What is safe to say about Second Dinner" below for #129 (not "the studio's next team") and #32 (the platform _is_ public; "mobile" is sayable).                                                                                                                                 |
| Contact form            | None. A `mailto:` and vetted social links. The old PHP form had no CSRF token, no rate limiting, and silently discarded the sender's name.                                                                                                                                                                                                                                                                                                                                                             |
| Visual design           | Deferred to Phase 5, deliberately last.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Canonical hostname      | **The apex is the real address; `www` 301s to it.** Both work — typing `www` lands on the right page, path and query preserved. This is what `site.url`, every `canonical`, every `og:url` and all 22 sitemap entries already say, so nothing on the site changes. Settled 2026-08-26 ([#193](https://github.com/ali-wallick/Portfolio/issues/193)); it needs a zone-level Single Redirect rule, since `_redirects` matches paths and not hosts. Procedure: [`docs/LAUNCH.md`](docs/LAUNCH.md) step 6. |
| URLs                    | Extensionless (`/about`, `/projects/firefall`), matching the old `.htaccess` rewrites, so the pre-launch redirect map stays small.                                                                                                                                                                                                                                                                                                                                                                     |
| License                 | **Code MIT, content all rights reserved, and neither covers the images this repo reproduces but does not own** — employer IP, team work, and photographs of Ali. `LICENSE` and README's License section are the statement; the file-by-file inventory is in `docs/decisions/tooling.md`. Settled 2026-09-21 ([#109](https://github.com/ali-wallick/Portfolio/issues/109) item 7). **Adding an image means knowing who made it** — a blanket claim was wrong for 53 of 69.                              |

---

## The decision record

**This file is the brief. The reasoning behind the settled decisions lives in `docs/decisions/`.**
Split out on 2026-09-07 ([#335](https://github.com/ali-wallick/Portfolio/issues/335)): CLAUDE.md had
reached 3,774 lines — read in full at the start of every session, before the first tool call — and a
session adding one résumé bullet was reading the Phase 5 gate outcome and thirteen switcher-pass
records to do it. The brief is about 600 lines.

**It is a move, not a copy**, so each decision is still written down exactly once. What changed is
where: the rule stays here, the reasoning and the measurement that produced it went to the record.

| Record                                                   | What is in it                                                                                                                      | The skill that routes to it                        |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| [`docs/decisions/design.md`](docs/decisions/design.md)   | Phase 5 and every design pass since — look, motion, layout, the gallery and lightbox, the width system, the switcher loop's output | `design-switcher`                                  |
| [`docs/decisions/resume.md`](docs/decisions/resume.md)   | Phase 4, both densities, the print pipeline, the paper look, the print guards                                                      | `update-resume`                                    |
| [`docs/decisions/content.md`](docs/decisions/content.md) | The Phase 3 gate beyond the ceiling below, the wording pass, the content-model additions                                           | `write-copy`, `write-project-page`, `content-pass` |
| [`docs/decisions/tooling.md`](docs/decisions/tooling.md) | Phase 6's naming, preservation, CI and headers, the architecture and agentic-layer reads                                           | `pre-merge-check`, `release`, `steward`            |

**The cut line was a test, not a judgment call, and it is the test for anything added from here on:
_is this rule enforced by a build guard?_** If it is — a page count, print geometry, curly
apostrophes, the bullet floors, a required `draft` — the guard is the reminder, and the reasoning
can live in the record where it costs nothing to carry. If it is not, the rule stays in this file.
The handful that failed that test are gathered under "Rules with no guard behind them" below.

**A new decision goes in the record for its domain**, appended at the end, under a heading naming
its date and issue like every section already there. Only promote a rule up here when nothing in
`npm run verify` would catch someone breaking it.

[`docs/REBUILD-LOG.md`](docs/REBUILD-LOG.md) is unchanged and is a different thing: it carries the
_narrative_ of how a pass was run and what it cost, for [#48](https://github.com/ali-wallick/Portfolio/issues/48).
The records carry what was decided.

---

## Phases

Phases 0–5 are the build: they're closed, and the table below is a historical record — don't
relitigate anything in it, and don't rename it. Phase 6's own gate (2026-08-23, in [`docs/decisions/tooling.md`](docs/decisions/tooling.md)) decided that
what comes after the build isn't more numbered phases — it's three stages named for where they sit
relative to the domain moving, which is the one event with a blast radius outside the repo. Use
**pre-launch / launch / post-launch** for everything from here on; "Phase 6" and "Phase 7" are
retired as names for current work, even though the historical prose in the records still uses them
to describe what happened during that time.

| Phase       | What                                                                                                                                 | State                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| 0           | Preserve — blog scrape, snapshot, asset inventory                                                                                    | ✅ merged                                 |
| 1           | Infrastructure — domain, DNS, email                                                                                                  | ✅ merged                                 |
| 2           | Foundation & agentic tooling                                                                                                         | ✅ merged                                 |
| 3           | Content: get it true                                                                                                                 | ✅ merged                                 |
| 4           | Resume, one source                                                                                                                   | ✅ merged                                 |
| 5           | Design                                                                                                                               | ✅ merged                                 |
| Pre-launch  | Favicon, OG, a11y, redirects, remaining content/resume calls, wording revisit — everything that must be true before the domain moves | ✅ done, milestone closed                 |
| Launch      | The DNS cutover itself — its own moment, not gated on Pre-launch closing (#21). Procedure: [`docs/LAUNCH.md`](docs/LAUNCH.md)        | ✅ done, milestone closed                 |
| Post-launch | Keep it alive                                                                                                                        | 🚧 ongoing — milestone retired, see above |

**Sequencing principle: structure before skin.** Phases 2–4 produce a complete, correct,
deliberately unstyled site. Design lands in Phase 5 onto content that already exists, so directions
get judged against real material instead of lorem ipsum.

**Phase gates are real.** Stop and talk before starting a phase. Don't roll forward into the next
one because the current one finished early. Pre-launch → Launch is a gate too — see the Phase 6 gate
outcome in [`docs/decisions/tooling.md`](docs/decisions/tooling.md) for why launch doesn't happen just because Pre-launch's milestone is empty.

### Staying in your phase

The most useful thing this file does is stop work leaking across phase boundaries. If you notice
something that belongs to a later stage, **leave a `TODO(...)` comment and move on**. There are a
lot of them in the codebase already; that is the system working, not debt.

- Writing prose for a project page or the bio → Phase 3.
- Resume copy, the printable PDF → Phase 4.
- Picking colors, type, or layout → Phase 5.
- Favicon, OG images, redirects, analytics → Pre-launch.

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
| `hero: { type: art }` as an explicit variant | A page for work that cannot be pictured shipping with no lead image, or with a picture that misrepresents it. The stand-in is declared, not defaulted (#49).                |

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
- `.claude/skills/write-copy/` — write or edit any prose on the site in Ali's voice.
- `.claude/skills/content-pass/` — revisit or update a page that already exists.
- `.claude/skills/update-resume/` — add, update, or rebalance resume content.
- `.claude/skills/pre-merge-check/` — the pre-merge sweep, plus three short after-release checks.
  (It was `pre-launch-check` until 2026-09-07; the cutover half it carried is `docs/LAUNCH.md`'s
  record now.)

Four more skills are not about content at all and are listed here because this is where the skill
list lives. `.claude/skills/design-switcher/` — the live-switcher review loop, for a look, motion
or control decision that needs Ali's eye. See "The switcher loop is a skill now" in
[`docs/decisions/design.md`](docs/decisions/design.md).
`.claude/skills/release/` — `main` → `release`, the push that actually deploys. See "Merging to
`main` does not deploy" below. `.claude/skills/cleanup-branches/` — stale local branches and
worktrees. And `.claude/skills/steward/` — **not a skill anyone invokes**, but the file the Claude
Code web harness reads before acting on a PR event, which is the only repo-side lever over how
proactive a PR-watching session is. See "A green PR waiting on Ali is not work" in
[`docs/decisions/tooling.md`](docs/decisions/tooling.md). Both of the
last two live beside the content skills because `.claude/skills/` is the only path the harness
reads; there is no second directory to sort them into (#107).

`content-pass` is the method and `write-copy` is the voice; a session revisiting a page uses both.
Adding something new starts one step earlier — `add-project` for front matter, `write-project-page`
for the prose — and comes back to `content-pass` to revisit what shipped.

**The old-page comparison came out of `content-pass` on 2026-08-27 ([#147](https://github.com/ali-wallick/Portfolio/issues/147)), and that is a closure, not a
loosening.** Through #31 the skill's central rule was _read the old page in `snapshot/` before
deciding the current one is fine_, because Phase 3 wrote every page by compressing an old one and a
pass that only read the current page inherited every compression silently — that is how #97's page
came to be clean, in voice, and missing the reason the game has its name. Every page has now been
compared once, across #31's 21 sub-issues; a new project has no old page to compare against; and
[#45](https://github.com/ali-wallick/Portfolio/issues/45) will eventually delete `snapshot/`, which
the audit script used to read. **`snapshot/` is still the reference for "what did the old page
say?"** — it just isn't a step in every pass any more.

Note: the skill list loads at session start, so a skill added mid-session isn't invocable until the
next one. Read its `SKILL.md` and follow it directly in that case.

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
- **The apostrophe is `’`, and it is typed, not generated** (2026-08-26,
  [#188](https://github.com/ali-wallick/Portfolio/issues/188)). Ali's call. Front matter, Markdown
  bodies, `.astro` prose, `src/config/*.ts` strings, and `scripts/build-linkedin.mjs`'s hand-authored
  blocks all carry it directly. **Markdown bodies do not need to — Astro's smartypants curls them
  anyway — and they carry it regardless**, because a rule with an exception in it is a rule someone
  has to remember which surface they are on. That was the bug: only bodies got smartypants, so a
  `caption` rendered `didn't` beside a paragraph's `didn’t` on the same page. Straight apostrophes
  inside code stay straight; they are quoting source. `scripts/check-links.mjs` fails the build on a
  straight apostrophe in rendered prose, alt text, or a meta description — **checked on the output,
  not the source, because the output is the only place the three sources meet.**

**The voice is documented from primary sources, not described in the abstract** (2026-08-24). The
`write-copy` skill carries quoted evidence and measurements in
`.claude/skills/write-copy/references/ali-voice.md`, derived from four independent corpora:
`content/archive/` plus `snapshot/` and the 2019 resume bullets; a 4,200-word set of adult documents
Ali supplied (cover letters, a client email, a warranty escalation letter, a volunteer synthesis
doc, 2016–2024); MobilityWare's 2017 "Meet Ali Wallick" Q&A; and her own chat messages from 2026.

**Only the first is committed.** The documents carry phone numbers, third-party names, and personal
matters unrelated to the portfolio, and this repo may go public
([#48](https://github.com/ali-wallick/Portfolio/issues/48)). Their measurements are recorded in the
reference rather than being re-derivable. That is a real cost and the right trade; Ali has the files.

Two measured gaps govern the wording pass ([#31](https://github.com/ali-wallick/Portfolio/issues/31))
and are worth knowing before writing anything.

**Her mean sentence is 17 words against the site's 32.** Every corpus lands between 14.6 and 17.5 —
sixteen years, five genres, careful writing and unedited writing alike. That makes it a fact about
how Ali writes rather than an artifact of any one source. The sharpest version: the longest sentence
in her whole 2017 interview is 27 words, which is shorter than the site's average.

**She has used zero em dashes in 9,937 words**, against the site's 91 in 5,743. She reaches for
parentheses, a spaced hyphen, or a full stop. (An earlier version of this note said "one em dash" —
that instance was in a `note:` field a previous agent wrote in a blog post's front matter, not Ali's
writing.)

The sentence-length gap is the higher-leverage of the two: a page can avoid every AI tell and still
not sound like her if every sentence has three clauses.

Contractions and exclamation rates are **genre-dependent and should not be tuned sitewide** — 17
contractions per 1k words in the blog against 0.7 in her formal writing. The site's current rate is
fine.

**One content finding from the interview, not a voice one.** Ali describes her own draw to front-end
work as combining _"the logic of programming and creativity of design"_ (2017), and the old
`about.html` independently says the Computational Media major _"provided the perfect blend of
creativity and logic."_ Same claim, unprompted, years apart. That is her own thesis about her work
and shouldn't be reinvented — see the reference for both quotes.

### Facts worth having on hand

- Second Dinner, 2019–present — the longest tenure by far, and nearly absent from the old site. Ali
  joined as the **11th employee** (the studio was founded in 2018, confirmed exact — not an
  estimate), so the story is partly about helping build a company, not only a game.
- Marvel Snap shipped **October 2022**. Ali worked on it from 2019 until **2024**, when she moved to
  a new team at Second Dinner.
- Critter³ is a **2011** jam entry. The old projects index filed it under 2013.
- **KinoClue is undergraduate research, not a class project** — a Georgia Tech Synaesthetic Media Lab
  / GVU Center piece, "KinoClue: A Tangible Tabletop Mystery", credited to Russell Brooks, Ali
  Wallick, Susan Robinson, and Ali Mazalek. The single image on the old page is the research poster
  and contains the entire description. Re-tag `event` to the lab and add the collaborators.
- The 20 posts in `content/archive/` are first-person source material — GGJ 2013, GDC 2013, "My
  First 2 Panels", MobilityWare, It Fits I Sits. This is where the site gets personality that can't
  be templated.

#### I Fits I Sits — scope Ali's contribution precisely

The biggest content gap on the old site (no page at all), and the easiest to overclaim. What is true:

- Ali **pitched** the concept at MobilityWare's Game Jam V (**March 2018** — the award certificate is
  dated 03/23/18) and built the prototype with a team over one week, under the name **I Fits I
  Sits**. Her focus was the **level editor**, which exported to JSON and let the team author **61
  levels** for pitch day — enough that the intro levels carried the whole tutorial with no guided
  tutorial needed.
- The team won the **People's Choice Award**, and the game was selected for full development.
- **Ali did not work on either shipped release.** She stayed on Vegas Blvd Slots; other teams built
  the Facebook Instant Games version (which she was kept in the loop on, and which peaked at **188K
  daily active users** — her own figure, from the 2019-04-16 archive post) and later the iOS/Android
  release, [Puzzle Cats](https://www.mobilityware.com/puzzle-cats/), which is still live.
- **The game was renamed twice after Ali's pitch, confirmed by her 2026-08-25.** MobilityWare shipped
  the Facebook Instant Games version as **It Fits I Sits** — the pitch name, I Fits I Sits, was
  already taken on that platform — then renamed it again as **Puzzle Cats** for the iOS/Android
  release, a better fit for marketing than the cat pun. The site names the page after what Ali
  actually pitched and built, not either later, out-of-her-hands rename.
- MobilityWare's Puzzle Cats page **does not mention the origin**. The lineage is Ali's own account,
  so write it as hers. Never phrase it so a reader thinks she is credited on Puzzle Cats.

The honest version is the better story anyway: a jam pitch that outlived her tenure and is still
shipping years later, with core gameplay close to the week-one prototype and the full releases adding
meta systems and live ops. Metadata follows from this — `status: jam`, not `shipped`, and `startYear:
2018` with no `endYear`.

## What is safe to say about Second Dinner

**Settled at the Phase 3 gate (2026-08-16), corrected twice since, and not up for relitigation.**
It stays in the brief while the rest of that gate — the Marvel Snap framing, the media inventory,
the social audit — moved to [`docs/decisions/content.md`](docs/decisions/content.md), because it is
the one constraint in this file whose violation is a disclosure rather than a bug.

The rule: **describe the craft, not the product.**

The 2019–2022 pre-announcement window turned out to be the _easy_ case, not the hard one — the thing
it was pre-announcement for shipped in October 2022, so the period is retroactively describable.
Systems that shipped can be discussed freely. Ali's own 2019 resume already said, publicly, that she
was building "an unannounced mobile Marvel game."

Off limits regardless of era: features that were cut or never shipped, monetization and business
internals, anything about how the studio operates, and mapping specific dates to specific decisions.

**The genuinely sensitive period is 2024–present, and even that is partly public.** On **7 August
2024** Second Dinner became a strategic investor in W4 Games and stated publicly that it plans to
build ["the most ambitious Godot game yet"](https://www.w4games.com/blog/w4-games-news-1/second-dinner-studios-becomes-a-strategic-investor-in-w4-games-and-plans-to-build-the-largest-game-in-godot-yet-37) —
Ben Brode and Matt Wyble both on the record. No title, platform, or genre named. So the site can say
Ali moved to the studio's next team in 2024 and that it is a Godot project, and **cite the
announcement**, which is stronger and more honest than the old hedge. It must not name or
characterize the game.

**Corrected 2026-08-26 (#129): "the studio's next team" is itself the wrong framing, not just a
hedge.** It implies succession — that the Marvel Snap team wound down and this replaced it. Neither
is true: Marvel Snap's team is still active, and Second Dinner has several new projects underway;
Ali is on one of them, not "the" next one. Every surface using this phrasing — `currentNote`, the
About page (which reads the same field), the Second Dinner job's `highlights` and `summary`, and the
generated LinkedIn doc — was corrected to "a new team at Second Dinner." One thing checked directly
with Ali and confirmed still true: hers is specifically **the studio's first game in Godot**, a
narrower and still-accurate claim distinct from "one of several new projects."

**Corrected again 2026-08-26 (#32): the platform is public, and this file had it backwards.** The
row in the Settled table above, and the paragraph above that, both said the W4 announcement named no
platform and that "mobile" was _wrong_ — the Phase 3 gate retired "an unannounced mobile title"
partly on that basis. **Ali's own statement, 2026-08-26: "we have been public that it's a mobile
game."** She is the primary source and works there; the gate's reading was an inference from one
announcement, hers is knowledge of what the studio has said. **So "mobile" is sayable.** The resume's
group heading is `Unreleased Mobile Game` and its subtitle names Godot, which puts both public facts
on the page without either being a disclosure.

Everything else the gate fenced off is untouched and still fenced: **no title, no genre, no
features, no monetization, no studio internals.** This correction moves exactly one word across the
line, on Ali's authority, and is not a general loosening of the 2024–present rule.

**A publicly-posted studio photo is not "how the studio operates" (2026-08-27, Ali's ruling).** "No
studio internals" reads naturally as covering an office interior with a dozen identifiable
colleagues in it, and
[#59](https://github.com/ali-wallick/Portfolio/issues/59) was written under exactly that caution.
Ali supplied a 2019 Second Dinner team photo, confirmed it was **posted publicly**, and cleared it
for use. It ships on the Marvel Snap page. **The two facts that make it clearable are worth keeping
attached to it**: it is public already, and 2019 is inside the window the shipped game made
describable. Neither holds for the 2024–present work, so this fences nothing new open — a photo of
the Godot team would still be off limits, and so would a private photo from any era.

**Current work is not a project page.** The schema requires a `hero` on every published project, and
this one can never have media — the schema is answering the question for us. It lives as a homepage
"currently" line, the top entry of the About timeline, and a paragraph on the Second Dinner job
entry. That is Phase 7's "currently line" idea arriving early, deliberately.

## Design

**Direction 03, playful / toy, in the arcade-dimmed palette.** The Phase 5 gate that chose it, the
four-way bake-off, and every design pass since are in
[`docs/decisions/design.md`](docs/decisions/design.md). What stays here are the rules that bind any
change to any component, whether or not it is a design pass.

### Standing rules

- `src/styles/tokens.css` holds the **shipped** palette and type scale as of Phase 5. Nothing in it
  is a placeholder any more.
- Responsive from the start. The old site had no viewport meta and rendered zoomed out on every
  phone ever made.
- **`--ease` is shared across _properties_, not only across components, and clamping is a
  property-level fact the token cannot know.** A curve that overshoots sends a position past its
  target and back, which is the whole appeal of one; sent through `opacity` it goes past fully
  transparent, clamps, and spends the overshoot sitting at zero — a bounce on one property and a
  dead interval on the other. The reticle's fade therefore carries its own written-in curve
  (`easeOutQuart`, settled 2026-08-21) rather than `var(--ease)`. Reach for a separate curve whenever
  a token meets a clamped property; don't assume a shared one transfers.

#### If your direction self-hosts a webfont, two things will bite it

Both were found while building a direction, both are direction-agnostic, and both are on `master` so
that all three directions get them rather than only the one that merges. Same reasoning as PR #11.

- **`ch` is a font-dependent unit, and `--measure` is written in it.** `1ch` is the width of the `0`
  glyph, so every max-width in `ch` is a box that changes width when the font loads. On the dense
  direction `64ch` resolved to **682px loaded and 570px in the fallback** — a 20% swing in the prose
  column that reflowed the page under it, scored **0.197 CLS** on `/about`, and failed CI's
  Lighthouse gate. It looked perfect locally, because a fast machine has the font before first paint
  and the swap never happens. **Express every max-width in `rem`**, pinned to the width `ch` was
  already producing: the rendered layout is identical and simply stops moving. The token is
  deliberately still `ch` — the right rem value depends on the face you pick. See `tokens.css`.
- **Print kills transitions now, and you should not undo it.** Switching to print media _starts_ any
  transition on a property the print block changes, and `build-pdf.mjs` prints inside that window —
  so a `transition: color` on `a` puts a different color in the PDF on every build. `resume.css`
  has a universal `transition: none !important` for paper. It is the one rule in that block that is
  not a denylist, on purpose.

## Working here

```bash
npm run dev                        # localhost:4321, drafts visible
npm run verify                     # everything CI runs
npm run build:pdf                  # just the resume PDFs, against an existing dist/
SHOW_DRAFTS=true npm run build     # what a Cloudflare preview serves
npm run links:external             # outbound link liveness — never gates a deploy
npm run update:line-length         # re-baseline prose line length after a width or type change
```

**`links:external` is deliberately outside `verify`, and that is not an oversight to correct.**
`check-links.mjs` never fetches an outbound URL, which keeps the gating check fast, offline and
deterministic — but it leaves link rot unwatched on a site whose content model has a `links[].dead`
field precisely because the old one linked three domains for years after they went dark. This is
that missing half. Wiring it into `verify` would make a deploy fail because somebody else's server
is down, which is worse than the rot it catches. It buckets results three ways rather than two: a
host that answers 403 or 999 to a script (LinkedIn always does) is reported **unverifiable**, not
dead, and only genuinely-gone links fail the run.

**It also runs monthly, and that is not a reversal of the rule above**: the rule is an argument
against _gating_, not against _noticing_, so `.github/workflows/link-check.yml` opens an issue and
can never fail a deploy. **Only the dead bucket may file**, and a clean run closes the issue. Both
have reasons that are easy to get wrong from the code alone —
[`docs/decisions/tooling.md`](docs/decisions/tooling.md).

Node is pinned by `.nvmrc` (22). Local dev on a newer Node is fine; CI and Cloudflare both read the
file. **`package.json`'s `engines.node` is a real floor, not a version bump for its own sake**:
`>=22.18.0` is where unflagged TypeScript type stripping landed, which is what lets the `.mjs`
scripts import `src/lib/content-rules.ts` (#328). Don't relax it as a cleanup.

`npm run build` also regenerates the resume PDFs into `public/`, which needs Chromium — installed by
a `postinstall` line in `package.json` (~95 MB, headless shell only). `npm run dev` doesn't touch it.

**In a Claude Code web session, that install fails and is meant to** (2026-08-31, closes
[#245](https://github.com/ali-wallick/Portfolio/issues/245)). The session's egress proxy blocks
`cdn.playwright.dev`, so `playwright install` 403s — `node_modules` still ends up fully populated,
only the browser download fails. `scripts/postinstall-playwright.mjs` runs the real install first,
unchanged, in every environment; only on failure does it check for the session image's own
preinstalled Chromium at `$PLAYWRIGHT_BROWSERS_PATH/chromium` and, if present, warn and exit clean
instead of failing `npm ci`. A genuinely broken environment — no download, no fallback — still fails
loudly. `scripts/lib/launch-chromium.mjs` is the other half: `build-pdf.mjs` and
`check-resume-print.mjs` both try the normal `chromium.launch()` first and fall back to that same
binary only if it throws, which is what actually lets `build:pdf` and `check:resume-print` run
somewhere the pinned browser revision was never downloaded.

**The PDFs are committed artifacts, and that isn't a shortcut — Cloudflare physically cannot build
them.** Its build image has no root and lacks Chromium's shared libraries, so the browser dies at
launch there while GitHub Actions builds the same commit fine. Details in
[`docs/CLOUDFLARE.md`](docs/CLOUDFLARE.md). **If you change resume content or layout, commit the
regenerated `public/*.pdf` and `scripts/resume-pdf.lock.json` with it** — `npm run check:pdf` hashes
every input and fails the deploy otherwise, so a stale resume can't ship, but it also can't fix
itself.

**"Resume content or layout" is wider than it sounds: `src/styles/base.css` is a hashed input**
(2026-09-04, from [#249](https://github.com/ali-wallick/Portfolio/issues/249)). A change with
nothing to do with the resume — a gallery rule, a lightbox rule — regenerates both PDFs, so read
`byteHashedFiles()` in `scripts/build-pdf.mjs` rather than guessing from the filename. What proves
the resume did not actually move is `check:resume-print`, which compares the rendered geometry
against a committed baseline; the regenerated bytes differing is expected and says nothing.

**A Claude Code web session can regenerate them, and the subset difference is not a defect**
(2026-09-05, closes [#306](https://github.com/ali-wallick/Portfolio/issues/306)). This used to say a
web session "cannot regenerate them correctly", on the evidence that the fallback Chromium #245
falls back to subsets fonts differently — 3 embedded subsets against 9, roughly half the file size,
identical geometry. **That evidence was real and the conclusion was wrong twice over.** Two engines
subsetting the same face differently is not a defect: same glyphs, same metrics, same rendering.
And the subset count was never the thing that differed — **neither render was the chosen face.** See
"The résumé PDFs were never actually set in Public Sans" in
[`docs/decisions/resume.md`](docs/decisions/resume.md). Regenerate wherever you are, and
`check:pdf` now proves the result is the right face.

**The command is `npm run build:pdf -- --force`, and the `--` is required**: without it npm eats the
flag, prints a warning about its own protections, and the script reports "already current" because
the lock it is checking already matches. Do the `npm run build` first, or it renders against a stale
`dist/`.

**Comparing two PDFs' content streams to check the resume is unchanged does not work.** Glyph IDs
there are indices into the embedded subset, and two renders subset differently, so the same
character gets a different ID and a diff reports thousands of changes that mean nothing. This was
tried; it produced a confident wrong answer in both directions before `check:resume-print` settled
it. That check, and the page-count assertion, are the guards — not the bytes.

### The review loop

This loop — not any single tool — is what makes agentic work on a visual project good, and it is the
thing the old DreamHost setup could not do at all:

**branch → push → Cloudflare posts a preview URL → look at it on a phone → react.**

So: **work on a branch, always.** Never commit straight to `main`, and don't merge without
checking in. Push early enough that there's a preview URL to look at while the work is still cheap
to redirect. Setup and troubleshooting: [`docs/CLOUDFLARE.md`](docs/CLOUDFLARE.md).

**Every PR description gets the expected branch preview URL, computed and included up front —
don't make Ali wait for or scroll to Cloudflare's own bot comment.** Build it from the pushed
branch name using the rule in `docs/CLOUDFLARE.md`'s "Using it" section: lowercase, `/` replaced
with `-`, then `-portfolio.ali-wallick.workers.dev` appended. If the sanitized name pushes the
`<branch>-portfolio` label past 63 characters, don't guess at Cloudflare's truncation — say so and
point to the bot's comment for the exact link instead of stating a wrong URL as fact.

### Merging to `main` does not deploy. `release` does. (2026-08-27)

**Say "merged", not "deployed", until `main` → `release` is pushed.** Workers Builds' configured
production branch is `release`, so a push to `main` takes the `wrangler versions upload` path — it
builds, it produces a `main-portfolio.ali-wallick.workers.dev` alias, and it changes nothing the
public can see. Only `release` takes the `wrangler deploy` path. This is written down in
[`docs/CLOUDFLARE.md`](docs/CLOUDFLARE.md) and is step 4 of
[`docs/LAUNCH.md`](docs/LAUNCH.md); it is repeated here because it was read there, for the preview
URL rule, and the deploy half was not noticed.

Merging six PRs and then watching the apex for half an hour is the cost of getting this wrong.
**Deploying is also its own decision** — merging a PR is not authorization to push `release`.

Two diagnostics that wasted most of that half hour, worth keeping so nobody repeats them:
`cf-cache-status: HIT` came back on a URL that had **never been requested**, so on this zone that
header proves nothing about caching; and an `Authorization`-header cache bypass still returned old
bytes, which reads as "the origin is stale" when the real answer was "you are asking a hostname
that is not the one you deployed to." The check that actually settled it in one request was the
version alias in Cloudflare's own commit check output, which names the exact build's URL.

### Deployed state drifts from the repo, and it has now happened three times

The general rule behind the section above. **When something about the live site disagrees with what
a checkout implies, suspect dashboard or zone state before suspecting the build.**

- `workers_dev` re-enabled itself, because `wrangler deploy` defaults it to `true` when it is not
  set explicitly — undoing a dashboard disable from minutes earlier. Fixed by pinning it in
  `wrangler.jsonc`.
- The served `robots.txt` is not the generated one: Cloudflare injects a Managed block ahead of it
  ([#215](https://github.com/ali-wallick/Portfolio/issues/215)).
- Production deploys from `release`, a Workers Builds setting with no representation in the repo at
  all — which is exactly why it was possible to read `wrangler.jsonc` closely and still be wrong
  about what deploys.

The pattern is the same each time: **the thing that determines behavior lives somewhere a
checkout cannot show you.** `wrangler.jsonc` codifies what it can (`workers_dev`, the apex Custom
Domain) precisely for this reason, and the residue is what these notes are for.

### Don't touch

- **DNS, the registrar, email.** Phase 1 is closed. None of it is back in scope.
- **`content/archive/`, `snapshot/`, `infra/`.** Preservation records from Phases 0–1. Their value is
  being faithful, so reformatting or "improving" them destroys the point. **A `PreToolUse` hook
  (`.claude/hooks/guard-preserved.sh`) refuses a Write or Edit to every path in this list** —
  these three and the three `resources/` entries below — with two exemptions: `snapshot/rendered/`,
  which is derived, and `infra/README.md`, which is the DNS tooling's own live notes and is
  formatted with everything else. Until 2026-09-07 the hook covered only the first two, on exactly
  the paths where an accidental write was least recoverable (#107).
- **`resources/css/` and `resources/js/`** — the old site's stylesheet and scroll handler. Mined in
  Phase 5 and **the only copy**; `snapshot/` has `colors.css` and nothing else. The findings are
  recorded under "What the gate corrected", and the recovered curve was re-examined and retuned in
  Phase 6 — but these are still the only primary sources if anyone reopens that.
- **`resources/WallickAli-Resume.pdf`** — kept deliberately (settled
  [#40](https://github.com/ali-wallick/Portfolio/issues/40)). **The working-tree copy no longer
  carries the PO Box** (2026-08-26) — the address's text block was removed from the content stream,
  not covered with a rectangle, and verified gone by extraction, byte grep and pixel diff. See
  `docs/PRESERVATION.md`. **History was rewritten on 2026-09-18**
  ([#109](https://github.com/ali-wallick/Portfolio/issues/109)) to strip ten blobs from every
  branch and tag: the 2019 PDF and its captures, and the 2016 résumé before it, which carried a
  street address and phone number. `v1-legacy` lost the two résumé files as the accepted cost.
  Every SHA from before that date is dead. The guard's denylist is ten entries, and
  `docs/HISTORY-REWRITE.md` is the record.
- **The address was in HEAD anyway until 2026-09-09, in three files nobody had looked at**
  ([#360](https://github.com/ali-wallick/Portfolio/issues/360)). Redacting the PDF closed one copy;
  a rendered PNG of the same résumé in `snapshot/rendered/`, and the two `docs/before-after/old/`
  résumé captures that photographed the page embedding it, carried it in plain sight while every
  pass looked only at git history. All three are closed — the PNG replaced by a render of the
  redacted PDF, the captures given a labelled bar — and `npm run check:blobs` now fails the build
  on the content of any of the pre-fix blobs, wherever in the tree it lands.
  **The lesson is the reusable part: the first fix for this named a path when the risk was a
  class**, and the very next rebuild reintroduced the address one file over. A path rule is
  necessary and never sufficient; the guard is what closes a class.

_The Phase 0 asset keep/drop list was **acted on in Phase 3**: the 50 keep-listed files moved to
`src/assets/images/`, and the drop list — 86 unused social icons, 6 orphaned logos, and the 6.3 MB
unplayable `nightLight.unity3d` — was deleted at the Phase 3 cleanup commit. **Nothing under `resources/images/`
should ever exist again.** The audit's conclusions are preserved in [#45](https://github.com/ali-wallick/Portfolio/issues/45); the full text is
`git show assets-pre-cleanup:resources/images/ASSET_INVENTORY.md`._

## Rules with no guard behind them

Everything else settled in this repo is caught by something in `npm run verify` if a session gets
it wrong. **These are not.** They are here because breaking one is silent — that is the entire
criterion — and each links to the section that explains it.

**This list was five entries until 2026-09-07, and shrinking it is the point of adding a guard**
([#338](https://github.com/ali-wallick/Portfolio/issues/338)). Two left because they now have one:
the `{' '}` whitespace rule and the line-length rule. **It should not reach zero.** The three below
are judgment about how to reason or how to express a change, not properties of any output, and each
would need a heuristic that fires on correct code — #338 measured that and declined to build them,
the same call #107 made about four of its own candidates.

- **Anything measured about the résumé is measured at 701×960** — import `PRINT_VIEWPORT` from
  `scripts/lib/print-geometry.mjs` rather than deriving it. Three separate passes derived it by
  hand and each returned a confident wrong answer. → [résumé record](docs/decisions/resume.md)
- **A frame is a constant, and the failure mode is a surface list rather than a rule.** Four
  separate passes missed a surface because the treatment was written as a list of selectors
  instead of one rule; a new surface joins the existing selector rather than getting its own copy.
  → [design record, every picture is matted](docs/decisions/design.md)
- **An observed regularity is evidence, not a rule, until someone writes it down.** A pattern was
  once measured across the site's headings and then cited back as a constraint that had never been
  decided, twice, before Ali named it as an accident. →
  [design record, a project's links](docs/decisions/design.md)

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

| Path                                  | What                                                                                                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/content.config.ts`               | The content model. Start here.                                                                                                                             |
| `src/lib/content.ts`                  | Collection queries and the site's year-only date formatting. Month precision lives in `scripts/build-linkedin.mjs`, the only surface that shows it.        |
| `src/config/site.ts`                  | Name, email, nav, social links (audited in Phase 3: LinkedIn `active`, the rest `retired`).                                                                |
| `src/config/resume.ts`                | The resume's Skills section — settled, hand-curated, not derived from `tech`.                                                                              |
| `scripts/check-links.mjs`             | Post-build checks on `dist/`. Every rule is a regression guard for a real old bug.                                                                         |
| `scripts/check-source.mjs`            | The source-tree half: raw colors, raw `px` font sizes, `TODO(#n)`. Needs no build, so it runs before one (#338).                                           |
| `scripts/check-preserved-blobs.mjs`   | Hashes every tracked file against a denylist of the résumé blobs that show a home address (#360). Content, not paths — a path rule is what failed twice.   |
| `scripts/check-line-length.mjs`       | Rendered prose line length against `line-length-baseline.json`. A ratchet, **not** an 80-character ceiling — see its header (#338).                        |
| `scripts/check-links-external.mjs`    | Outbound link liveness. By hand, and monthly via `.github/workflows/link-check.yml`. **Never in `verify` — it files an issue, it never gates a deploy.**   |
| `scripts/report-link-rot.mjs`         | Turns that check's `--report` JSON into exactly one `link-rot` issue. `--dry-run` proves its four transitions without GitHub.                              |
| `scripts/build-pdf.mjs`               | Renders the resume routes to PDF and asserts their page counts.                                                                                            |
| `src/components/ResumeDocument.astro` | The resume. One DOM for both densities; `density` only seeds `data-density`, and CSS hides `[data-full-only]`.                                             |
| `scripts/build-linkedin.mjs`          | Generates `docs/LINKEDIN.md` from the `jobs`/`education` collections.                                                                                      |
| `docs/LINKEDIN.md`                    | Paste-ready LinkedIn copy. Generated — a handoff for Ali, never a sync.                                                                                    |
| `scripts/fetch-posters.mjs`           | Manual: looks up a YouTube video's own poster frame — not a default source for a `poster`, see the #273 section.                                           |
| `scripts/capture-comparison.mjs`      | Manual: before/after screenshots of the old and new site, into `docs/before-after/`. Referenced by nothing else, which is why it's listed.                 |
| `docs/HISTORY-REWRITE.md`             | The #109 history-rewrite runbook, executed 2026-09-18 and kept as the record: the ten blob ids, the text-copy sweep, the three verifications.              |
| `docs/LAUNCH.md`                      | The cutover runbook, executed 2026-08-27 and kept as the record. Routine deploys are the `release` skill.                                                  |
| `docs/decisions/`                     | The reasoning behind every settled decision, in four files by domain. This file carries the rules; that carries the why (#335).                            |
| `docs/before-after/`                  | 32 paired old/new screenshots, plus the README saying which two are redacted and why (#360).                                                               |
| `docs/REBUILD-LOG.md`                 | Running record. The build-in-public page's (#48) source material. The _narrative_, where `docs/decisions/` is the _decision_.                              |
| `infra/README.md`                     | The live zone, the DNS tooling, and Phase 1's record.                                                                                                      |
| `.claude/settings.json`               | The permission allow-list (every npm script a routine job runs, except `update:resume-print`, which rewrites a guard and should prompt) and the two hooks. |
| `.claude/hooks/`                      | `guard-preserved.sh` refuses writes to the Don't-touch paths; `format-on-write.sh` runs Prettier on every file a session writes.                           |
| `.claude/launch.json`                 | Claude Code's dev-server launcher: `npm run dev` on 4321, Astro's default. Referenced by nothing in the repo; kept (#107).                                 |
| GitHub issues                         | What's actually left. Labels, not milestones: `decision`, `needs-ali` and `blocked` do the real work.                                                      |
| `snapshot/`                           | The old site as it stood. The reference for "what did the old page say?"                                                                                   |
