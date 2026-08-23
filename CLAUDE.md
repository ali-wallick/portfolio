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

**Remaining work is tracked as GitHub issues, not in a document.** The list lives in three
milestones — [`Pre-launch`](https://github.com/ali-wallick/Portfolio/milestone/1),
[`Launch`](https://github.com/ali-wallick/Portfolio/milestone/3), and
[`Post-launch`](https://github.com/ali-wallick/Portfolio/milestone/2). Each issue carries its
source, why it was deferred, and what unblocks it, so a cold session can pick one up without
reading scrollback.

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

| Decision                | Choice                                                                                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack                   | Astro, Markdown content collections, `output: 'static'`. No framework, no adapter.                                                                                                                                                                            |
| Deploy                  | Cloudflare **Workers** static assets, git push, one preview URL per branch. (The plan said Pages; Cloudflare has frozen Pages for new features and routes new Git projects to Workers. Same review loop, plus native `_redirects`. See `docs/CLOUDFLARE.md`.) |
| Registrar / DNS / email | Cloudflare + iCloud+. **Closed in Phase 1. Out of scope. Do not touch.**                                                                                                                                                                                      |
| Public address          | `contact@aliwallick.com`                                                                                                                                                                                                                                      |
| Blog                    | Scraped to Markdown, mined for content. **No live blog section.**                                                                                                                                                                                             |
| Projects                | Two tiers — 5 deep write-ups, ~12 in a compact scannable archive.                                                                                                                                                                                             |
| Marvel Snap             | A full public credit. Officially credited at [marvelsnap.com/credits](https://marvelsnap.com/credits/) as **Senior Software Engineer I** — link it rather than asserting it.                                                                                  |
| Current work            | **"Second Dinner's next game, built in Godot."** Not "an unannounced mobile title" — the studio went public in Aug 2024 and the old phrasing was vaguer than reality _and_ wrong about "mobile". See the Phase 3 gate outcome below.                          |
| Contact form            | None. A `mailto:` and vetted social links. The old PHP form had no CSRF token, no rate limiting, and silently discarded the sender's name.                                                                                                                    |
| Visual design           | Deferred to Phase 5, deliberately last.                                                                                                                                                                                                                       |
| URLs                    | Extensionless (`/about`, `/projects/firefall`), matching the old `.htaccess` rewrites, so the pre-launch redirect map stays small.                                                                                                                            |

---

## Phases

Phases 0–5 are the build: they're closed, and the table below is a historical record — don't
relitigate anything in it, and don't rename it. Phase 6's own gate (2026-08-23, below) decided that
what comes after the build isn't more numbered phases — it's three stages named for where they sit
relative to the domain moving, which is the one event with a blast radius outside the repo. Use
**pre-launch / launch / post-launch** for everything from here on; "Phase 6" and "Phase 7" are
retired as names for current work, even though the historical prose below still uses them to
describe what happened during that time.

| Phase       | What                                                                                                                                 | State                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| 0           | Preserve — blog scrape, snapshot, asset inventory                                                                                    | ✅ merged                                                          |
| 1           | Infrastructure — domain, DNS, email                                                                                                  | ✅ merged                                                          |
| 2           | Foundation & agentic tooling                                                                                                         | ✅ merged                                                          |
| 3           | Content: get it true                                                                                                                 | ✅ merged                                                          |
| 4           | Resume, one source                                                                                                                   | ✅ merged                                                          |
| 5           | Design                                                                                                                               | ✅ merged                                                          |
| Pre-launch  | Favicon, OG, a11y, redirects, remaining content/resume calls, wording revisit — everything that must be true before the domain moves | 🚧 [tracked](https://github.com/ali-wallick/Portfolio/milestone/1) |
| Launch      | The DNS cutover itself — its own moment, not gated on Pre-launch closing (#21)                                                       | [tracked](https://github.com/ali-wallick/Portfolio/milestone/3)    |
| Post-launch | Keep it alive                                                                                                                        | [tracked](https://github.com/ali-wallick/Portfolio/milestone/2)    |

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

Not settled: the actual prose. That's Phase 3 execution. The gate conversation itself is **closed** —
outcome recorded below.

### Facts worth having on hand

- Second Dinner, 2019–present — the longest tenure by far, and nearly absent from the old site. Ali
  joined as the **11th employee** (the studio was founded in 2018, confirmed exact — not an
  estimate), so the story is partly about helping build a company, not only a game.
- Marvel Snap shipped **October 2022**. Ali worked on it from 2019 until **2024**, when she moved to
  the studio's next team.
- Critter³ is a **2011** jam entry. The old projects index filed it under 2013.
- **KinoClue is undergraduate research, not a class project** — a Georgia Tech Synaesthetic Media Lab
  / GVU Center piece, "KinoClue: A Tangible Tabletop Mystery", credited to Russell Brooks, Ali
  Wallick, Susan Robinson, and Ali Mazalek. The single image on the old page is the research poster
  and contains the entire description. Re-tag `event` to the lab and add the collaborators.
- The 20 posts in `content/archive/` are first-person source material — GGJ 2013, GDC 2013, "My
  First 2 Panels", MobilityWare, It Fits I Sits. This is where the site gets personality that can't
  be templated.

#### It Fits I Sits — scope Ali's contribution precisely

The biggest content gap on the old site (no page at all), and the easiest to overclaim. What is true:

- Ali **pitched** the concept at MobilityWare's Game Jam V (**March 2018** — the award certificate is
  dated 03/23/18) and built the prototype with a team over one week. Her focus was the **level
  editor**, which exported to JSON and let the team author **61 levels** for pitch day — enough that
  the intro levels carried the whole tutorial with no guided tutorial needed.
- The team won the **People's Choice Award**, and the game was selected for full development.
- **Ali did not work on either shipped release.** She stayed on Vegas Blvd Slots; other teams built
  the Facebook Instant Games version (which she was kept in the loop on, and which peaked at **188K
  daily active users** — her own figure, from the 2019-04-16 archive post) and later the iOS/Android
  release, [Puzzle Cats](https://www.mobilityware.com/puzzle-cats/), which is still live.
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

1. **Championing a migration to an MVVM architecture**, alongside the push to launch the PC client.
   Not just doing the work — arguing for it and getting a team to come along.
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
| It Fits I Sits   | ⚠️ **none**                      | Ali to source a capture. Award-certificate photo is a gallery item, not a hero. |
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
fields, the `TODO(phase-3-revisit)` sweep, and the It Fits I Sits hero. The one remainder, prototype
shots for the gallery, is [#46](https://github.com/ali-wallick/Portfolio/issues/46), which carries the framing that makes rough captures
acceptable there and nowhere else on the site._

### Phase 3 execution outcome (2026-08-16, merged 2026-08-17)

Executed on branch `phase-3-content`, merged via [PR #7](https://github.com/ali-wallick/Portfolio/pull/7)
at `5a98f2c`. `npm run verify` and `pre-launch-check`'s sweeps pass clean, with zero
`TODO(phase-3-revisit)` markers outstanding. **All five featured projects, all 12 archive entries,
and the career narrative are written and `draft: false`.** Ali reviewed the branch preview and
signed off on every provisional bit along the way — Marvel Snap's systems list, Vegas Blvd Slots'
`role` wording (now "Software Engineer II — live-ops and slot-machine systems"), and It Fits I
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

Four questions, settled. Do not relitigate.

### 1. Single source, with real PDF files

**Single-source, and the PDFs are generated at build time** — not a `window.print()` link, and not a
separately designed document. `/resume` and `/resume/full` render from the `jobs` and `education`
collections, and `scripts/build-pdf.mjs` prints those exact pages with Chromium into `dist/resume.pdf`
and `dist/resume-full.pdf` using the site's own print stylesheet.

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
something else on the long one — there is only ever one copy of it.

`src/components/ResumeDocument.astro` is the only place either version renders; `variant` decides how
much. Don't add a second component, and don't let the two routes accumulate their own copy.

**`scripts/build-pdf.mjs` asserts page counts** (1 and 2) and fails the build if either overflows.
This is a real guard, not a formality: bullets accrete, and without it the day someone adds a sixth
Second Dinner highlight is the day the "one page" resume quietly becomes two — discovered by a hiring
manager rather than by CI. If it fires, move a bullet to `highlightsExtended`; don't shrink the type.
Print density is already at 9.4pt/1.3, which is normal resume density and close enough to the floor
that further shrinking would show.

### 3. Weighting and cuts

One page, front-loaded: Second Dinner 5 bullets, MobilityWare 3, Red 5 2, Kaneva 3, one-line
education, one Tools line. The two-pager adds 2 / 2 / 1 / 2 more.

- **The GPA and Dean's List stay recorded and unrendered.** They are in
  `src/content/education/georgia-tech.md` and `ResumeDocument` deliberately doesn't print `honors`.
  Recording a fact is not the same as showing it.
- **No PO Box, and no home address at all.** There is no sourced current city, so the resume header
  carries email, site, and LinkedIn and nothing else. (The PO Box was never on the site — it only
  exists in `resources/WallickAli-Resume.pdf`, which is not served. See the loose end below.)
- **The weighting problem is inverted from what you'd expect**, and this is the thing to remember:
  the "Source material (2019 resume, verbatim)" sections are _richest for the oldest jobs_. Kaneva
  has two solid bullets; Second Dinner — seven years, the most important entry — has one stale
  sentence about "an unannounced mobile Marvel game." **Second Dinner's highlights come from the
  Phase 3 Marvel Snap write-up, not from its 2019 bullet.** Writing bullets straight from source
  material would have produced a resume weighted backwards.

### 4. LinkedIn is a handoff, not a sync

**No agent logs into the account.** The deliverable is `docs/LINKEDIN.md` — paste-ready blocks for
Ali. Its role descriptions are the `highlights` + `highlightsExtended` bullets verbatim, i.e. exactly
`/resume/full`, so LinkedIn stays the same single source rather than becoming a fourth place a fact
can go stale. **Generated, not hand-maintained, since [#54](https://github.com/ali-wallick/Portfolio/issues/54):**
`scripts/build-linkedin.mjs` renders it from the `jobs` and `education` collections; the file itself
says not to edit it directly.

### Promotion years — settled 2026-08-17, do not reopen

- **Second Dinner splits.** Software Engineer II from 2019, Senior Software Engineer I from
  **`2021-12`**. Ali supplied December 2021 and noted that if forced to a single year she'd say 2022
  — a December promotion sits a fortnight from the boundary, so "2021" undersells the senior tenure.
  Month precision makes the rounding moot, and it is the only place the date is visible: the resume
  prints `Previously Software Engineer II (2019 – Dec 2021)`.
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

Ali's call. Three things were deferred as improvements to something already true, not corrections to
something wrong, and all three are tracked rather than described here:

- **[#37](https://github.com/ali-wallick/Portfolio/issues/37)** — detail the 2024–present Godot work, which exists on the resume today as a
  single clause while every other era has real engineering detail. The Phase 3 ceiling above governs
  it absolutely: **craft, not product.**
- **[#32](https://github.com/ali-wallick/Portfolio/issues/32)** — a tone and layout pass. Phase 4 optimised for _true_ and _fits_, never for how
  it reads on paper.
- **[#35](https://github.com/ali-wallick/Portfolio/issues/35)** — commit the print-geometry differ as a build guard, agreed 2026-08-18 to happen
  as part of that pass.

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

**The PDF staying means the exposure is still live, not resolved.** `git rm` doesn't remove history
either way, but the PDF is also still present in the current tree, still carrying a PO Box, still
unserved. **If #48 (build-in-public) ever means making this repo public, this file needs a second
look before that happens** — either strip the PO Box from a copy, or exclude it, or rewrite history.
That's the implication for #48 this decision was supposed to record.

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
Tools section was `[...new Set(jobs.flatMap(j => j.data.tech))]` — every job's `tech` array, deduped.
That stopped being able to produce the right answer the moment the list was curated by hand rather
than derived: items needed to be dropped (DeltaDNA, C++, XML, ...) and others (Cursor, Claude Code)
trace to no job at all. So **jobs' `tech` field is removed from the content model**, not repurposed —
it had exactly one consumer, this line, and once the section stopped deriving from it, keeping an
unread field around is exactly the kind of dead data this content model's guard table exists to rule
out. `resumeTools` in `src/config/resume.ts` is a `Record<ResumeToolCategory, string[]>`: a tool is
written down _inside_ one of the three category keys, so there is no way to add one without
classifying it, and TypeScript's excess-property checking on that literal rejects a category that
isn't one of the three declared — `npm run check` fails to compile rather than silently dropping the
entry. Same shape as `STATUS_LABEL` in `src/lib/content.ts`: a status without a colour pair is a
compile error there, not a silent fallback, and this is that rule applied to tools instead of
statuses.

**Three labelled rows cost real print height.** `ResumeDocument.astro` renders `RESUME_TOOL_CATEGORIES`
as a `<dl>` of `dt`/`dd` pairs instead of one joined line; `resume.css` grew matching rules in both
the screen and print halves. No new design tokens were needed — the new selectors are structural, not
color or type — so `resume.css`'s `@media print` pin block didn't need a new entry. The one-pager still
passes `build:pdf`'s page-count assertion at 1 page, with the committed baseline in
`scripts/resume-print-baseline.json` updated to match (`check-resume-print.mjs --update`) — the geometry
differ this file's Phase 5 section describes caught the shape change exactly as designed and it was
reviewed as intentional, not a leak.

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
  minus the cutover itself. GitHub milestone `Pre-launch` (was `Phase 6 — Launch`), issue label
  `pre-launch` (was `phase-6`).
- **Launch** — the cutover session itself: #34, #55, and [#74](https://github.com/ali-wallick/Portfolio/issues/74)
  (flip `live` to `true` in the same PR as the cutover). New GitHub milestone `Launch`, new label
  `launch`.
- **Post-launch** — everything after. What "Phase 7" tracked. GitHub milestone `Post-launch` (was
  `Phase 7 — Keep it alive`), issue label `post-launch` (was `phase-7`).

**Phases 0–5 keep their numbers.** They're a closed historical record — each has a dated gate
outcome and an execution outcome below, and renaming them buys nothing while breaking every
cross-reference to "Phase 3", "Phase 4", "Phase 5" in this file and in old issues. Only the _current_
and _future_ work gets the new vocabulary. Historical prose that describes what happened during the
old "Phase 6" or "Phase 7" window (the motion-values tuning, the faces switcher, REBUILD-LOG.md's
own phase entries) is untouched — it's describing the past, not naming ongoing work.

---

## Working here

```bash
npm run dev                        # localhost:4321, drafts visible
npm run verify                     # everything CI runs
npm run build:pdf                  # just the resume PDFs, against an existing dist/
SHOW_DRAFTS=true npm run build     # what a Cloudflare preview serves
```

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

### The review loop

This loop — not any single tool — is what makes agentic work on a visual project good, and it is the
thing the old DreamHost setup could not do at all:

**branch → push → Cloudflare posts a preview URL → look at it on a phone → react.**

So: **work on a branch, always.** Never commit straight to `main`, and don't merge without
checking in. Push early enough that there's a preview URL to look at while the work is still cheap
to redirect. Setup and troubleshooting: [`docs/CLOUDFLARE.md`](docs/CLOUDFLARE.md).

### Don't touch

- **DNS, the registrar, email.** Phase 1 is closed. None of it is back in scope.
- **`content/archive/`, `snapshot/`, `infra/`.** Preservation records from Phases 0–1. Their value is
  being faithful, so reformatting or "improving" them destroys the point. A `PreToolUse` hook blocks
  writes to the first two.
- **`resources/css/` and `resources/js/`** — the old site's stylesheet and scroll handler. Mined in
  Phase 5 and **the only copy**; `snapshot/` has `colors.css` and nothing else. The findings are
  recorded under "What the gate corrected", and the recovered curve was re-examined and retuned in
  Phase 6 — but these are still the only primary sources if anyone reopens that.
- **`resources/WallickAli-Resume.pdf`** — carries a PO Box. Kept deliberately (settled
  [#40](https://github.com/ali-wallick/Portfolio/issues/40)); a real exposure only if the repo ever
  goes public, so re-check before that happens.

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
| `scripts/build-pdf.mjs`               | Renders the resume routes to PDF and asserts their page counts.               |
| `src/components/ResumeDocument.astro` | The resume, both densities. `variant` is the only difference.                 |
| `scripts/build-linkedin.mjs`          | Generates `docs/LINKEDIN.md` from the `jobs`/`education` collections.         |
| `docs/LINKEDIN.md`                    | Paste-ready LinkedIn copy. Generated — a handoff for Ali, never a sync.       |
| `docs/REBUILD-LOG.md`                 | Running record. Phase 7's source material.                                    |
| `infra/README.md`                     | The live zone, the DNS tooling, and Phase 1's record.                         |
| GitHub issues                         | What's actually left. Milestones per phase; `decision` and `needs-ali`.       |
| `snapshot/`                           | The old site as it stood. The reference for "what did the old page say?"      |
