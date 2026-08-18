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

| Phase | What                                                                | State          |
| ----- | ------------------------------------------------------------------- | -------------- |
| 0     | Preserve — blog scrape, snapshot, asset inventory                   | ✅ merged      |
| 1     | Infrastructure — domain, DNS, email                                 | ✅ merged      |
| 2     | Foundation & agentic tooling                                        | ✅ merged      |
| 3     | Content: get it true                                                | ✅ merged      |
| 4     | Resume, one source                                                  | ✅ merged      |
| 5     | Design                                                              | 🚧 in progress |
| 6     | Launch — favicon, OG, a11y, redirects, DNS cutover, wording revisit |                |
| 7     | Keep it alive                                                       |                |

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
  exists in `resources/WallickAli-Resume.pdf` and the unreferenced `src/assets/images/resume.png`,
  neither of which is served. See the loose end below.)
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
can go stale.

### Still open at the end of the gate

Both need Ali, and neither can be guessed without inventing a fact:

- **Two promotion years — both resolved 2026-08-17. Do not reopen either.**
  - **Second Dinner: split.** Software Engineer II from 2019, Senior Software Engineer I from
    **`2021-12`**. Ali supplied December 2021 and noted that if forced to a single year she'd say
    2022 — a December promotion sits a fortnight from the boundary, so "2021" undersells the senior
    tenure. Month precision makes the rounding question moot, and it's the only place the date is
    visible: the resume prints `Previously Software Engineer II (2019 – Dec 2021)`.
  - **Kaneva: stays a single entry**, Ali's call — the progression is fifteen years old and she's
    comfortable with the flattening. **No date is needed to keep one entry**; the year was only ever
    required to _split_ one. `Software Engineer` is sourced (her own 2019 resume flattened it that
    way), so it isn't invented — but the site says `Lead UI Programmer` on the Kaneva project page
    while the resume and About say `Software Engineer`. Raised with her; changing it needs no date
    either, so it's a one-line edit whenever she wants it.
- **Ali's current toolchain**, for the resume's Tools line. **Partly answered 2026-08-17** — Ali added
  **GDScript**, so the line now reads `Unity · C# · Godot · GDScript · DeltaDNA · Lua · XML · C++`.
  It is still derived strictly from each job's `tech` field, which means it remains a
  languages-and-engines list with no workflow tooling, and DeltaDNA still sits next to Godot with
  nothing marking the decade between them. The plan mentions Perforce and CI directionally; **a
  planning note is not a source**, so nothing has been added on its authority. Ask again rather than
  inferring.

### Phase 4 follow-ups, deferred with Ali's agreement (2026-08-17)

Ali's call: the resume is **factual enough to move on**, and both of these are improvements to
something already true rather than corrections to something wrong. Neither blocks the merge.

- **Detail the 2024–present Godot work, at a very high level.** Right now those two years exist on
  the resume only inside Second Dinner's opening bullet ("then its next team from 2024 — the studio's
  first game in Godot"), which is accurate but thin for what is now a substantial share of her recent
  career. Every other era has real engineering detail and this one has a clause.

  The constraint is the hard part and is **not negotiable**: `CLAUDE.md`'s Phase 3 gate outcome still
  governs. The studio's public statement (7 August 2024, via the W4 Games investment) is the ceiling —
  Godot, next game, nothing else. **No title, platform, or genre**, and nothing about features,
  monetization, or how the studio operates. So this has to be written as _craft, not product_: the
  kinds of systems and the kind of engineering, in the register the Marvel Snap write-up uses for its
  pre-announcement years. Source it from Ali directly; there is no public material to mine, and this
  is exactly the case where inventing plausible detail would be worst.

  Lands in `highlights` / `highlightsExtended` on `src/content/jobs/second-dinner.md`, and probably
  as a sentence or two in the Snap-adjacent narrative on About. Watch the one-page budget — the
  one-pager currently fits with roughly 0.4in of slack, so adding a bullet likely means moving one
  down to `highlightsExtended`. `npm run build:pdf` will say so rather than letting it silently
  become two pages.

