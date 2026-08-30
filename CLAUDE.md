# CLAUDE.md

Standing brief for `aliwallick.com`. Read this before doing anything else in this repo — it exists
so you start informed instead of re-deriving context from scrollback, and so decisions already made
don't get relitigated.

Keep it current. If you make a decision that a future session would otherwise have to guess at,
write it down here.

---

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

**Nothing outside this file restates a decision made in it.** When two documents described the same
decision they drifted — the plan's decisions table still listed Second Dinner's current work under a
phrasing retired below. That is the failure mode the guard table further down exists to rule out.

**Remaining work is tracked as GitHub issues, not in a document.** Most of it carries no
milestone at all — milestones here mark a genuine distinction, not a status label, so once
`Pre-launch` and `Launch` closed at the cutover, `Post-launch` stopped discriminating anything (every
open issue is trivially "after launch" once the domain has moved) and was closed too
(2026-08-28), the same call the Phase 6 gate made when it deleted the stage labels for being a 1:1
echo of their milestone. Two milestones are still active because they mark something a plain issue
list can't: [`Deferred`](https://github.com/ali-wallick/Portfolio/milestone/5) for a `decision` that
isn't ripe yet — blocked on a future event or on there being enough to act on, not simply
deprioritized — and
[`DreamHost renewal deadline`](https://github.com/ali-wallick/Portfolio/milestone/4), a
single-issue milestone tracking the one piece of this project that depends on someone else's
timeline (#52). Each issue carries its source, why it was deferred, and what unblocks it, so a cold
session can pick one up without reading scrollback.

Two labels do real work. **`decision`** marks the four things that block work rather than being work
— they need a call from Ali, not a commit, and several issues are explicitly blocked on them.
**`needs-ali`** marks everything an agent cannot do because Ali is the only source: the 2024–present
Godot detail, the resume's tooling line, the Kaneva title, the DreamHost handoff.

**If you find a follow-up, open an issue.** Don't append it to a doc and don't leave it only
in a `TODO(...)` comment — the comments mark _where in the code_ later work lands, the issues are
what actually gets worked. **Every `TODO(...)` cites its issue number**; keep it that way, so a
marker in the source is never a dead end. Historical markers stay numbered (`TODO(phase-3-revisit)`);
current ones use the stage name (`TODO(launch)`, `TODO(pre-launch)`) since phases stopped being
numbered after Phase 5 — see "Phases" below.

**And keep status out of this file.** The rule, which is why the phase sections below carry
conventions and constraints but no worklists: _if a sentence here would need editing when an issue
closes, it belongs in the issue._ This file says what was **decided**; issues say what is **left**.
Decisions don't go stale, status does — and this is the one document every session reads before
doing anything, which makes it the worst possible place for a sentence that quietly becomes false.
It had five such sections on 2026-08-20, describing work that was already tracked as #32, #33, #35,
#37, #39, #40 and #46.

---

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
| Current work            | **"A new team at Second Dinner, building the studio's first game in Godot."** The studio went public in Aug 2024, so the old "an unannounced mobile title" hedge was vaguer than reality. Corrected twice since — see the Phase 3 gate outcome below for #129 (not "the studio's next team") and #32 (the platform _is_ public; "mobile" is sayable).                                                                                                                                                  |
| Contact form            | None. A `mailto:` and vetted social links. The old PHP form had no CSRF token, no rate limiting, and silently discarded the sender's name.                                                                                                                                                                                                                                                                                                                                                             |
| Visual design           | Deferred to Phase 5, deliberately last.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Canonical hostname      | **The apex is the real address; `www` 301s to it.** Both work — typing `www` lands on the right page, path and query preserved. This is what `site.url`, every `canonical`, every `og:url` and all 23 sitemap entries already say, so nothing on the site changes. Settled 2026-08-26 ([#193](https://github.com/ali-wallick/Portfolio/issues/193)); it needs a zone-level Single Redirect rule, since `_redirects` matches paths and not hosts. Procedure: [`docs/LAUNCH.md`](docs/LAUNCH.md) step 6. |
| URLs                    | Extensionless (`/about`, `/projects/firefall`), matching the old `.htaccess` rewrites, so the pre-launch redirect map stays small.                                                                                                                                                                                                                                                                                                                                                                     |

---

## Phases

Phases 0–5 are the build: they're closed, and the table below is a historical record — don't
relitigate anything in it, and don't rename it. Phase 6's own gate (2026-08-23, below) decided that
what comes after the build isn't more numbered phases — it's three stages named for where they sit
relative to the domain moving, which is the one event with a blast radius outside the repo. Use
**pre-launch / launch / post-launch** for everything from here on; "Phase 6" and "Phase 7" are
retired as names for current work, even though the historical prose below still uses them to
describe what happened during that time.

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
outcome below for why launch doesn't happen just because Pre-launch's milestone is empty.

### Staying in your phase

The most useful thing this file does is stop work leaking across phase boundaries. If you notice
something that belongs to a later stage, **leave a `TODO(...)` comment and move on**. There are a
lot of them in the codebase already; that is the system working, not debt.

- Writing prose for a project page or the bio → Phase 3.
- Resume copy, the printable PDF → Phase 4.
- Picking colors, type, or layout → Phase 5.
- Favicon, OG images, redirects, analytics → Pre-launch.

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
- `.claude/skills/write-copy/` — write or edit any prose on the site in Ali's voice.
- `.claude/skills/content-pass/` — revisit or update a page that already exists.
- `.claude/skills/update-resume/` — add, update, or rebalance resume content.
- `.claude/skills/pre-launch-check/` — the full pre-merge / pre-launch sweep.

One more skill is not about content at all and is listed here because this is where the skill list
lives: `.claude/skills/design-switcher/` — the live-switcher review loop, for a look, motion or
control decision that needs Ali's eye. See "The switcher loop is a skill now" under Design.

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
- **Multi-word headers are title case, not sentence case** (2026-08-26,
  [#182](https://github.com/ali-wallick/Portfolio/issues/182)) — "Featured Work", "What I Built", not
  "Featured work". Use AP/Chicago rules (small function words lowercase unless first/last), not
  every-word-capitalized. Single-word headers and proper-noun `<h1>`s (site name, project titles, job
  titles) are unaffected either way.
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

---

## Phase 3 gate outcome (2026-08-16)

The three gate questions, settled. Do not relitigate these either.

### 1. What is safe to say about Second Dinner

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
characterise the game.

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

### 2. Framing the Marvel Snap credit

Two sections. A short narrative opener (joining as ~11th employee, helping build a company as well as
its first game, three years to launch), then a systems section carrying the engineering weight. The
failure mode to avoid: writing a page about _Marvel Snap_, a game millions of people already know,
instead of a page about Ali's work on it. Assume the reader knows the game.

**Source material — five videos, and the tiering matters.** First-party appearances are Ali's
employer and Marvel putting her on camera, so anything in them is on the record and quotable with no
judgment call. Community appearances are public and fine, but they are entertainment, not source
material about the work.

| Video ID      | What                                                      | Channel              | Weight      |
| ------------- | --------------------------------------------------------- | -------------------- | ----------- |
| `61zjv1HcJDI` | Official Announcement & Gameplay First Look (Ali at 4:16) | Marvel Entertainment | first-party |
| `ntORfECH56s` | "Welcome Ali!" (1:03)                                     | Second Dinner        | first-party |
| `MHqai3bwCoE` | Hellfire Gala Developer Update, December 2023             | MarvelSnap           | first-party |
| `Rw1FWK1yhDk` | The Weekly Snap Show Ep. 01                               | Felicity             | community   |
| `ALvP-EyOkBo` | MARVEL SNAP Pictionary!                                   | Kawa                 | community   |

`MHqai3bwCoE` is the best single source for the systems section — it is Ali explaining her own
feature on the official channel.

#### The Snap systems section — Ali's own account

Five years on one title, in two phases. The arc is the spine of the page:

**Client engineer (early).** Core client-side development in Unity: notifications, localization,
deep linking, and integration with live-ops services — Braze, plus the main-screen carousel.

**Feature engineer (later).** Meta gameplay systems, spanning client _and_ server feature code plus
the UI for it. Also card and deck cosmetics, and the deckbuilding UI and interfaces.

**The four the page should lead with.** Ali originally listed three and filed the MVVM migration as
a cross-cutting aside; it was promoted at the gate with her agreement, because architecture
leadership on a shipped live product is the strongest single item here and the most senior-sounding
without being vague.

1. **Driving a migration to an MVVM architecture**, alongside the push to launch the PC client.
   **Corrected 2026-08-26 (#136), and the correction matters.** This gate recorded it as "arguing
   for it and getting a team to come along", and every surface inherited that: the project page said
   "I argued for a migration", its `summary` and the resume bullet both said "championing"/
   "championed". Ali's own account on reading it back is that there was no argument to win — she
   built out the tooling that made an MVVM architecture practical to adopt, and encouraged teammates
   to migrate their working patterns onto it. That is the same shape as her Kaneva menu animation
   system (build the tool, other teams adopt it), and more concrete than advocacy. **The seniority
   claim survives, it just rests on the tooling and the adoption rather than on winning a debate.**
2. **The PC launch, as a two-stage arc** — and the second stage is the interesting one:
   - Steam **Early Access from the 18 October 2022 global launch** was a _direct port of the mobile
     client_.
   - **Exiting Early Access on 22 August 2023** (announced at Gamescom) meant revisiting much of the
     UI to be landscape-specific and mouse-and-keyboard-specific.

   That second stage is the best UI-engineering story on the page and connects straight back to
   Kaneva and Red 5. Don't flatten it to "shipped the PC version".

3. **Owning localization end to end** — integrating the Unity Localization package, owning the
   process for localizing UI, and the import/export pipeline, fonts, and the rest of it.
4. **Enabling live-ops and marketing to put content in the game** via Braze — the main-screen
   carousel, the news page, and modal pop-ups.

Two notes for whoever writes this. Naming **Braze** and **Unity Localization** is fine: they are
third-party tools, not business internals, and naming your stack is normal engineering writing.
And **this list is explicitly provisional** — Ali flagged that five years is a lot to recall in one
sitting and wants a review pass on the Snap page specifically. Write it as a strong draft, expect
her to add to it, and don't treat her silence on something as evidence it didn't happen.

### 3. Media inventory

The schema requires a `hero` on **every** published project, archive tier included. That is what
actually gates this phase.

| Featured project | Hero                             | Notes                                                                           |
| ---------------- | -------------------------------- | ------------------------------------------------------------------------------- |
| Marvel Snap      | `61zjv1HcJDI` + `start: 256`     | Marvel's own announcement, cued to Ali. Exactly what `start` is for.            |
| Vegas Blvd Slots | `8gtbz_T4-yY`                    | already set                                                                     |
| I Fits I Sits    | ⚠️ **none**                      | Ali to source a capture. Award-certificate photo is a gallery item, not a hero. |
| Firefall         | `2cxeAhxSoyo`                    | already set                                                                     |
| Kaneva           | promote `kaneva/screenshot1.png` | a real shot of the events menu and object panel — the UI she led                |

Every `banner.png` under `resources/images/projects/` is a **600×150 logo strip** from the old page
headers, not a screenshot. Usable as a wordmark, useless as a hero. Don't reach for them.

Archive tier: six entries already carry YouTube heroes; six more (Art of Rescue, Critter³, Dead
Booty, KinoClue, Night Light, Prodigal) have local screenshots to promote — mechanical, no sourcing.

**Asset migration is authorised** (this is the check-in the "Don't touch" rule required): move the
~40 keep-list images from `resources/images/` into `src/assets/` so Astro's `image()` can resolve
them, and act on the inventory's drop list — 86 unused social icons, 6 orphaned logos,
`programming_actionscript.png` (which stays, it fixes the Art of Rescue icon bug), and the 6.3 MB
unplayable `projects/downloads/nightLight.unity3d`.

### 4. Social links audit

Settled: **LinkedIn `active`. Twitter/X, Facebook, and Steam all `retired`.** The X account still
exists but Ali no longer posts there, and a Steam profile is not a professional credit. `pending` is
now an empty state — if nothing else is added, LinkedIn is the only social link on the site, which is
the correct answer for this portfolio.

### Two schema conventions the gate settled

Both are permanent, and both are the kind of thing that gets re-derived wrongly:

- **`endYear` tracks Ali's involvement, not the product's lifespan.** Marvel Snap is `endYear: 2024`
  — the game is still live, she isn't on it. That is the convention for every project here.
- **The Second Dinner progression is two different axes, and the schema models only one.** `roles[]`
  carries official titles. The client-engineer → feature-engineer arc is a _discipline_ change, not
  a title change, so it lives in the Snap write-up's prose where it is about the work rather than
  about HR. **Don't force it into `roles[]`.**

_Everything else this gate left open was closed during Phase 3 execution — the provisional `role`
fields, the `TODO(phase-3-revisit)` sweep, and the I Fits I Sits hero. The one remainder, prototype
shots for the gallery, is [#46](https://github.com/ali-wallick/Portfolio/issues/46), which carries the framing that makes rough captures
acceptable there and nowhere else on the site._

### Phase 3 execution outcome (2026-08-16, merged 2026-08-17)

Executed on branch `phase-3-content`, merged via [PR #7](https://github.com/ali-wallick/Portfolio/pull/7)
at `5a98f2c`. `npm run verify` and `pre-launch-check`'s sweeps pass clean, with zero
`TODO(phase-3-revisit)` markers outstanding. **All five featured projects, all 12 archive entries,
and the career narrative are written and `draft: false`.** Ali reviewed the branch preview and
signed off on every provisional bit along the way — Marvel Snap's systems list, Vegas Blvd Slots'
`role` wording (then "Software Engineer II — live-ops and slot-machine systems"; **superseded
2026-08-24, see the wording pass below**), and It Fits I
Sits' hero, which was the phase's one hard blocker: Ali supplied the Puzzle Cats key art
(`puzzle-cats-banner.webp`) to use as the hero image, captioned to make clear she pitched and
prototyped the concept but didn't work on that shipped release. Lower-quality prototype shots for
inside the page itself are still a nice-to-have, not a blocker — add them to `gallery` if/when they
turn up. Phase 3 is content-complete; what's left before merge is Ali's final look at the PR.

**New decision: a wording/tone/verbosity pass is deferred to Phase 6, not done here.** Phase 3's job
was correctness — every fact true, every page publishable — not final prose polish. Tone and
verbosity should be judged once Phase 5's design exists to read the copy in context, not while
chasing accuracy against old PHP pages and a decade of blog posts. See Phase 6's row above and the
plan file's Phase 6 section. This is not a license to leave rough prose now — the Phase 3 write-ups
are meant to be genuinely publishable as written — it's an acknowledgment that a dedicated read-through
pass still happens once, later, with fresh eyes and real styling.

---

## Phase 4 gate outcome (2026-08-17)

Four questions, settled. Do not relitigate. **This section is the decision record — the rationale for
why the resume works the way it does.** For the mechanics of actually adding or updating resume
content (which files to touch, what to regenerate, what to commit together, the gotchas), use the
`update-resume` skill (`.claude/skills/update-resume/SKILL.md`) instead of re-deriving it here.
Keeping the how-to out of this file is deliberate: a second copy of the mechanism is exactly the kind
of drift the content model's guard table exists to rule out.

### 1. Single source, with real PDF files

**Single-source, and the PDFs are generated at build time** — not a `window.print()` link, and not a
separately designed document. `/resume` and `/resume/full` render from the `jobs` and `education`
collections, printed to PDF with the site's own print stylesheet.

The rejected option is worth naming so it doesn't come back: a hand-designed PDF looks sharper right
up until the first time a job entry changes, and then it is a second copy of every fact on the site.
That is precisely how the old site ended up calling the Marvel game "upcoming" on several pages at
once.

**Open follow-up, Ali's call, deliberately deferred:** if the generated PDF's typography disappoints
in real use, a separately designed document is still on the table as a later swap. Revisit after the
resume has actually been sent to someone. Nothing about the current setup blocks it.

### 2. Both densities, as a superset — not two documents

Ali wanted a one-page _and_ a two-page resume. The schema models it as one list plus an extension:
`highlights` is the one-pager, `highlightsExtended` is appended for the long version. **The two-pager
is a strict superset by construction**, so a bullet can never say one thing on the short version and
something else on the long one — there is only ever one copy of it. `ResumeDocument.astro` is the
only place either version renders; don't add a second component.

A page-count assertion (1 page, 2 pages) fails the build if either overflows — a real guard, not a
formality: bullets accrete, and without it the day someone adds one bullet too many is the day the
"one page" resume quietly becomes two, discovered by a hiring manager rather than by CI. Print
density is already at 9.4pt/1.3, which is normal resume density and close enough to the floor that
further shrinking would show — the fix for an overflow is moving a bullet to `highlightsExtended`,
not shrinking type.

### 3. Weighting and cuts

Front-loaded, and **not** derived straight from source material length — see the revision below for
the current rule. The weighting problem is inverted from what you'd expect, and this is the thing to
remember: the "Source material (2019 resume, verbatim)" sections are _richest for the oldest jobs_.
Kaneva's had two solid bullets to draw from; Second Dinner — the most important entry — had one stale
sentence about "an unannounced mobile Marvel game." **Second Dinner's highlights come from the
Phase 3 Marvel Snap write-up, not from its 2019 bullet.** Writing bullets straight from source
material would have produced a resume weighted backwards.

- **The GPA and Dean's List stay recorded and unrendered.** They are in
  `src/content/education/georgia-tech.md` and `ResumeDocument` deliberately doesn't print `honors`.
  Recording a fact is not the same as showing it.
- **No PO Box.** **Half-superseded 2026-08-26 (#32), and the half that changed is the half that was
  never about privacy.** This used to read "no PO Box, and no home address at all", justified by two
  things: the PO Box is a real exposure (#40, #132), and _there was no sourced current city_. Ali
  supplied one, so the second reason is gone — the header now carries `Orange County, California`
  (`resumeLocation` in `src/config/resume.ts`), which is a metro region and not an address. **The PO
  Box decision is untouched and nothing here reopens it.** (The PO Box was never on the _new_ site. It is
  in `resources/WallickAli-Resume.pdf`, which the old live site still serves and Google has indexed —
  see "The PO Box files" below and [#132](https://github.com/ali-wallick/Portfolio/issues/132).)

### Weighting revisited — recency-weighted, per-job minimums (2026-08-23, closes #37)

The Phase 4 weighting above was a one-time allocation, not a rule — it said what each job got, not
why an older job should get less as newer ones accrete detail. Detailing the 2024–present Second
Dinner era (issue #37) is what forced the question, because that era's new bullets needed room. Ali's
call, and the general rule from here on:

**A job carries a 1-bullet floor in `highlights` (one-pager) and a 2-bullet floor across
`highlights` + `highlightsExtended` combined (two-pager), and space beyond the floor is weighted
toward recency** — a more recent job earns more detail before an older one does. This is why Kaneva
and Red 5 — the two oldest entries — were trimmed to a single one-pager bullet each (their other
bullets moved to `highlightsExtended`, so the two-pager still carries the fuller record) to make room
for Second Dinner's two new 2024–present bullets, rather than demoting an existing Second Dinner
bullet.

**Not a one-time cut — apply this whenever the budget gets tight again.** The oldest job with bullets
still above its floor is where the next trim comes from, not whichever job happens to be already open.

### 4. LinkedIn is a handoff, not a sync

**No agent logs into the account.** The deliverable is `docs/LINKEDIN.md` — paste-ready blocks for
Ali. Its role descriptions are the `highlights` + `highlightsExtended` bullets verbatim, i.e. exactly
`/resume/full`, so LinkedIn stays the same single source rather than becoming a fourth place a fact
can go stale. **Generated, not hand-maintained, since [#54](https://github.com/ali-wallick/Portfolio/issues/54).**

### Promotion years — settled 2026-08-17, do not reopen

- **Second Dinner splits.** Software Engineer II from 2019, Senior Software Engineer I from
  **`2021-12`**. Ali supplied December 2021 and noted that if forced to a single year she'd say 2022
  — a December promotion sits a fortnight from the boundary, so "2021" undersells the senior tenure.
  Month precision makes the rounding moot. **Superseded 2026-08-26 (#32) on where it shows:** this
  used to say the resume was "the only place the date is visible", printing
  `Previously Software Engineer II (2019 – Dec 2021)`. The resume prints the current title only now,
  and years only. `docs/LINKEDIN.md` is where the progression and its month are read.
- **Kaneva stays a single entry**, Ali's call — the progression is fifteen years old and she is
  comfortable with the flattening. **No date is needed to keep one entry**; a year was only ever
  required to _split_ one.

Two things came out of that conversation and are tracked rather than recorded here: the Kaneva
project page says `Lead UI Programmer` while the resume and About say `Software Engineer`
([#38](https://github.com/ali-wallick/Portfolio/issues/38)), and the resume's Tools line is still derived strictly from `tech` fields
([#39](https://github.com/ali-wallick/Portfolio/issues/39)).

**The principle from the Tools line is worth keeping loose from its issue:** the plan mentions
Perforce and CI directionally, and **a planning note is not a source.** Nothing has been added on
its authority. Ask rather than infer.

### Phase 4 closed with the resume factual enough to move on

Ali's call. Two things were deferred as improvements to something already true, not corrections to
something wrong, and both are tracked rather than described here:

- **[#32](https://github.com/ali-wallick/Portfolio/issues/32)** — a tone and layout pass. Phase 4 optimised for _true_ and _fits_, never for how
  it reads on paper.
- **[#35](https://github.com/ali-wallick/Portfolio/issues/35)** — commit the print-geometry differ as a build guard, agreed 2026-08-18 to happen
  as part of that pass.

(A third deferred item, detailing the 2024–present Godot work, was [#37](https://github.com/ali-wallick/Portfolio/issues/37) — closed 2026-08-23. See the
weighting revision above for what shipped.)

**The hazard behind #35 is not a task and belongs here.** `src/styles/resume.css`'s `@media print`
block pins paper by redefining tokens, and it pins only the tokens that existed when it was written
— **a denylist wearing a design system's clothes**, which is the exact failure mode the content
model's guard table exists to rule out. It has bitten twice: 19pt of silent reflow on a document
with a hard 1-page assertion, and 28 elements in the wrong colour via a specificity beat. See the
correction under Phase 5 below, and the token warning under "Working here".

### The PO Box files — settled 2026-08-23, closes #40

Two legacy files carried a PO Box and predated every fact on the current resume, which deliberately
carries no address at all: `resources/WallickAli-Resume.pdf` and `src/assets/images/resume.png`.
Neither was served, and the repo is private — the exposure only existed if this repo goes public,
which the build-in-public page ([#48](https://github.com/ali-wallick/Portfolio/issues/48)) is the
most likely reason to do.

**Ali's call: keep the PDF, delete the PNG.** The PDF is a historical artifact worth keeping around;
the PNG was unreferenced by anything and had no argument for existing at all. The PNG is deleted from
the working tree as of this decision.

**Amended 2026-08-26: the kept PDF is now redacted, and the decision to keep it is unchanged.** Ali's
call after the archive work below turned up a second copy of it. The address is out of the
working-tree file; the original stays in history. This narrows the exposure to the history question
and does not reopen #40.

**Correction, 2026-08-24 ([#132](https://github.com/ali-wallick/Portfolio/issues/132)): "neither was
served" was true of the Astro build and false of the old live site.** `aliwallick.com` serves that
PDF today and Google has indexed it, returning it under a title generated from its own first line —
name, email, and PO Box. The address is public right now, not conditionally public if this repo ever
is. The decision to keep the file stands; what changes is that the remedy is a pre-launch redirect-map
question (#132) rather than a re-check deferred to #48.

**Superseded 2026-08-26: the "strip the PO Box from a copy" option is the one that was taken.** This
paragraph used to say the tree copy was "still carrying a PO Box" and list three remedies. The
working-tree PDF is redacted now (above), so what remains for #48 and
[#109](https://github.com/ali-wallick/Portfolio/issues/109) is only the history question — `git rm`
never removed history, and four blobs plus `v1-legacy` still carry it.

**And the public copies are the larger exposure, not the repo.** See
[#200](https://github.com/ali-wallick/Portfolio/issues/200): archive.org holds **seven** captures of
the PDF, **two of `resources/images/resume.png`** — a rendered image of the same resume, where the
address is simply legible and no redaction is possible — and a 2010 `resume.pdf` carrying a home
street address and phone number. Making the repo public adds little to that until those are dealt
with.

### The Skills section — settled 2026-08-23, closes #39

**Labelled "Skills" and leads the resume, above Experience** — Ali's follow-up call after the PR
shipped it as a "Tools" section at the bottom. Same settled list, same mechanism, same id
(`#skills`) throughout; only the visible heading text and the section's position in the page moved.
The principle below still says "the Tools line" because that's the exact wording it was settled
with — read it as "this section," not as a claim about the current heading text.

**The Tools line is a depth claim, not an exposure claim.** Anything Ali would rather not be
interviewed on doesn't go there; if it's true and interesting it goes in a dated bullet where it
carries scope. Corollary, which did equal work: **the section holds nameable things, not
capabilities.** A skills section that mixes "Godot" with "Localization" is the mush every resume
has — capabilities live in bullets, where they come with evidence. This one rule resolved seven
items identically when the list was cut; see the full record on the
[#39 decision comment](https://github.com/ali-wallick/Portfolio/issues/39#issuecomment-5387852763),
including why C++, DeltaDNA, XML, Perforce, and several tool/store names came off.

Final, settled, do not reopen or re-derive:

|                     |                                            |
| ------------------- | ------------------------------------------ |
| **Engines & Tools** | Unity · Godot · Git · Cursor · Claude Code |
| **Languages**       | C# · GDScript · Lua                        |
| **Platforms**       | iOS · Android · PC                         |

**Mechanism: `src/config/resume.ts`, not a derivation of jobs' `tech`.** Before this decision the
Tools section was derived from every job's `tech` array, deduped — which stopped being able to
produce the right answer once the list needed hand-curation (items dropped, others like Cursor and
Claude Code tracing to no job at all). So **jobs' `tech` field is removed from the content model
entirely**, not repurposed — it had exactly one consumer, and keeping an unread field around is
exactly the kind of dead data the content model's guard table exists to rule out. `resumeTools` is
written by hand, one tool per category key, with TypeScript rejecting a category that isn't one of
the three declared. Full mechanism and the print-height consequence of the change are in the
`update-resume` skill; the shape resolved to a `<dl>` in `ResumeDocument.astro`, no new design
tokens needed.

---

## Design

### Phase 5 gate outcome (2026-08-17)

Four questions, settled. Do not relitigate. The gate's verification step also corrected two facts
that both this file and the plan had been asserting since Phase 2 — see "What the gate corrected"
below, because one of them changes what the phase's signature piece of work actually is.

#### 1. Three directions — two invented, one revival

The plan's suggested spread was playful/toy-like, dense/craft-forward, and editorial. **Editorial is
dropped and replaced by a modern reinterpretation of the old site's own palette.** The remaining
three:

| Direction           | Territory                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------- |
| **Playful / toy**   | Leans into the game-dev identity. Interactive, game-UI-referencing, motion is load-bearing. |
| **Dense / craft**   | Information-dense and restrained. The work speaks; the frame gets out of the way.           |
| **Palette revival** | Warm, saturated, serif-bodied, hard offset shadows — Ali's own 2014 palette, reinterpreted. |

Editorial went rather than one of the others because the revival absorbs most of its territory —
both are type-led, warm, and reading-focused, so keeping both would have spent a branch on near
-duplicate ground. Playful and dense sit furthest from the revival on both energy and density, which
is what makes the three-way comparison worth Ali's time.

**Why the revival is not nostalgia.** The brief that governs this phase is _it should be obvious a
game developer made this and not obvious which template they used._ Every invented direction has to
argue its way to "not a template." A direction derived from a palette Ali chose herself in 2014 is
not-a-template **by construction** — there is no template it could be mistaken for, because the
source is her. See "The old palette is real" below for the actual values and their measured contrast.

#### 2. Type is settled globally; color varies per direction

These are not in tension, and the split is deliberate.

- **Type: a display face for headings, a neutral sans for body, monospace for technical furniture**
  — engines, years, roles, `tech` lists. That last role is doing real work here: a large share of
  this site's content _is_ technical metadata, so mono stops being decoration and starts being
  semantic. The **role assignment is shared across all three directions**; each direction picks its
  own faces. The revival direction adds a fourth voice, a text serif for prose, continuous with the
  old site's use of Georgia for paragraphs.
- **Color is a per-direction variable**, not a decision made up front. It is the axis Ali most wants
  to react to rather than be presented with, and making it vary is what extracts the most information
  from three previews.

#### 3. Motion: shared baseline in tokens, per-direction expression

`--ease` and `--duration` carried the old site's real curve and duration (see the correction below)
on `master` through Phase 5, so **every direction inherited the chase-and-settle character** whether
or not it made a feature of it. (Phase 6 tuned them to the direction that shipped — see "The motion
values are tuned now, not recovered" below. The character is the same family; the numbers are not
the recovered ones any more.) Where that character is most visible is a per-direction choice. This is what
"reinterpret `nav.js`, don't delete it" resolves to concretely.

Ruled out: a literal port. A JavaScript scroll handler reimplementing `position: sticky` in 2026 is
nostalgia, not reinterpretation, and the old implementation's return trip is a bug (below) rather
than an idea worth carrying.

### What the gate corrected

Both corrections came from reading primary sources rather than this file. Both were load-bearing.

#### `nav.js` contains no easing — the personality is four lines of CSS

This file and the plan both described "a hand-rolled easing sticky sidebar built before
`position: sticky` existed." That is wrong in a way that matters. `resources/js/nav.js` does no
interpolation at all — no lerp, no `requestAnimationFrame`. Its `onScrolled()` reads `#MainContent`'s
bounding rect and assigns `quickInfo.style.top` **directly**, on every scroll event.

The easing is in `resources/css/templateStyles.css`:

```css
.scrolled {
  position: relative;
  transition: top 0.5s;
  transition-timing-function: cubic-bezier(0, 0, 0.25, 1);
}
```

So the real mechanism is: **JS retargets `top` on every scroll event, and CSS eases each retarget over
500ms.** Scroll events fire far faster than 500ms, so the sidebar never arrives while the page is
moving — it chases, and settles when scrolling stops. The lag-and-settle is _emergent from a
transition being continuously retriggered_, not a designed animation.

What follows from that:

- **The character is two token values**, not a component: `cubic-bezier(0,0,0.25,1)` and `500ms` — the
  _recovered_ pair, which is what shipped through Phase 5 and what Phase 6 tuned away from. Both
  differ sharply from the Phase 2 placeholders they replaced — the old `--ease` was
  `cubic-bezier(0.2,0,0,1)` and `--duration` was `240ms`. The real curve has **zero ease-in**: it
  launches at full speed and decelerates hard. The real duration is twice as long.
- **The technique generalizes** to anything with a continuously-updating target, which is what makes
  the abstract reinterpretation viable rather than a cop-out.
- **One asymmetry is a bug, not the good idea.** `position: relative` and the transition exist only
  while `.scrolled` is applied, so scrolling back to the top drops the class and the return snaps.
  Don't reproduce it.
- **Nothing else in `nav.js` needs preserving.** The rest is breadcrumbs and nav highlighting, which
  Astro already does natively — `BaseLayout.astro` sets `aria-current` today.

#### The old palette is real, and Phase 3 filed it as cruft

Phase 3 listed `palette.html` and "the unlinked `colors.css`" under dead ends to kill. Correct as
_served files_ — but `snapshot/misc/colors.css` is a Paletton export documenting a color system the
old site genuinely used, and `templateStyles.css` shows it applied throughout:

| Role                   | Value                                             |
| ---------------------- | ------------------------------------------------- |
| Body ground            | `#FFE4C2` warm peach                              |
| Content ground         | `#FFF6EB` cream                                   |
| Section / aside        | `#99C9B3` mint                                    |
| Section shadow         | `-5px 5px 0 #4AA17A` — **hard, no blur**          |
| Headings               | `#006E3C` deep green                              |
| Link / visited / hover | `#9F2B00` rust / `#063E66` navy / `#4A7696` slate |
| Type                   | Trebuchet MS chrome, **Georgia body**             |

**Measured, not assumed** — contrast ratios computed at the gate rather than eyeballed. Body text on
mint is 7.65:1 (AAA) and links on cream are 6.96:1. The only failures are accents: headings on mint
3.45:1, hover 2.63:1, links on mint 4.03:1. **The hues are sound; the accent lightnesses need
retuning.** That is a palette to reinterpret, not to discard, and it is why the revival direction
exists.

### Standing rules (unchanged by the gate)

- `src/styles/tokens.css` holds the **shipped** palette and type scale as of Phase 5. Nothing in it
  is a placeholder any more.
- **Use the variables.** Never write a raw color or a raw `px` font size in a component. Phase 5
  should be a palette-and-type swap, not a hunt through every file.
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
  so a `transition: color` on `a` puts a different colour in the PDF on every build. `resume.css`
  has a universal `transition: none !important` for paper. It is the one rule in that block that is
  not a denylist, on purpose.

### Phase 5 execution outcome (2026-08-20)

**Direction 03, playful / toy, in the arcade-dimmed palette.** Merged via
[PR #19](https://github.com/ali-wallick/Portfolio/pull/19) at `255d582`. Directions 01 (palette
revival, [#12](https://github.com/ali-wallick/Portfolio/pull/12)), 02 (dense / craft,
[#13](https://github.com/ali-wallick/Portfolio/pull/13)) and 04 (the hybrid,
[#18](https://github.com/ali-wallick/Portfolio/pull/18)) are closed. Their branches are kept.

The direction's thesis: **the play is in the interaction layer, not the paint.** A still reads as a
confident, information-dense portfolio; using it makes it obvious a game developer built it. That
was a deliberate answer to the risk the brief named — whimsy undercutting a Marvel Snap credit in
the two seconds a hiring manager spends deciding whether to forward it.

Two devices carry it, each with a rule attached:

- **The reticle.** One element that travels to whatever is pointed at or tabbed to. Rule: it
  decorates, never informs. The native focus ring stays underneath, so keyboard users lose nothing
  if the script never runs.
- **Height.** An unblurred shadow, and **height means pressable**. Nothing decorative gets height,
  which is what stops the device becoming a texture applied to every box on the page.

**Colour is three layers, each with a job** — magenta marks _where you are_ (reticle, focus, current
page), blue marks _where you can go_ (links, and only links), and five status hues mark _what a
thing is_, one per `status` enum value. Adding a status without adding a colour pair falls back to
the neutral pair, which is legible but says nothing. Add both.

#### Two things that were decided twice, and the second answer is the one that stuck

- **The direction was chosen before its colour was.** Ali picked 03 on behaviour while explicitly
  disliking the lilac-and-coral it happened to be built in. Rather than guess, four candidate
  palettes went up behind a live switcher on one preview — because the only comparison that matters
  is flipping between them on the _same_ page, which separate branches make impossible. Arcade won,
  then got five riffs of its own on one axis: how dark its light mode should be.
- **Near-white was the palette at its weakest.** Arcade's identity is saturated accents holding
  their own against a dark ground, and near-white is where magenta and cyan look cheapest. The
  shipped ground is off white with a violet cast lifted from the dark theme — the first version
  where the two themes read as the same site.

#### The print block can be beaten on specificity, not just on omission

**This is a correction to what this file already says**, and it is worth reading before touching
`resume.css` or `tokens.css`. The Phase 4 note below warns that the print block is a denylist which
silently passes any token nobody enumerated. True, and incomplete.

Making a palette the default put **28 elements of the résumé PDF in the wrong colour** — a token the
print block _does_ pin. The block pins on `:root`, specificity (0,1,0); the palette rules were
`:root[data-palette='…']`, (0,2,0). **Media queries do not affect specificity**, so the palette won
on paper. The page-count assertion saw nothing, because colour costs no height.

So: pinning a token is not sufficient. Any selector that outranks a bare `:root` beats the print
block regardless of the media query. The fix used was `@media screen` around the offending rules,
which is a statement about where they may apply at all — scoping the screen half of `resume.css`
inside `@media screen` so screen rules cannot reach paper. **That is the fix to reach for**, and it
is one half of [#35](https://github.com/ali-wallick/Portfolio/issues/35); the other half is a differ that names the offending element rather
than reporting that a number moved.

#### Three soft decisions, deliberately left soft

Ali's framing at the close: _"this is good enough to move on for now."_ **Nothing about them is
wrong** — they are the choices most likely to read differently after living with the site rather
than looking at a comparison page: the faces, the colour calibration at the edges, and the tweening.

All three were booked as one issue and that was a mistake worth naming: they shared a number because
they were deferred in the same conversation, not because they were one activity. The tweening turned
out to be a state-machine change driven by a usability complaint, the faces are a comparison with a
CLS hazard attached, and the calibration is three hand-fitted contrast values. Nothing about doing
one informs doing another. Split on 2026-08-21 — **the tweening, the faces, and the colour
calibration are all settled and closed** (see below). They are the design-scoped
siblings of the wording pass ([#31](https://github.com/ali-wallick/Portfolio/issues/31)) and the
resume tone pass ([#32](https://github.com/ali-wallick/Portfolio/issues/32)); sequencing them is
[#23](https://github.com/ali-wallick/Portfolio/issues/23).

**What generalises, and belongs here rather than in the issue:** `--ease` and `--duration` were the
_old site's_ recovered curve and duration, adopted as a shared baseline across all four directions
and never tuned to this one. **Inheriting a character is not the same as choosing it** — which is
what the section below is the resolution of.

### The motion values are tuned now, not recovered (2026-08-21)

Settled on a live switcher, closing [#33](https://github.com/ali-wallick/Portfolio/issues/33), which
was rescoped to just this. The faces and the colour calibration are separate now, both closed below.

| Token / value             | Was                        | Is                                   | Why                                                                                                                                   |
| ------------------------- | -------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `--duration`              | `500ms` (recovered)        | **`320ms`**                          | 500ms read as sluggish rather than characterful once the reticle made it visible on every hover.                                      |
| `--ease`                  | `cubic-bezier(0,0,0.25,1)` | **`cubic-bezier(0.34,1.28,0.64,1)`** | Same family — launches at full speed, decelerates hard — plus 2.6% overshoot. A descendant of the recovered curve, not a replacement. |
| `--duration-fast`         | `250ms`                    | **unchanged**                        | It was never in the comparison. It used to be half of `--duration` and is now most of it; revisit deliberately, not as a side effect. |
| Reticle idle behaviour    | return home immediately    | **hold 1.6s, then fade, and cut**    | The busyness was the _return trip_, not the acquisitions. See `src/scripts/reticle.ts`.                                               |
| Reticle acquisition dwell | none                       | **25ms**                             | Stops a pointer travelling somewhere else from dragging the brackets through every control it crosses.                                |

**`1.28` is a control-point ordinate, not a peak.** The actual overshoot is 2.6%, measured — which is
what makes the curve safe on the clamped colour transitions in `base.css` (3–6 RGB units for a few
milliseconds). It was _not_ safe on opacity, which is why the reticle's fade has its own curve.

### The faces are confirmed, not changed (2026-08-22)

Closes [#66](https://github.com/ali-wallick/Portfolio/issues/66). Unlike the motion values above,
this is a **no-change decision** — Gabarito, Figtree and DM Mono all held against eleven alternatives
on a live switcher, the same review-loop pattern as the motion and colour switchers before it.

**The option set itself was chosen by measurement, not the catalogue**, per the rule the tweening
pass established — an instrument with two identical marks on it is worse than one with fewer marks.
Nineteen faces were measured headless before any of them went on the switcher; seven were dropped for
landing on a mark another candidate already occupied. That measurement also overturned the stated
reason for DM Mono — `tokens.css` said "narrow enough to survive the metadata strip," but every
credible mono measured is exactly 0.600em per character, DM Mono included. Width discriminates
between none of them; x-height does, and `tokens.css`'s comment is corrected to say so.

**Also checked, at Ali's request: whether any of these read as an AI-generated-site default.** Inter,
Space Grotesk and Geist are the three fonts most commonly named in 2026 discussion of what makes a
site look AI-built — Inter because it's the most-used interface face in the training data and
shadcn/ui's own default, Space Grotesk as "the model's idea of edgy," Geist for its saturation in
v0/Vercel-generated output. None of Gabarito, Figtree or DM Mono turned up on any such list; Space
Grotesk and Geist Mono were in fact two of the eleven alternatives compared and rejected. The
incumbents are unchosen in the sense of "not reconsidered since Phase 5," not in the sense the slop
critique means.

**One finding did not get acted on and is tracked separately, deliberately.** `tokens.css` claimed
`68ch` of Figtree "measures" 40.4rem; it actually measures 43.58rem by two independent methods. The
rendered column is unaffected — the value was signed off visually, not derived from that claim — but
the claim itself is wrong in a comment the file's own header calls load-bearing. Fixing it would have
meant touching `--measure`, which is a layout decision outside what #66 was for, so it is
[#68](https://github.com/ali-wallick/Portfolio/issues/68) instead of a silent edit here.

The switcher — `scripts/preview-fonts.mjs`, the panel in `BaseLayout.astro`, twelve candidate
`@fontsource` packages — was scaffolding for the comparison and is gone; `BaseLayout.astro` is
byte-identical to master again. See the Phase 6 log entry for how it was built and the three bugs
caught while building it.

### The colour calibration is settled (2026-08-22)

Closes [#67](https://github.com/ali-wallick/Portfolio/issues/67). Same review-loop pattern as the
motion values and the faces — a live switcher on one preview, candidates chosen by computing the
axis that actually differs rather than by eye.

Part of #67 had already shipped directly, outside the switcher loop, in a prior look-polish pass:
`--color-plate` went from a 1.67:1/1.77:1 split (fitted to one ground, nearly invisible on another)
to a flat 2.2:1 in both themes. That value went back on the switcher anyway, against four other
ratios (1.8/2.6/3.0/3.4) spanning faint to heavy — **confirmed, not just retuned**, the same
no-change-decision shape as the faces above. 2.2:1 held.

`--color-index` — the `01`/`02` ranking numbers — was the item actually still open: shipped at 5.50:1
through Phase 5, a value hand-fitted to hit a target at the end of that phase rather than derived
from a rule, the same concern the plate had. Compared against 4.5/5.0/6.25/7.0 on the same switcher.
**4.5:1 won** — as quiet as the number can go while still clearing the AA floor for text this file's
own rule holds every other text colour to.

| Token                   | Was                | Is                                            |
| ----------------------- | ------------------ | --------------------------------------------- |
| `--color-index` (light) | `#645f77` (5.50:1) | **`#716c87`** (4.512:1)                       |
| `--color-index` (dark)  | `#8b86a9` (5.22:1) | **`#807ba1`** (4.521:1)                       |
| `--color-plate` (light) | `#9e93c3` (2.2:1)  | **unchanged** — confirmed against four others |
| `--color-plate` (dark)  | `#484180` (2.2:1)  | **unchanged** — confirmed against four others |

**4.512:1, not 4.5:1 exactly.** A target-ratio search lands slightly under-target more often than on
it — the first pass at these candidates computed `#726c87`/`#807aa1` at 4.499:1/4.479:1, both just
_under_ the AA floor the "quiet (AA floor)" label on the switcher promised. Caught before shipping by
requiring the search to find the darkest/lightest value that clears the target rather than the
closest one to it; ratios "close to 4.5" and "at least 4.5" are different questions; the switcher
needed the second one.

The switcher's own scaffolding — the panel in `BaseLayout.astro`, `src/scripts/calibration-data.ts`,
`src/scripts/calibration-panel.ts` — is gone; `BaseLayout.astro` is byte-identical to master again.

**One implementation note worth keeping, since it'll bite the next switcher too.**
prettier-plugin-astro cannot parse a `<script>` with its own multi-statement body when nested
directly inside a `{condition && (…)}` JSX expression — reproduced in isolation across `is:inline`,
`define:vars`, a plain function declaration, and an IIFE, all failing the same way: "Unexpected
token" at the first statement past the opening brace. Neither of the two prior switchers hit it,
probably by accident of how their scripts happened to be shaped. The fix: anything that must run
synchronously and can't be a bare `import` has to be built as a string and injected via
`<Fragment set:html={...}>` rather than written as a literal nested `<script>`; anything that can be
a deferred module stays a single-line `<script>import '...';</script>`, which parses fine because it
has no block body of its own.

---

## Phase 6 gate outcome (2026-08-23)

Two questions, settled together. The second is the reason the "Phases" table above no longer counts
past 5.

### The DNS cutover is its own moment, not the end of a phase

Closes [#21](https://github.com/ali-wallick/Portfolio/issues/21). **Ali's call.** The domain cutover
is a separate, short, deliberate session — favicon, OG, a11y, redirects, the wording pass, and
everything else that used to be "Phase 6" land as they finish, and the cutover happens afterward,
with mail verified on both `ali@` and `contact@aliwallick.com` before and after, per the plan's
standing instruction on [#34](https://github.com/ali-wallick/Portfolio/issues/34).

The reasoning that won: Ali intends to slow down and keep improving the site before actually
launching it. A phase that doesn't close until the domain moves is a phase that never closes under
that plan — better to let the launch basics merge as they finish and treat the cutover as its own
event whenever she's ready for it. [#55](https://github.com/ali-wallick/Portfolio/issues/55)
(re-baseline `verify-dns.sh`) and [#34](https://github.com/ali-wallick/Portfolio/issues/34) can run
whenever Ali decides to launch, independent of whether everything else still open is closed first.

### "Phase 6" and "Phase 7" are retired as names for current work

Ali's motivation, plainly: numbered phases stopped being legible once the build (0–5) was done —
there was no way to tell from "Phase 6" or "Phase 7" what was actually in them without reading this
file. Combined with #21 splitting the cutover out on its own, the natural replacement is a name for
each stage relative to the one event that matters — **pre-launch, launch, post-launch**:

- **Pre-launch** — everything that must be true before the domain moves. What "Phase 6" tracked,
  minus the cutover itself. GitHub milestone `Pre-launch` (was `Phase 6 — Launch`).
- **Launch** — the cutover session itself: #34, #55, and [#74](https://github.com/ali-wallick/Portfolio/issues/74)
  (flip `live` to `true` in the same PR as the cutover). New GitHub milestone `Launch`.
- **Post-launch** — everything after. What "Phase 7" tracked. GitHub milestone `Post-launch` (was
  `Phase 7 — Keep it alive`).

**Stage is tracked by milestone alone, not a matching label.** Phase 6 originally paired each
milestone with an identically-named label (`pre-launch`, `launch`, `post-launch`), but by
2026-08-23 every issue's label was a 1:1 echo of its milestone — pure duplication, and it had
already drifted out of sync on two issues. The three labels were deleted; `decision` and
`needs-ali` stay, since those cut across milestones rather than mirroring one. `launch-blocker`
also stays — coincidentally 1:1 with the Launch milestone today, but conceptually distinct (a
pre-launch issue could someday be a genuine blocker too), so it isn't redundant the way the stage
labels were.

**Phases 0–5 keep their numbers.** They're a closed historical record — each has a dated gate
outcome and an execution outcome below, and renaming them buys nothing while breaking every
cross-reference to "Phase 3", "Phase 4", "Phase 5" in this file and in old issues. Only the _current_
and _future_ work gets the new vocabulary. Historical prose that describes what happened during the
old "Phase 6" or "Phase 7" window (the motion-values tuning, the faces switcher, REBUILD-LOG.md's
own phase entries) is untouched — it's describing the past, not naming ongoing work.

---

## The wording pass (2026-08-24)

The sitewide tone and voice pass ([#31](https://github.com/ali-wallick/Portfolio/issues/31),
[#32](https://github.com/ali-wallick/Portfolio/issues/32)), run against the measured voice reference
in the `write-copy` skill. **The pass itself is an edit pass and left every fact alone**, so most of
it needs no record here. Four things do, because a future session would otherwise re-derive them
wrongly or reinstate them.

**Ali's mean sentence is 17 words and the site's was 32. That gap is now closed** — the six prose
surfaces in #31's scope measure 16.4. The number is not a target to hit again on every future edit;
it is the reason the copy reads the way it does, so **don't "improve" a page by re-consolidating
short sentences into long ones.** Same for the em dash: zero in visible page prose now, and that is
deliberate rather than incidental.

**`role` fields carry the title only, not a scope.** Vegas Blvd Slots' `role` was
`Software Engineer II — live-ops and slot-machine systems`, signed off at the Phase 3 gate and
**superseded by Ali on 2026-08-24**: it is now just `Software Engineer II`. The scope was doing the
prose's job in a metadata slot. This supersedes the Phase 3 execution note above.

**And `role` is an array as of 2026-08-27** ([#152](https://github.com/ali-wallick/Portfolio/issues/152),
decided in the [PR #151](https://github.com/ali-wallick/Portfolio/pull/151) review thread). It was
the one multi-value field on a project modelled as free text, so `Designer, Artist` was a
hand-joined string that only looked structured. Rendered output is unchanged — `ProjectMeta.astro`
joins with `, `, and a one-hat role is simply a one-item array. **The join is deliberately not the
meta strip's `·`**, which separates metadata _categories_; inside `role` it would read
"Georgia Tech · Designer · Artist" as three independent facts rather than a location and a two-part
role. This also makes the title-only rule above structural rather than a convention: a scope clause
was easy to append to a string and is conspicuous as an array element.

**Correction, 2026-08-24 (#97): that change was not "the last em dash in visible copy," as this file
claimed until now.** Five `role` fields carried the same em-dash-plus-scope shape, all of them
rendered in the meta strip on `/projects` and on each project page. Prodigal's was trimmed with #97
(`Solo — design, programming, and art` → `Solo developer`). Four remained at the time — art-of-rescue
(#89), critter-3 (#91), secret-garden (#98), tilting-at-windmills (#99) — and each was resolved on
its own page's content pass rather than in a sweep; no `role` field carries an em dash today. The
sitewide claim was checked by walking the
rendered DOM, not by reading the source — **the `<title>`/`og:title` template
(`{title} — Ali Wallick`) also carries one on all 23 routes, and it stays**: it is a structural
separator, not prose.

**The Kaneva eleven-menu list stays.** The voice reference calls out "undirected list-dumping" as a
habit not to carry forward, which made the list look like a cut. **Ali's call: keep it.** It is the
only concrete evidence of that job's scope. The wording pass split the 70-word sentence into three
and changed nothing else about it. Don't propose cutting it again.

**The 404's missing space was an Astro whitespace bug, and it was real.** `main` rendered
`or head<a href="/">home</a>` with no space at all. **Astro strips the whitespace between a text
node and a following element when a newline separates them**, so `or head` sitting at the end of a
line and `<a href="/">home</a>` starting the next produced one word. This is why `about.astro` is
full of `{' '}` — a previous session already knew, and nothing wrote it down. A scan of every
`.astro` file on 2026-08-24 found no other instance, in either direction. **When a line has to wrap
between text and an inline element, use `{' '}`, never a bare line break.**

**"Fifteen years" is the homepage's number, not every page's.** It stays in the homepage lede and
meta description. `/about` gives the start year (2011) instead, because four occurrences of one
number across the site read as a tic.

### The About page's job list is gone, and so is `jobs[].summary` (2026-08-26, closes #135, #141)

Ali flagged during the wording pass that she expected to cull `/about`'s "Where I've worked" list
eventually, since it duplicated the resume's job — filed as #135 and left for later. Revisited
directly as #141's content pass rather than deferred further: **the section is cut, not shrunk.**
The career paragraph is now the only work overview on the page, and it links each era (Kaneva,
Firefall, Vegas Blvd Slots, Marvel Snap) to that project's page instead of restating title/company/
dates a second time.

**`jobs[].summary` came out of the content model entirely**, same precedent as dropping `tech` from
jobs for #39: the field existed to feed this one section, nothing else ever rendered it, and once
the section was gone it would have been unread data. Don't reintroduce a per-job summary field
without a second consumer for it.

**The page also picked up material only Ali could supply**, prompted by a direct interview rather
than mined from `snapshot/` or `content/archive/` — most of the old page's content predates 2015 and
a re-read alone wasn't going to surface what's true now. New: a paragraph on speaking (a deck for a
Girl Scout troop, a college class talk on the job itself and imposter syndrome, both call back to
her first two panels in 2013 — see `content/archive/2013-10-25-my-first-2-panels.md`), her husband
Robert (also a software engineer, met at Georgia Tech, replacing a generic "took every game dev
class" sentence in the origin paragraph), an Instagram link for cooking/baking, and a second
"Off the clock" paragraph on Dragon Con (20-plus years, not just the one cosplay win) and five years
on the board of her synagogue, University Synagogue in Orange County. The origin paragraph was also
trimmed on Ali's agreement that leading the page with a decade-plus-old story "isn't ideal anymore" —
not removed, just lighter.

### Every photograph illustrates the prose beside it (2026-08-27, closes #181)

The rule the photo pass settled, and the one worth carrying forward: **a photograph on this site
earns its slot by illustrating the sentences next to it, not by being a nice picture of Ali.** It
decided every placement below, including the two that lost.

| Where                   | What                            | Illustrating                                                           |
| ----------------------- | ------------------------------- | ---------------------------------------------------------------------- |
| `/` hero                | The headshot                    | The share card's own promise, below                                    |
| `/about` top            | Ali as a kid holding a game box | "I got interested in games young"                                      |
| `/about` Off the Clock  | A cosplay she made              | "Costuming is one of the hands-on, creative things I gravitate toward" |
| `/projects/marvel-snap` | Second Dinner, 2019             | "I joined … as its 11th employee", the page's opening line             |

**The homepage was under-delivering on its own OG card.** `buildBrandCard()` has composited
`me.jpg` into `/og/home.jpg` since #70, so sharing `/` put Ali's face beside her name while the page
itself ran text-only to the first project thumbnail. That mismatch, not "the page looks bare", is
what #181 actually was.

**The 2019 studio photo lost `/about` and won Marvel Snap on the same rule.** It is a work photo,
and the claim it evidences — 11th employee, before the studio had shipped anything — is that page's
opening sentence. On `/about` it would have sat in a career paragraph that gives four studios equal
billing. It is the only evidence anywhere on the site for a claim that also appears on `/about` and
the résumé. **Caption it as the studio, never as the Snap team**: the game was unannounced in 2019.

**`/about` deliberately carries no current photo of Ali.** Both images on it are her, from roughly
1997 and 2019. The homepage carries the current one and every OG card leads with it. Flagged to Ali
three times and left as-is each time, so it is a decision rather than an oversight.

**Two candidates were declined and should not be rediscovered.** A **family photo** for Off the
Clock: it is the one candidate that is purely personal rather than also evidence for something the
page argues, and it would have put a minor on a public site — a call for Ali, not a design question.
A **Zion Narrows hiking shot**, which lost to the cosplay because a costume is something she _made_
and a hike is a place she went; that slot is the only image on the site of her making something with
her hands outside work, which is the non-work register of the "logic of programming and creativity
of design" thesis recorded above. The honest cost, since it is a real one: every image on the site
is now games-adjacent.

**The Kerbal shot (`me2.jpg`) is unreferenced and kept on purpose.** It is the costume the award
sentence names, but Ali is not visibly in it — which stopped being acceptable once the headshot left
the page. She may redo it, so the asset stays rather than being cleaned up as dead.

**The homepage hero has two layouts on purpose, and unifying them was measured and rejected.**
They answer different questions. Narrow sizes the photo to a **text span** — a right float topped
out level with the eyebrow and running to the bottom of the name, 94px measured on a 390px phone —
so the lede wraps around it. Wide sizes it as a **portrait**, 13rem in a grid, balanced against the
"currently" module's right edge. A single float at every width gets close: eyebrow, name and photo
land on identical coordinates at 1280px. But it drops the "currently" module 12px, because a
float-contained block sizes to the float rather than to grid rows, and it changes the lede's
constraint from the grid column (592px) to `--measure` (646px). That is a visible change to the
layout Ali signed off on, bought to smooth a transition only someone resizing a desktop window
sees. **The binding constraint on the narrow half is the name, not the photo**: at 320px
"Ali Wallick" has 3px of slack beside the photo, so growing it or lengthening `site.name` wraps it.

**One layout fact, because the slot now takes mixed aspect ratios.** `.aside-figure` caps on
**height, not width**. Sized to a shared width, a portrait source ran 375px tall against the
near-square one's 231px — taller than the section it floats in, so it overhung the footer. A
portrait source also needs `.aside-figure-crop`, and `aspect-ratio` there must have a definite
`height` to resolve against: with both dimensions `auto` the image silently collapses to 2×2 rather
than failing loudly.

## The resume formality pass (2026-08-26, closes #32)

Ali's brief: **"significantly more formal" than the rest of the site.** Distinct from #31, which
tuned site prose toward her own measured voice. The resume is a different genre, and the target is
her own 2019 resume, not her blog.

**The bullets are labelled now, and the format is recovered rather than invented.** Every bullet is
`{ label, text }` in the schema and renders as **`Label:`** plus a clipped formal clause. Ali's 2019
resume was built exactly this way ("Vegas Blvd Slots:", "UI Programming:", "Client Engineering:"),
which makes it the same argument the Phase 5 palette revival ran on: a format Ali chose herself
cannot be mistaken for a template. `resources/WallickAli-Resume.pdf` is the only copy of that document
outside git history, and it has to be decoded to read — it is a subset-font PDF, so `grep` gets
nothing and the machine has no `pdftotext`. (`pdfjs-dist` decodes it fine via its ToUnicode map;
"undecodable" was only ever true of the shell tools to hand. See `docs/PRESERVATION.md`.) Ali picked this over a wording-only alternative that kept the
current unlabelled shape.

**Bullet labels are title case, and that is recovered too** (2026-08-26, Ali's question, same
pass). Every label in the "Source material (2019 resume, verbatim)" sections of the four job files
is title case -- `UI Programming`, `Client Engineering`, `Unreleased Casino` -- so the format's
own primary source settles the casing along with the shape. It also removes an inconsistency the
sentence-case version could not avoid: proper-noun labels (`Vegas Blvd Slots`, `Hot Streak Slots`)
are title case whether you like it or not, and `Unreleased casino` sitting beside them read as a
sentence fragment rather than the name of a thing.

**This is a separate rule from [#182](https://github.com/ali-wallick/Portfolio/issues/182)**, which
title-cased multi-word _headers_ and is scoped to headings. A run-in `<b>` label inside an `<li>` is
not a header, so #182 did not reach these and does not govern them; the 2019 resume does. Same
AP/Chicago rules apply (`Live-Ops Content`, `Cross-Cutting Work`). Costs nothing -- measured at
701px, zero bullets rewrap and both documents are byte-for-byte the same height.

**Structural, not `**Markdown**` in the string.** Bullets render as `{h}` and never touch a Markdown
pipeline, so `**` would print literally on paper. A required field also makes the format
unrepresentable to get wrong, and `max(28)` on the label makes the build fail rather than letting a
label grow into a sentence. Same reasoning as `resumeTools` being a `Record` keyed by category.

**Two `full`-only sections came back, both dropped in Phase 4 and both in Ali's 2019 original.** Her
call, and the split matters: `resumeSummary` and `resumePersonalProjects` (`src/config/resume.ts`)
appear on `/resume/full` and **not** on the one-pager. A summary on the one-pager restates the title
line directly above it, and 2011 jam entries compete badly for space against 2024 work. On the
two-pager both have room. Personal Projects is hand-curated rather than derived from the `projects`
collection because the achievements live in those files' prose bodies (there is no `award` field,
and adding one to serve a single consumer is the `tech`-field mistake from #39 again).

**Game Over Ever After was a fourth entry and Ali cut it (2026-08-26).** Her 2019 resume listed it,
which is why it was there. It was also the only entry with no page to link, having been removed from
the collection at `906efc9` (#61) for lack of a `hero`. Cutting it means every _project_ in the
section now links to its own page. **Don't restore it from the 2019 resume** on the theory that it
only went for lack of media.

**The resume prints the current title only, and years only** (Ali's follow-up on the same pass). The
`· Previously Software Engineer II (2019 – Dec 2021)` line is gone, and with it the last month on the
page — which is what made Red 5's sourced `2015-06` read as an inconsistency rather than as
precision, so job spans are year-only now. **Neither fact was deleted, only unrendered here**, the
same shape as `honors` on the education entry: `roles[]` and both stored months are still read by
`docs/LINKEDIN.md`, where LinkedIn models multiple positions under one company natively and its date
fields take a month. See the supersession note under "Promotion years" above.

**A bullet may carry an `extended` continuation, shown only on the two-pager** (2026-08-26, Ali's
call). Kaneva's one-pager bullet is now a single `UI programming` entry with the menu-animation
system folded into it, and Firefall's drops its enumeration of specific screens; both expand on
`/resume/full`, where the detail is worth the space.

**The shape matters more than the two edits.** The obvious way to do this is a `highlightsConcise`
that _replaces_ `highlights` on the one-pager, and that is exactly the two-lists shape
`highlightsExtended` was designed to rule out: two copies of one claim, free to drift. `extended`
_continues_ `text` instead, so the long version is still literally the short one plus more and each
fact is still written once. **If a bullet's short and long forms would need to say different things
rather than one saying more, that is two bullets, not this field.**

Ali asked for Firefall to come down from three lines to two. On paper it was already two (the
enumerated version and the trimmed one both filled two lines at 701px) — three is what it renders at
on a phone, and roughly what the HTML page shows in a narrow window. Cutting the enumeration left
`overhaul.` orphaned alone on line two, so it was tightened by one further word to fit **one** clean
line. Worth knowing generally: **a line count is a property of a viewport, not of a sentence**, and
the resume has three that differ.

**Per-entry locations are gone from the one-pager, and the header states the region once** (Ali's
call, same pass). Three of the four jobs said "Irvine, CA", so the column was mostly repetition. The
two-pager keeps them, which also keeps `full` a strict superset of `concise`. **Worth 78px**, which
is what turned the density question below from closed into open.

### Second Dinner renders as grouped blocks, and the group carries three tiers

Ali's call, 2026-08-26, and it is the structure the rest of that job's wording depends on. Phase 4
rendered seven years under one employer as one undifferentiated run of bullets, so the reader had to
infer from the word "Godot" in bullet six that the last two were not also about Marvel Snap.
`bulletGroups` (see `src/content.config.ts`) splits it into a block per body of work, newest first.

**Three tiers, and which density each renders on is the part worth knowing:**

- **`intro` on the job** — what belongs to the employer rather than to either game. Both densities.
- **`bulletGroups[key].label`** — the group heading. Both densities.
- **`bulletGroups[key].intro`** — a subtitle for the span. **Both densities**, because it is a fact
  about the whole body of work rather than extra detail.
- **`bulletGroups[key].dates`** — `/resume/full` only. The job's own span sits directly overhead on
  the one-pager, and a second date column under it reads as clutter at that density.

**Grouping happens at render, ordered by first appearance in `highlights`, not by declaration order
in `bulletGroups`.** Resequencing the resume means moving a bullet and nothing else. It is also what
keeps a `highlightsExtended` bullet inside its own group on the two-pager rather than stranded after
every group, which would have printed "Marvel Snap" as a heading twice.

**A group `intro` is not a free place to put a fact.** It renders on both densities, and the Marvel
Snap one sits at four characters of headroom — which is why the awards went in as their own
`highlightsExtended` bullet instead of onto the end of it. When something belongs to the two-pager
only, a bullet is the mechanism; the subtitle is not.

**And the awards name their subject, against the register.** Every other bullet drops it and starts
with a verb. "Marvel Snap won Best Mobile Game" keeps it deliberately, because a subjectless "Won
Best Mobile Game" reads as a personal award. Both awards are for best _mobile_ game, which is also
why they are not a continuation of the PC launch bullet — that would attach them to the one release
they are not about.

### The density question, measured twice and deliberately not acted on

**#32 assumed the print density was "tuned to fit, not chosen" and asked whether it should loosen.
It cannot, and the measurement that briefly said otherwise was an artifact.** Probed at Playwright's
default 1280px viewport, the one-pager reported 740px of a 960px budget, which looked like 2.3
inches of slack; prose wraps to far fewer lines at 1280px than on paper, so the real number was
~200px higher and the conclusion inverted. Raising the type to 11pt on that basis overflowed both
documents, and `build-pdf.mjs`'s page-count assertion caught it.

**Measure at 701px** — letter's 8.5in less `@page`'s 0.6in side margins, times 96 — against a 960px
height budget. That first put the one-pager at **954px into 960px**: six pixels, and the honest
lever really was fewer bullets, exactly as #32 assumed.

**Then the document got shorter twice** — the "Previously ..." line and the per-entry locations, both
above — and it now renders **858px into 960px**. About 102px, or five bullet lines. So a density bump
is available where it wasn't: 9.75pt/1.3 fits comfortably, 10.25pt/1.3 fits exactly and leaves
nothing.

**Not taken, on purpose.** 9.4 → 9.75pt is a 3.7% change nobody perceives, and 10.25pt spends every
pixel of the new headroom to buy it, which is how a one-pager silently becomes two the next time a
bullet lands. The 102px is banked as slack. `src/styles/resume.css` carries the scaled-set table, so
if Ali wants the bump the cost is already priced.

### The print-geometry differ was measuring the wrong width (2026-08-26)

Found while trimming a bullet, and it is the third viewport trap in one pass, so the lesson is the
generalisable part. `scripts/check-resume-print.mjs` set **no viewport**, so it ran at Playwright's
default 1280px while emulating print media — _print CSS at a screen width_, a rendering that exists
on no page and no sheet of paper.

It still caught everything [#35](https://github.com/ali-wallick/Portfolio/issues/35) built it for,
because colour, font, weight and tracking leaks are width-independent. **Reflow is not.** Cutting the
I Fits I Sits bullet from three printed lines to two moved **zero** elements in the differ, because
at 1280px both versions occupied the same two lines. Fixed to 701px, the same edit moves **92**.

**The rule, now stated in three places because it caught three different things:** anything measured
about this document is measured at 701px — letter's 8.5in less `@page`'s 0.6in side margins, times
96 — against a 960px height budget. The density probe got it wrong and inverted a conclusion, the
skill's guidance got it wrong, and the guard itself got it wrong.

### Two things this pass deliberately did not do

- **The apostrophes.** #32 listed them, and the honest answer is that they are not a resume problem.
  YAML front matter does not go through Astro's smartypants, so the resume renders straight
  apostrophes while Markdown project bodies render curly ones. The resume is internally consistent;
  the mismatch is sitewide. `docs/REBUILD-LOG.md`'s original note already warned that fixing only
  the resume creates a _third_ state, and that is still true, so this is
  [#188](https://github.com/ali-wallick/Portfolio/issues/188) rather than a silent edit here.
  **Settled there on 2026-08-26 — curly everywhere. See the convention under "Voice and content
  conventions" above.**
- **Raising the density**, above. Measured, costed, and left with Ali.

### `docs/LINKEDIN.md`'s hand-authored About was never reached by #31

Worth recording because it is a class of miss, not a one-off. #31 walked the site's rendered pages;
`ABOUT` and `HEADLINE_OPTIONS` live in `scripts/build-linkedin.mjs`, so they were never in scope and
still carried three em dashes and the exact "taught me a lesson" closer `write-copy` §3 bans by name
(the old closing paragraph stacked a thesis-colon, a "not X, but Y" antithesis, and the moral, all
three at once). Reworded here. **Its register stays warmer than the resume and cooler than the
blog** — LinkedIn's About is first person and takes contractions, and the formality pass applies to
the derived bullets, not to it. `resumeSummary` and `ABOUT` are the two places a career-level claim
is _written_ rather than derived, which makes them the two places one can drift; each now points at
the other.

**It missed again on #32, which is the proof the "class of miss" framing was right.** The formality
pass reworked the Second Dinner `intro` away from "before the studio had shipped a title" and
`ABOUT` kept the retired phrasing, because #32 walked the resume and `ABOUT` is not on it. Caught by
the two-page pass below and corrected to the same interviewing-and-culture framing. **Treat `ABOUT`
as in scope for any pass that changes a career-level claim anywhere**, even one scoped to a document
it isn't part of -- it is hand-authored, so no generator will catch the drift for you.

---

## The two-page pass (2026-08-26)

The `/resume/full`-only content brought to the register the formality pass (#32) established for the
one-pager: the Summary, Personal Projects, every `highlightsExtended` bullet, and every `extended`
continuation. Shipped on [PR #192](https://github.com/ali-wallick/Portfolio/pull/192). **The
one-pager was not touched** -- its half of `scripts/resume-print-baseline.json` came out
byte-identical, which is the check worth repeating on any pass that claims to be long-version-only.

Four decisions a future session would otherwise re-derive wrongly.

**The Summary is an _orientation_ summary, and the overlap is chosen, not tolerated.** Ali picked it
over a "through-line" alternative that said what no entry says -- the pattern across four studios,
UI and the tooling other people build on -- which read more like a pitch than a resume line. So a
skimmer who reads only the Summary is meant to leave with the current role and the headline credit,
and restating the entries below it is the job. **What is still a bug is restating a _sentence_.** It
ended on the Godot group's `intro` almost word for word, fifteen printed lines above the original.
Don't "fix" the remaining overlap; do keep the phrasings apart.

**Personal Projects are verb-first past tense, same register as a job bullet**, and the verbs are
sourced from each project's `role` rather than inferred -- both jam entries were seven-person teams,
so "Built" would have overclaimed. The entries used to be noun phrases and were not consistent with
each other.

**The Kaneva menu list splits by audience, and it took three shapes to get there.** It was spread
across `UI Programming` and an `Additional UI` bullet two positions away; folding it into one bullet
fixed a label named for its place on the page and produced a six-line wall, the heaviest bullet on
either density; splitting it on the seam the Kaneva project page already uses -- menus everyone sees
in `UI Programming`, menus for players _building_ the world in `Creator Tools` -- gave the same six
lines with two subjects. **The list itself is settled and nothing was cut**; only its shape moved.
`Creator Tools` also puts the resume's tooling through-line at its earliest point, which no surface
said before.

**A bullet label repeating across two `bulletGroups` is acceptable, and can be signal.**
`Client Engineering` appears under both Second Dinner groups. With separate headings and date ranges
it reads as the same competency at two points rather than a copy-paste -- the same argument the
Phase 3 gate makes for the Marvel Snap `Tooling` bullet being worth a reader seeing twice. Don't
rename either one.

### Declined on purpose, so nobody "discovers" them later

- **A `HUD Overhaul` bullet.** The Kaneva project page carries a dated lead-scope claim -- "In 2014,
  I led a full overhaul of the HUD, from the code design document through to release" -- that is on
  neither density. Drafted at one printed line and **declined by Ali**, not overlooked. If it is ever
  reconsidered, one thing needs asking first: the page says "the HUD" while the menu list says
  "player and build/creator HUD menus", so whether the overhaul covers both is unsourced.
- **The longer `I Fits I Sits` continuation**, carrying "let level designers work in parallel instead
  of waiting on engineering for each level" -- the strongest tooling-value claim on that page. Costs
  a fifth printed line; the shorter version won.

### The `extended` contract is easy to violate and easy to miss

`I Fits I Sits` shipped an `extended` that restated its own `text` (the team authoring 61 levels,
said twice), which `src/content.config.ts` explicitly forbids -- `extended` must _continue_ `text`,
never restate it. It survived #32 because the two halves only ever render adjacently on one of the
two documents. **When editing a bullet with an `extended`, read `text` and `extended` as one
sentence-stream**, which is what `/resume/full` actually prints.

---

## The resume print face is Public Sans, not `system-ui` (2026-08-27, closes #191)

Item 2 of #191, the thing item 1 (`check:resume-print` in CI) was blocked on. `resume.css` pinned the
print block's `--font-body` to `system-ui`, which is not a decision, it's an accident of whichever
machine last rendered the PDF: SF Pro on Ali's Mac, DejaVu Sans on Linux — measured, and DejaVu is
wide enough to overflow the one-pager to two pages. Worse, **SF Pro was never licensed for this use**
— Apple's font license restricts it to Apple-platform software and marketing, and a resume PDF
handed to a hiring manager is neither. The committed PDFs were carrying an unlicensed embed by
accident, not by choice.

**Public Sans, Ali's call, sans-serif ruled in from the start.** Compared against Source Sans 3, IBM
Plex Sans, Source Serif 4 (dropped immediately — "definitely stick with sans serif"), then Arimo and
Work Sans once Public Sans and IBM Plex Sans emerged as the front-runners. All are OFL-licensed and
self-hostable. Public Sans won on fit with Ali's own taste ("more of a Helvetica fan") — it's USWDS's
purpose-built free Helvetica substitute for exactly this kind of formal document, so it's a face
chosen on the same "not a template, because we picked it" logic as the palette revival and the #66
face confirmation, not a default reached for because it was there.

**Work Sans is out, and how it got caught is worth keeping.** `build-pdf.mjs`'s page-count assertion
(`page.pdf()` via Chromium's real `@page` pagination) reported Work Sans at a clean 1/1 pages — and
it was wrong. Measured against the real budget this file already established under "The density
question, measured twice and deliberately not acted on" (701×960, letter width minus `@page`'s side
margins), Work Sans's content ran 1024px into a 960px budget, 64px over. Chromium's print pagination
is apparently more forgiving right at the page-break threshold than the actual layout budget is. The
page-count check alone would have shipped a resume quietly missing its bottom margin. **This is the
701×960 rule paying for itself a second time** — measure anything about this document at that
viewport, not by trusting a page count in isolation.

**Public Sans measured 928px — 32px under budget, and within 5px of what the SF Pro accident was
already fitting.** Near-zero reflow risk relative to the document everyone has already been looking
at.

**Mechanism: self-hosted via `@fontsource`, imported only on the two resume routes, not
`BaseLayout`.** `src/pages/resume.astro` and `src/pages/resume/full.astro` each import
`@fontsource/public-sans/latin-400.css` and `latin-700.css` directly — the same "self-hosted, latin
subset" pattern `BaseLayout` uses for the screen faces, just scoped narrower, because Public Sans has
no reason to load on any other page. It has zero effect on-screen: `resume.css`'s `@media print`
block is the only place `--font-body` points at it, so the on-screen `/resume` page still reads in
Figtree, unchanged. What changes is that Chromium now embeds the same font file everywhere the PDF is
rendered, instead of resolving `system-ui` to whatever the machine happens to have.

**That's what actually unblocks item 1.** `scripts/resume-print-baseline.json` was recorded on macOS
against a font that rendered differently on Linux; it's re-baselined against Public Sans now, and
`check:resume-print` is in `.github/workflows/ci.yml`. A real reflow or style leak still fails CI; a
platform font substitution can't produce a false positive any more, because there's no longer a
platform-dependent font in the loop.

**Correction, same day, from this guard's first real CI run: identical font file is not identical
rendering.** `check:resume-print` went red on `ubuntu-latest` anyway — not from a font substitution,
but because CoreText (macOS) and FreeType (Linux) hint and shape the _same_ embedded Public Sans
file slightly differently. Every diff was a text element's `x`/`width` shifting by a few percent
(topping out ~4.8%), with zero `y` or `height` diffs — nothing actually wrapped differently, no
colour or weight changed. `check-resume-print.mjs` now tolerates that specific, bounded drift (a
relative width/x tolerance, kept tight on `y`/`height` so a genuine reflow still fails loudly) rather
than either loosening the guard wholesale or chasing pixel parity across two font-rasterization
engines that were never going to have it. Worth knowing generally: "self-hosted, same file, every
machine" solves _which_ font loads; it doesn't solve exactly how the OS text engine draws it.

## The resume switches density in place (2026-08-29)

Ali's pick from four options, chosen over cross-document view transitions between the two routes.
`/resume` now toggles between the one-pager and two-pager in place instead of navigating: a
segmented control flips `data-density` on the article, the document grows into its long form, the
URL becomes `/resume#full`, and the PDF link follows. The mechanism a future session needs to know:

- **Both densities ship in one DOM.** `ResumeDocument` renders the full superset always; full-only
  nodes carry `data-full-only`, and `.resume[data-density='concise'] [data-full-only]
{ display: none }` in `resume.css` decides visibility. That rule is deliberately the ONE rule in
  the file outside both `@media` blocks — it governs screen and paper alike, so printing a page
  prints the density on screen, and `build-pdf.mjs`'s fresh hash-less navigation of `/resume` still
  prints concise. Don't move it inside a media query.
- **This makes the superset property load-bearing in the UI, not just the schema.** Concise is
  literally the full DOM minus hidden nodes. If a bullet ever needed to say _different_ things at
  the two densities (which `content.config.ts` already forbids), the toggle would need a
  concise-only/full-only node pair, not a schema loosening.
- **`/resume/full` stays, unchanged in role: the no-JS fallback and the source of
  `resume-full.pdf`.** It loads no script; its switch links are plain navigation. The shareable
  two-pager URL for humans is still `/resume/full` — a no-JS visitor handed `/resume#full` sees
  concise, which is the accepted cost of hash state.
- **The enhancement script's init must never write to the article** (`src/scripts/
resume-density.ts`, which is in `build-pdf.mjs`'s `byteHashedFiles` for exactly this reason —
  a future on-load flip would silently change the committed PDF). The `#full` deep link is applied
  by a tiny `is:inline` script in `resume.astro` before first paint; the module only syncs the
  controls.
- **The animation is `document.startViewTransition`**, feature-detected, skipped under
  `prefers-reduced-motion` — checked in the script because no token can reach a view transition,
  the same reasoning as the reticle's own fade curve. Firefox gets an instant flip. Per-element
  `view-transition-name` polish was deliberately left for a later pass on a preview with Ali.
- **The print-geometry baseline now renumbers on every resume edit.** `nth-of-type` counts hidden
  siblings, so both routes' paths shift when a bullet is added anywhere, and hidden subtrees'
  children appear as zero-rect rows. The `update-resume` skill carries the how-to-read-it note;
  the check that matters is that visible rows' _values_ (y/height especially) didn't move.

## The résumé's actions bar is document tabs on a panel (2026-08-30)

Settled with Ali against a live switcher on a `noindex` route, the same review-loop pattern as the
motion values, the faces and the colour calibration. Eight controls, nine arrangements of one of
them, four download weights and five panel treatments were compared; the scaffolding is deleted.
The mechanics live in `src/components/ResumeActions.astro` and `src/styles/resume.css`. What belongs
here is the shape and the two things a future session would otherwise get wrong.

**The shape.** Two document tabs — `Highlights` / `Detailed` — flush against the left edge of the
résumé, which is now a bordered panel on the page's own column with the document inset inside it.
The download sits **inside** the panel's top right, level with the name, filled. The tabs join the
panel by overlapping its top border by 1px.

**The download moved inside the document, and that is what made it fillable.** It first shipped as a
filled button above the résumé and read as an ad — Ali's husband's word, and she agreed. The
diagnosis that survived: a saturated field on a page that is otherwise type on ground has nothing to
belong to, and an element sharing none of the page's visual language is what an ad _is_. Three
quieter weights were built to dim it. All three became unnecessary the moment placement changed:
beside the name, on a panel, in a header, the button has things to belong to. **Do not re-derive the
ad complaint as an argument against the accent block** — it was an argument against the accent block
_floating above the document_, and that condition is gone.

### Two findings most likely to be re-derived wrongly

**The panel styles `.resume` itself, and `.resume` is the element that prints.** A background, a 1px
border and 24px of padding reaching paper would change the PDF and blow the page-count assertion.
They cannot, because they sit inside `resume.css`'s `@media screen` block — which is a statement
about where the rules may apply at all, not a list of overrides, and is exactly the fix recorded
under Phase 5 for the print block being beatable on specificity. **Anything added to the panel goes
inside that block.** Verified when it landed: `check:resume-print` reported changes only inside
`.resume-actions`, and the regenerated PDFs' text-placement operators were byte-identical to the
previous ones across 3,137 and 6,107 operators.

**The panel's top-left corner follows what is PAINTING on it, not what is selected.** Squared while
the first tab covers it, so that tab's own radius supplies the card's corner; rounded once nothing is
there. Keying it off the active tab is the obvious version and it is wrong: a tab paints on hover
too, so pointing at the first tab while the second is selected drops the fill onto a corner that has
already rounded away, leaving 8.8px of notch — measured, and caught by Ali before it was rendered.
`:focus-visible` is in the selector for the same reason, since keyboard focus paints the same fill.
It needs no script: `data-density` is already on the article, and which tab is active _is_ the
density. **Not transitioned, deliberately** — `border-radius` clamps at zero while `--ease`
overshoots, the same trap that gave the reticle's fade its own curve.

### Smaller decisions, so they are not relitigated

- **The tab strip is `--text-base`, a deliberate step off `--text-sm`.** `--text-sm` is the site's
  control size: `.nav-link` and `.button` both use it, and the tabs inherited it by default rather
  than by choice. Ali's question — what drives it — is what surfaced that. The deviation is
  defensible because `--text-base` is not a new size on this page: `.resume-role`, the line directly
  under the name, is already 16px, so the tabs now sit between the section headings (20px) and the
  global nav (14.4px), which is where a document-level control belongs.
- **Flush costs the label alignment, and that is the accepted trade.** Flush, the tab's ordinary
  padding, and the tab's label sitting on the name's left edge are three things you can have two of.
  A first-tab padding override bought all three and Ali rejected it for the asymmetry it put inside
  one tab.
- **The page count inside the download reserves the width of the longer string.** "2 pages" is one
  monospace character wider than "1 page" — 7.67px — and the button's right edge is pinned, so
  without the reservation every density toggle moved the button. Reserved in `rem`, not `ch`, for
  the CLS reason under Phase 5.
- **A 1px border moves whatever is measured from it, and this control hit that four times** — the
  rule's own thickness, the tab's left border, the panel's border, and finally a `+ 1px` ported
  from the lab that was right there and wrong here, because the port dropped an inner flex wrapper
  and a negative margin resolved differently. Hence the habit, which generalises past this file:
  **when a border or a negative margin is added to something an alignment is measured from,
  re-measure — do not port the number.** The vertical and horizontal offsets on the download are
  asymmetric today for exactly this reason, and that is correct rather than a fudge.
- **Below 48em the download leaves the header and the bar becomes `column-reverse`.** The tabs are
  first in the DOM because that is the order a keyboard and a screen reader should meet them in;
  reversing the paint keeps them on the bottom line still touching the panel, without touching focus
  order.

## The switcher loop is a skill now, and the panel deliberately is not (2026-08-30)

Closes [#246](https://github.com/ali-wallick/Portfolio/issues/246). The live-switcher review loop
had run four times — the motion values (#33), the faces (#66), the colour calibration (#67) and the
résumé actions bar (#239) — and was transmitted only by example: a new session learned it by reading
the records of past passes rather than by having the method to hand. It is
`.claude/skills/design-switcher/` now, with the constraints and the traps in `SKILL.md`, the working
shapes of the four scaffolding files in `references/scaffolding.md`, and a contact-sheet renderer in
`scripts/contact-sheet.mjs`.

**The decision the issue asked for: the panel does not become reusable code.** It stays a template
inside the skill, copied and adapted per pass, and three of the loop's own rules are why. Scaffolding
must not import a hashed module — a shared component in `src/` is exactly an import, and the first
pass needing one more knob would edit it and drag every `byteHashedFiles` input along. A settled axis
comes off in the commit that settles it, so the file is under continuous surgery for the life of a
pass and byte-identical to nothing by the end. And permanent code in `src/` has to be gated out of
production forever, where a deleted route cannot leak at all. What generalises is the shape and the
traps; what does not is the axis, which is most of any real panel.

**The contact sheet is the one piece that did become code**, because it is the half a switcher cannot
do. A live switcher is sequential and "which of these four is loudest" is simultaneous; #239's
tab-corner notch lived in exactly one of four state combinations. It renders every state into one
labelled grid with its measurement under each tile, and the tiles are laid out by the browser rather
than composited, so labels get real typography for free.

**Building it turned up a fact worth having on hand: this site has no `data-theme` hook.**
`tokens.css` selects dark on `prefers-color-scheme` alone, so anything comparing both themes has to
emulate the media feature. Writing an attribute renders a light tile labelled "dark" — the exact
shape of convincing wrong answer the skill's own traps section exists for.

## The gallery is one scrolling row (2026-08-30, closes #166)

Every project gallery is a single horizontally scrolling row, replacing the wrapping grid Phase 5
shipped. The decisions, in the order a future session would trip over them.

**A fixed-height row is a better answer to #93 than the grid was, not a departure from it.** Nothing
on this site is cropped, so a row of mixed aspect ratios — 0.45 to 1.78 across the twelve galleries
— can only guarantee ONE edge, and `align-items: start` guaranteed the top. Sizing every slide to a
shared height and letting each take its own natural width puts the top **and** the bottom on the
same line, which the grid could never do. What stays ragged is caption line counts, which is
`content-pass`'s caption-length guidance to hold rather than layout's.

**16rem, filling the row, in the page column.** All three are Ali's calls on the preview, and the
first two settle each other: filling means upscaling the archive assets, and the shorter row is what
makes that payable — **1.61× worst case at 16rem against 2.21× at 22rem**. Nine of the twelve
galleries are 137–296px files from 2009–2013, so a consistent row and sharp old pictures are in
direct tension and there is no option that escapes it. Full-bleed lost for being at its thinnest on
the nine galleries holding one or two images, where it made a viewport-wide band around a single
picture. Locking that in also took `overflow-x: clip` off the root, which only ever existed because
`100vw` includes the vertical scrollbar.

**Slide width is arithmetic on build-time numbers, and both obvious CSS answers fail.** `Media.astro`
emits `--media-ar` and CSS multiplies it by `--gallery-h`. A slide has to be as wide as its IMAGE and
not as wide as its caption's longest line — but `width: min-content` on the figure with
`max-width: 100%` on the image is a cyclic dependency that collapsed every image on the site to about
60px, and dropping the `max-width` makes `min-content` resolve to the source's full intrinsic width
instead. Don't rediscover either.

### Zoom, and the plate that announces it

**An image opens full size when its source is at least 384px tall**, which is 1.5× the row. The
threshold is not a tuned number: at a 16rem row every gallery image on this site is either **≥1.60×**
its rendered height or **≤0.72×**, with nothing in between, so anywhere from 0.8× to 1.5× picks the
same twelve of thirty. That is a natural split in Ali's assets rather than a judgment — the archive
files have nothing more to show, and a lightbox on one is a bigger copy of what you were already
looking at. **Stated as an absolute height** so it cannot drift if the row is ever retuned.

**The plate is the affordance, and this is the height rule doing what it was written for rather than
an exception to it.** "Height means pressable" is exactly why a gallery image never had one — it
could not be pressed. A zoomable one can, so it takes the plate, the hover rise and the press-flat,
and a non-zoomable one keeps the plain frame. The raised edge is what says which images open, in the
vocabulary the site already has, instead of an icon that appears nowhere else. The visible
consequence is real and was accepted deliberately: `/projects/mini-mages` shows one raised image
beside two flat ones, because only its poster has more to show than the two ~230px screenshots.

Left/right steps between the zoomable images of one gallery, stopping at the ends rather than
wrapping — a reader who cannot tell whether they have seen everything is what wrapping costs. The
controls hide below two, the same "no arrows where it makes no sense" rule the row itself follows.

### Everything degrades to real HTML, and one thing had to move to keep it true

The row is a plain `overflow-x: auto` element, so it scrolls by touch, trackpad and arrow key with
no script at all. The arrows ship `hidden` and `gallery-scroll.ts` unhides them, so a page whose
script never runs carries no dead controls. Every zoomable image is a real link to its full-size
file, upgraded into a native `<dialog>`; a modified click is left alone so new-tab and save-as still
work.

**`tabindex="0"` on the scroll region is required, not decorative** — a scrollable region with no
focusable children is unreachable by keyboard, which axe reports as `scrollable-region-focusable`
and which fails the flat 1.0 accessibility bar `lighthouserc.json` holds project pages to. The
script narrows it, removing the tab stop from a row that does not overflow.

**`reticle.ts` listens for `scroll` in the CAPTURE phase now, and the reason generalises: scroll
events do not bubble.** A bubbling listener on `window` sees the page scrolling and nothing else — an
element-level scroller dispatches `scroll` at itself only. That was latent while the only controls
sat outside the row, and went live the moment zoom put focusable links inside it. One listener on the
capture path covers the page and every scroller on it.

### Archive pages may carry a short body (2026-08-24, from #97)

**Ali's call, and it sets the pattern for all 11 archive entries, not just the one it came up on.**

Through Phase 3 every archive entry was summary-only: no Markdown body at all, so a detail page was
its index card with a bigger hero on it. That followed from reading "compact scannable archive" as a
statement about the tier rather than about the index, which was a reasonable reading under Phase 3's
actual job (17 projects, correctness first) and stopped being the right answer once there was a
design to read the pages in.

**An archive entry may now carry a short body and a `gallery` where there is material worth having.**
This is a general guideline, not a hard structural rule, and it's aimed at what the entries actually
are right now: **mostly early student and jam work that doesn't need much detail.** A few short
paragraphs is the common shape — Prodigal's actual body (below) is the reference for what "short"
looks like — but there's no enforced cap and no blanket ban on the featured tier's
`## What I built` / `## What I learned` headings. `src/content.config.ts`'s tier comment carries the
same guideline, since it is the contract.

**The case that keeps this from being a hard rule: Ali expects to eventually move Kaneva into the
archive tier, and doesn't want that to mean losing much of its existing detail** (2026-08-24). A
fifteen-year-old job is squarely "older," but Kaneva's write-up is a real one, not a compressed
summary, and demoting it shouldn't force cutting it down to match what a 2009 class project needs.
**Deliberately not solved now** — Ali's call is to revisit the actual shape when that move happens,
not to pre-design a migration policy for one entry years ahead of it. What this file records today is
narrower: the guideline is calibrated to small/early projects, not a ceiling on richer ones.

**This is permission, not a quota.** An entry with nothing more to say stays summary-only, and that
is a correct outcome rather than an unfinished one. Prodigal earned a body because the old page had
three things the summary had dropped: the biblical parable the game is named for, the two-mode
design (side-scrolling travel, top-down hunt), and Ali's own note that the opening and closing
pictures aren't hers. The last of those was the load-bearing one — `role: Solo — design, programming,
and art` was, on its own, a slightly _broader_ claim than what she wrote herself in 2009.

**Correction, 2026-08-24 (#92): the load-bearing reasoning above no longer holds, and the caption it
justified is gone.** `role` was trimmed sitewide to a title with no scope (see "The wording pass"
below) — Prodigal's is `Solo developer` now, not `Solo — design, programming, and art` — so the
overclaim the wolf-photo caption was correcting doesn't exist any more. Ali's call on #92 was to cut
that sentence from the caption entirely rather than keep it as now-unnecessary color: **"it's so old
it's more just for fun to show cool old projects."** That's a calibration worth carrying to the rest
of this tier, not just a Prodigal fact: a caption doesn't need to preserve a credit-scope caveat
forever once the metadata it was correcting stops overclaiming, and the oldest/smallest entries get
the least precious treatment. The underlying rule — don't claim more credit than the source supports
— still lives in `role` itself; it just doesn't also need a caption saying so.

**Two of Prodigal's three screenshots were already in `src/assets/` and referenced by nothing.**
Worth checking for on any archive page before concluding it has no material: the Phase 3 asset
migration moved the whole keep-list, and only the heroes ever got wired up.

**Revised same day, on Ali's review: the page's own facts were incomplete, not just its tone.**
Prodigal was her project for Georgia Tech's **CS 2261, Media Device Architecture**, built for the
Game Boy Advance in **C and assembly** — a fact absent from every version of this page, old site
included, and a stronger hook than the parable framing that was leading it. The body now opens with
the course and the language instead of the story. `tech` gained `Assembly`; `event` gained the course
number and name, matching the descriptive style Mini Mages already uses (`Georgia Tech senior
capstone`) rather than a bare `Georgia Tech`. **Only the language name is stated — not an instruction
set** (ARM, Thumb, or otherwise). CLAUDE.md's own rule elsewhere is not to guess "6502 assembly" for
the Atari entry because the game is old, and the same restraint applies here: Ali named the language,
not the ISA, so that is what's recorded.

**Worth a look at Dead Booty** (same year, also real embedded hardware, `event: Georgia Tech` with no
course given) **for the same course connection — not done here.** Ali's call: this is the first page
worked, so let the pattern settle before sweeping siblings for it.

---

## Preserving the old site (2026-08-26)

The old DreamHost site is preserved well enough that `snapshot/` can eventually be tagged and
deleted (#45) with nothing lost. **`docs/PRESERVATION.md` is the index** — where each artifact
lives, how to view it, what could not be preserved. Read that rather than re-deriving any of it.
What belongs here is only the decisions.

**`snapshot/` did not render, and that was a defect rather than a property.** `snapshot/README.md`
says its assets "are already committed under `resources/`" — true when Phase 0 wrote it, false since
`ce4533e` deleted `resources/images/`. **50 of 54 asset references were dead**, so the snapshot
preserved what the old site _said_ and not what it _looked like_. `scripts/restore-snapshot.mjs`
repairs that into **`snapshot/rendered/`**.

**The 26 original files are still byte-faithful and still guarded.** The reconstruction is a
separate, clearly-derived subtree. `guard-preserved.sh` has one narrow exception for
`snapshot/rendered/` — derived output, where hand-editing is pointless rather than destructive since
the next run overwrites it. **Change the script, not its output.** It lives _under_ `snapshot/` on
purpose: the whole archive is then one `git rm -r` when #45 comes around.

**The output is committed, not regenerated on demand.** Same reasoning as the resume PDFs, with a
sharper edge — the point of the archive is that `snapshot/` can be deleted, at which moment a
regenerating script has no inputs left. One step also genuinely cannot be repeated: the blog's 14
images live only on the old host, and were fetched while it was still up.

**Self-containment is the property to protect, and it is asserted rather than assumed.**
`--check-selfcontained` fails the archive if any page requests anything from another host. The
original decayed precisely because it depended on other people's servers — html5shiv went down with
Google Code in 2015 and nobody noticed for a decade. **This check earned itself on first run**,
finding 26 requests still going out in three classes the patterns had missed, including the blog
images that were about to become unrecoverable.

**Three of the nine embedded videos are gone from YouTube** — deleted or private, all 403. Those
pages say so explicitly now. No copy exists anywhere; those bytes were never Ali's to keep. Don't
try to "fix" those placeholders.

**Two things a future session would otherwise get wrong:**

- **Faithful is not always the right default.** The first run restored the _unredacted_ resume PDF
  into the archive, manufacturing a second copy of the exposure #197 and #200 exist to reduce — and
  it was committed before anyone noticed. `PREFER_WORKTREE` in the restore script now supersedes
  that one file. When preservation and privacy conflict, the conflict is the thing to notice.
- **The verification worth copying is measurement, not inspection.** Everything asserted about this
  archive was checked against the live server while it still answered: 54/54 assets and 14/14 blog
  images byte-identical by sha256. That closes Phase 0's own lesson — _"verify it resolves" is not
  the same as "preserved"_ — by measurement, and it doubles as the spot-check
  [#51](https://github.com/ali-wallick/Portfolio/issues/51) wants before retiring WordPress.

**Not done, and it turned out not to be needed: fresh Wayback captures of the site's final form.**
Ali's call 2026-08-27, and the reason is stronger than the one first given. **archive.org already
holds the final form** — the homepage was captured 2025-11-10, About 2025-08-30, and the Vegas Blvd
page that was added in 2020 on 2025-09-17, all verified to contain the final Second Dinner content.

**A correction worth keeping, because the mistake is easy to repeat.** This section first said the
newest real capture was 2019-07-19 and that the final form was unarchived. That came from a CDX
query using `collapse=urlkey`, which returns the **first** capture per URL, not the latest —
first-seen dates read as last-seen dates. Anything asking "when was this last archived?" must not
collapse, or must sort explicitly.

The timing constraint is still real if it ever comes up for another reason: Save Page Now fetches
the URL live, so after the cutover it captures the new site, and after DreamHost is retired there is
nothing behind it. It just is not protecting anything that is missing.

**If the archive is ever published** — a separate decision, currently not taken — three things need
handling first, and they are in `docs/PRESERVATION.md`: don't serve `wp-login.html`, neuter
`contact.html`'s form, and re-check the expired outbound domains, which is the exact bug
`links[].dead: true` exists to prevent on the new site.

---

## Working here

```bash
npm run dev                        # localhost:4321, drafts visible
npm run verify                     # everything CI runs
npm run build:pdf                  # just the resume PDFs, against an existing dist/
SHOW_DRAFTS=true npm run build     # what a Cloudflare preview serves
npm run links:external             # outbound link liveness — by hand, not in CI
```

**`links:external` is deliberately outside `verify`, and that is not an oversight to correct.**
`check-links.mjs` never fetches an outbound URL, which keeps the gating check fast, offline and
deterministic — but it leaves link rot unwatched on a site whose content model has a `links[].dead`
field precisely because the old one linked three domains for years after they went dark. This is
that missing half, run by hand before a launch and periodically after one. Wiring it into CI would
make a deploy fail because somebody else's server is down, which is worse than the rot it catches.
It buckets results three ways rather than two: a host that answers 403 or 999 to a script (LinkedIn
always does) is reported **unverifiable**, not dead, and only genuinely-gone links fail the run.

Node is pinned by `.nvmrc` (22). Local dev on a newer Node is fine; CI and Cloudflare both read the
file.

`npm run build` also regenerates the resume PDFs into `public/`, which needs Chromium — installed by
a `postinstall` line in `package.json` (~95 MB, headless shell only). `npm run dev` doesn't touch it.

**The PDFs are committed artifacts, and that isn't a shortcut — Cloudflare physically cannot build
them.** Its build image has no root and lacks Chromium's shared libraries, so the browser dies at
launch there while GitHub Actions builds the same commit fine. Details in
[`docs/CLOUDFLARE.md`](docs/CLOUDFLARE.md). **If you change resume content or layout, commit the
regenerated `public/*.pdf` and `scripts/resume-pdf.lock.json` with it** — `npm run check:pdf` hashes
every input and fails the deploy otherwise, so a stale resume can't ship, but it also can't fix
itself.

**And if you add a design token, add it to `resume.css`'s `@media print` block too.** That block
pins paper to the Phase 4 palette and type scale by redefining tokens, and it only covers the ones
listed in it — anything new reaches the PDF. The page-count assertion catches a leak big enough to
cost a page and nothing smaller, which is how Phase 5 shipped 19pt of silent reflow. **And pinning
a token is not sufficient either** — any selector outranking a bare `:root` beats the print block
regardless of the media query. Both failure modes, and the fix, are under Phase 5 below and in
[#35](https://github.com/ali-wallick/Portfolio/issues/35).

### Project pages are held to a lower best-practices bar, and the reason is one audit (2026-08-27)

Settled with [#103](https://github.com/ali-wallick/Portfolio/issues/103), which added
`/projects/marvel-snap`, `/projects/prodigal`, `/resume/full` and `/404` to `lighthouserc.json` —
before it, the most complex template on the site was the one Lighthouse never measured.

**Project detail pages assert `categories:best-practices` at 0.90; everything else stays at 0.95.**
Split with `assertMatrix`, so the looser bar reaches project pages and nothing else. Measured, the
whole gap is a single audit: `inspector-issues`, reporting a cookie set by `youtube-nocookie.com`
inside the hero embed. Third party, inside an iframe, not ours to fix. Every other page and every
other category — accessibility still at a flat 1.0, which the newly-gated pages meet — holds the
original bar.

**Carving out the audit instead does not work, and that is the part worth remembering.**
`categories:best-practices` asserts the score _Lighthouse computes_, so switching an audit
assertion off leaves the category score exactly where it was. When a third-party cost has to be
absorbed, the threshold is the only lever; an audit-level `off` is not.

**`errors-in-console` used to fail on every page, gated ones included, and it was never about the
site.** The Cloudflare Insights beacon's CORS preflight can never match lhci's random localhost
port — `cloudflareinsights.com` always echoes back a portless `http://localhost` on
`Access-Control-Allow-Origin`, confirmed by probing the endpoint directly with several origins —
so it cost a flat 0.04 on every page against the 0.95 bar, and the audit was guarding nothing: it
was already failing, so a real console error wouldn't have moved the score. **Fixed
([#221](https://github.com/ali-wallick/Portfolio/issues/221)), not by loosening the threshold or
skipping the audit** — `scripts/strip-lighthouse-beacon.mjs` strips the beacon `<script>` tag from
the CI job's own downloaded copy of `dist/` before lhci runs, so the audit measures the site again
instead of a third party. The `build` job's uploaded artifact, and everything Cloudflare actually
deploys, still carry the beacon — only the disposable copy Lighthouse reads is touched.

### `public/_headers` carries the safe set, and two headers are deliberately not in it (2026-08-27)

Settled with [#105](https://github.com/ali-wallick/Portfolio/issues/105), which was a gap rather
than a position — nothing had ever decided either way. `nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin` and `X-Frame-Options: DENY` ship; **`CSP` and
`HSTS` do not, and the file says why so the absence reads as a choice.** CSP needs
`Report-Only` against real traffic before it is enforced, because the site loads a YouTube iframe
and the Insights beacon and a guessed policy breaks them silently. HSTS is also a zone-level
Cloudflare setting, and it belongs in exactly one of the two places — Ali's call which.

### The homepage's JSON-LD is derived, and that is the whole design (2026-08-27)

[#106](https://github.com/ali-wallick/Portfolio/issues/106). `src/lib/structured-data.ts` builds a
schema.org `Person` from `site.ts`, the `active` socials, and the current job's own
`roles`/`company` — the same sources `/resume` and the About timeline read. **A literal JSON-LD
block would be a second place every fact on it could go stale**, which is the failure the content
model exists to rule out. The Marvel Snap credit URL is read off that project's `press` link rather
than retyped, the same way `scripts/build-linkedin.mjs` reads it.

**The Second Dinner ceiling applies to structured data exactly as it does to prose.** `worksFor`
names the studio and stops; a machine-readable claim is not a lesser one.

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
**Deploying is also its own decision** — merging a PR is not authorisation to push `release`.

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

The pattern is the same each time: **the thing that determines behaviour lives somewhere a
checkout cannot show you.** `wrangler.jsonc` codifies what it can (`workers_dev`, the apex Custom
Domain) precisely for this reason, and the residue is what these notes are for.

### Don't touch

- **DNS, the registrar, email.** Phase 1 is closed. None of it is back in scope.
- **`content/archive/`, `snapshot/`, `infra/`.** Preservation records from Phases 0–1. Their value is
  being faithful, so reformatting or "improving" them destroys the point. A `PreToolUse` hook blocks
  writes to the first two.
- **`resources/css/` and `resources/js/`** — the old site's stylesheet and scroll handler. Mined in
  Phase 5 and **the only copy**; `snapshot/` has `colors.css` and nothing else. The findings are
  recorded under "What the gate corrected", and the recovered curve was re-examined and retuned in
  Phase 6 — but these are still the only primary sources if anyone reopens that.
- **`resources/WallickAli-Resume.pdf`** — kept deliberately (settled
  [#40](https://github.com/ali-wallick/Portfolio/issues/40)). **The working-tree copy no longer
  carries the PO Box** (2026-08-26) — the address's text block was removed from the content stream,
  not covered with a rectangle, and verified gone by extraction, byte grep and pixel diff. See
  `docs/PRESERVATION.md`. **History is untouched**: four blobs across four commits, plus
  `v1-legacy`, still carry it, which is what
  [#109](https://github.com/ali-wallick/Portfolio/issues/109) is actually about.

_The Phase 0 asset keep/drop list was **acted on in Phase 3**: the 50 keep-listed files moved to
`src/assets/images/`, and the drop list — 86 unused social icons, 6 orphaned logos, and the 6.3 MB
unplayable `nightLight.unity3d` — was deleted at `ce4533e`. **Nothing under `resources/images/`
should ever exist again.** The audit's conclusions are preserved in [#45](https://github.com/ali-wallick/Portfolio/issues/45); the full text is
`git show ce4533e~1:resources/images/ASSET_INVENTORY.md`._

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

| Path                                  | What                                                                          |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `src/content.config.ts`               | The content model. Start here.                                                |
| `src/lib/content.ts`                  | Collection queries and the only date/year formatting in the codebase.         |
| `src/config/site.ts`                  | Name, email, nav, social links (all `pending` until Phase 3 audits them).     |
| `src/config/resume.ts`                | The resume's Skills section — settled, hand-curated, not derived from `tech`. |
| `scripts/check-links.mjs`             | Post-build checks. Every rule is a regression guard for a real old bug.       |
| `scripts/check-links-external.mjs`    | Outbound link liveness. **Manual (`npm run links:external`), never in CI.**   |
| `scripts/build-pdf.mjs`               | Renders the resume routes to PDF and asserts their page counts.               |
| `src/components/ResumeDocument.astro` | The resume, both densities. `variant` is the only difference.                 |
| `scripts/build-linkedin.mjs`          | Generates `docs/LINKEDIN.md` from the `jobs`/`education` collections.         |
| `docs/LINKEDIN.md`                    | Paste-ready LinkedIn copy. Generated — a handoff for Ali, never a sync.       |
| `docs/LAUNCH.md`                      | **The cutover runbook.** One ordered procedure; start here to launch.         |
| `docs/REBUILD-LOG.md`                 | Running record. Phase 7's source material.                                    |
| `infra/README.md`                     | The live zone, the DNS tooling, and Phase 1's record.                         |
| GitHub issues                         | What's actually left. Milestones per phase; `decision` and `needs-ali`.       |
| `snapshot/`                           | The old site as it stood. The reference for "what did the old page say?"      |
