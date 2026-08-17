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
| Marvel Snap             | A full public credit. Officially credited at [marvelsnap.com/credits](https://marvelsnap.com/credits/) as **Senior Software Engineer I** — link it rather than asserting it.                                                                                  |
| Current work            | **"Second Dinner's next game, built in Godot."** Not "an unannounced mobile title" — the studio went public in Aug 2024 and the old phrasing was vaguer than reality _and_ wrong about "mobile". See the Phase 3 gate outcome below.                          |
| Contact form            | None. A `mailto:` and vetted social links. The old PHP form had no CSRF token, no rate limiting, and silently discarded the sender's name.                                                                                                                    |
| Visual design           | Deferred to Phase 5, deliberately last.                                                                                                                                                                                                                       |
| URLs                    | Extensionless (`/about`, `/projects/firefall`), matching the old `.htaccess` rewrites, so Phase 6's redirect map stays small.                                                                                                                                 |

---

## Phases

| Phase | What                                                                | State                                      |
| ----- | ------------------------------------------------------------------- | ------------------------------------------ |
| 0     | Preserve — blog scrape, snapshot, asset inventory                   | ✅ merged                                  |
| 1     | Infrastructure — domain, DNS, email                                 | ✅ merged                                  |
| 2     | Foundation & agentic tooling                                        | ✅ merged                                  |
| 3     | Content: get it true                                                | ← executed on branch, pending review/merge |
| 4     | Resume, one source                                                  |                                            |
| 5     | Design                                                              |                                            |
| 6     | Launch — favicon, OG, a11y, redirects, DNS cutover, wording revisit |                                            |
| 7     | Keep it alive                                                       |                                            |

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

### Still open at the end of the gate

**The one hard blocker: It Fits I Sits media.** No high-quality captures of the jam prototype exist.
Plan agreed at the gate: **full-game media for the hero, lower-quality prototype shots inside the
page** — where the gap between a week-one jam build and a shipped product is the point of the
comparison rather than a weakness. Ali is sourcing both and will share them in the execution session.
The page stays `draft: true` until the hero lands.

**Decided, but marked `TODO(phase-3-revisit)` in the content files** — both were settled as
_provisional_ so Ali can react to them rendered in context rather than in the abstract. Sweep every
`TODO(phase-3-revisit)` before the phase closes:

- **`role` on the three featured projects that lacked one.** First stabs are written in: Marvel Snap
  "Client Engineer, then Feature Engineer", Vegas Blvd Slots "Software Engineer II", It Fits I Sits
  "Pitch, prototype, and level editor". The schema wants Ali's own words, so these are placeholders
  with a good accent, not answers.
- **The two community video links on Marvel Snap** (The Weekly Snap Show, Pictionary). Included on
  an explicit "err toward more, trim later" call. They're a different register from the first-party
  three, and the right time to judge that is with the whole site readable.

**Also settled, and already applied:**

- **Marvel Snap `endYear: 2024`.** `endYear` tracks _Ali's involvement_, not the product's lifespan
  — the game is still live, she isn't on it. That's the convention for every project here.
- **The Second Dinner progression is two different axes**, and the schema deliberately models only
  one. `roles[]` carries official titles (the credits page confirms **Senior Software Engineer I**;
  earlier titles need LinkedIn, which is a Phase 4 problem). The client-engineer → feature-engineer
  arc is a _discipline_ change, not a title change, so it lives in the Snap write-up's prose where
  it's about the work rather than about HR. Don't force it into `roles[]`.

### Phase 3 execution outcome (2026-08-16, closed 2026-08-17)

Executed and reviewed on branch `phase-3-content` ([PR #7](https://github.com/ali-wallick/Portfolio/pull/7)),
not yet merged. `npm run verify` and `pre-launch-check`'s sweeps pass clean, with zero
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