- **A tone and layout pass on the resume specifically.** Phase 4 optimised for _true_ and _fits_, not
  for how it reads or looks. This is the resume-scoped sibling of the wording revisit already booked
  for Phase 6, and it should probably happen alongside it, once Phase 5's design exists to judge
  against. Two things already known to be worth looking at: the bullets lean hard on em-dash asides
  (a Phase 3 voice habit that reads denser in resume genre than in prose), and the print stylesheet's
  9.4pt/1.3 density was tuned to make the one-pager fit rather than chosen for how it looks on paper.
  Also see the apostrophes note under "Loose end" below.

  **Do the print-leak guard as part of this pass** (agreed 2026-08-18, during Phase 5's first
  direction). `src/styles/resume.css`'s `@media print` block pins the paper palette by redefining
  tokens — and it pins _the tokens that existed when it was written_, silently passing through any
  added later. That makes it a denylist wearing a design system's clothes, which is exactly the
  failure mode the content model's guard table exists to rule out. It bit on Phase 5's first
  direction: green section headings, an embedded Menlo, and 19pt of extra height on a document with
  a hard 1-page assertion in `scripts/build-pdf.mjs`. It still fit, by luck.

  That was fixed by enumerating exhaustively, which works today and is **not** the real fix — the
  block is only complete for the properties that exist now. A direction that gives `.meta` a
  `font-variant-numeric` or a `text-transform` leaks again, and nothing says so. Two real options,
  and the second is the one that matches how this repo handles everything else:

  1. Scope the screen half of `resume.css` inside `@media screen`, so screen rules cannot reach
     paper at all.
  2. **Commit the print-geometry differ as a build guard.** Playwright with
     `emulateMedia({ media: 'print' })`, dumping position, size, font, weight, family, tracking and
     colour for every element on both resume routes, diffed against a committed baseline. It names
     the offending element instead of reporting that a number moved. It was a throwaway script
     during Phase 5 and it took the leak from 123 differing elements to 0 in three iterations —
     chasing the same bug by PDF file size got nowhere, because PDF bytes move with font subsetting
     and say nothing about layout.

  The point of preferring (2): the page-count assertion already catches a leak that costs a whole
  page, and catches nothing smaller. A 19pt reflow is invisible to it right up until the day it
  isn't, and then it surfaces as "the resume is two pages now" with no indication why.

### Loose end, flagged not acted on

`resources/WallickAli-Resume.pdf` and `src/assets/images/resume.png` (the old 1700×2200 resume image,
referenced by nothing) both contain the PO Box and predate every fact on the current resume. Neither
is served — `wrangler.jsonc` serves `dist/` only — and the repo is private, so there is no exposure
today. It becomes one if this repo ever goes public, which **Phase 7's build-in-public page is the
most likely reason to do**. Deleting them needs Ali's sign-off under the asset keep/drop rule, so
they are deliberately still in place.

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

`--ease` and `--duration` carry the old site's real curve and duration (see the correction below) on
`master`, so **every direction inherits the chase-and-settle character** whether or not it makes a
feature of it. Where that character is most visible is a per-direction choice. This is what
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

- **The character is two token values**, not a component: `cubic-bezier(0,0,0.25,1)` and `500ms`. Both
  differ sharply from the Phase 2 placeholders they replace — the old `--ease` was
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

- `src/styles/tokens.css` still holds **placeholder** color and type tokens. Motion is now real.
- **Use the variables.** Never write a raw color or a raw `px` font size in a component. Phase 5
  should be a palette-and-type swap, not a hunt through every file.
- Responsive from the start. The old site had no viewport meta and rendered zoomed out on every
  phone ever made.

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
cost a page and nothing smaller, which is how Phase 5 shipped 19pt of silent reflow. See the
print-leak guard note under Phase 4's follow-ups.

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

| Path                                  | What                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `src/content.config.ts`               | The content model. Start here.                                            |
| `src/lib/content.ts`                  | Collection queries and the only date/year formatting in the codebase.     |
| `src/config/site.ts`                  | Name, email, nav, social links (all `pending` until Phase 3 audits them). |
| `scripts/check-links.mjs`             | Post-build checks. Every rule is a regression guard for a real old bug.   |
| `scripts/build-pdf.mjs`               | Renders the resume routes to PDF and asserts their page counts.           |
| `src/components/ResumeDocument.astro` | The resume, both densities. `variant` is the only difference.             |
| `docs/LINKEDIN.md`                    | Paste-ready LinkedIn copy. A handoff for Ali, never an automated sync.    |
| `docs/REBUILD-LOG.md`                 | Running record. Phase 7's source material.                                |
| `snapshot/`                           | The old site as it stood. The reference for "what did the old page say?"  |
