# Decision record — content

Why the site says what it says: the Phase 3 gate beyond the Second Dinner ceiling, the wording
pass, and the content-model decisions that followed. **Everything here is settled: do not
relitigate it.** [`CLAUDE.md`](../../CLAUDE.md) is the standing brief and carries the voice
conventions and the ceiling; this file carries the reasoning.

The `write-copy`, `write-project-page` and `content-pass` skills point here.

Sections are in the order they were decided. Append a new pass at the end.

**`grep '^## ' docs/decisions/content.md` is the index.** A heading here states the decision it
settled rather than its topic, so scanning the headings beats scrolling the file.

---

## Phase 3 gate outcome (2026-08-16)

Four questions, settled. The first — what is safe to say about Second Dinner — stays in
[`CLAUDE.md`](../../CLAUDE.md), because breaking that one is a disclosure rather than a bug. The
other three are here, keeping their original numbers.

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

Every `banner.png` under `src/assets/images/projects/<slug>/` is a **600×150 logo strip** from the old page
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
shots for the gallery, is [#46](https://github.com/ali-wallick/portfolio/issues/46), which carries the framing that makes rough captures
acceptable there and nowhere else on the site._

### Phase 3 execution outcome (2026-08-16, merged 2026-08-17)

Executed on branch `phase-3-content`, merged via [PR #7](https://github.com/ali-wallick/portfolio/pull/7)
at `5452fdc`. `npm run verify` and `pre-launch-check`'s sweeps pass clean, with zero
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
chasing accuracy against old PHP pages and a decade of blog posts. It ran as #31 and #32 — see
"The wording pass" below. This is not a license to leave rough prose now — the Phase 3 write-ups
are meant to be genuinely publishable as written — it's an acknowledgment that a dedicated read-through
pass still happens once, later, with fresh eyes and real styling.

## The wording pass (2026-08-24)

The sitewide tone and voice pass ([#31](https://github.com/ali-wallick/portfolio/issues/31),
[#32](https://github.com/ali-wallick/portfolio/issues/32)), run against the measured voice reference
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

**And `role` is an array as of 2026-08-27** ([#152](https://github.com/ali-wallick/portfolio/issues/152),
decided in the [PR #151](https://github.com/ali-wallick/portfolio/pull/151) review thread). It was
the one multi-value field on a project modelled as free text, so `Designer, Artist` was a
hand-joined string that only looked structured. Rendered output is unchanged — `ProjectMeta.astro`
joins with `, `, and a one-hat role is simply a one-item array. **The join is deliberately not the
meta strip's `·`**, which separates metadata _categories_; inside `role` it would read
"Georgia Tech · Designer · Artist" as three independent facts rather than a location and a two-part
role. This also makes the title-only rule above structural rather than a convention: a scope clause
was easy to append to a string and is conspicuous as an array element.

**Correction, 2026-08-24 (#97): that change was not "the last em dash in visible copy," as CLAUDE.md
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
page argues — a call for Ali, not a design question.
A **Zion Narrows hiking shot**, which lost to the cosplay because a costume is something she _made_
and a hike is a place she went; that slot is the only image on the site of her making something with
her hands outside work, which is the non-work register of the "logic of programming and creativity
of design" thesis recorded in [`CLAUDE.md`](../../CLAUDE.md). The honest cost, since it is a real
one: every image on the site
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
not to pre-design a migration policy for one entry years ahead of it. The guideline above is
narrower than it can be read: it is calibrated to small/early projects, not a ceiling on richer
ones.

**The moment arrived on 2026-09-09, for Firefall rather than Kaneva (#358).** The trigger was not
age: `/projects/aliwallick-com` needed a featured slot and Ali wanted the tier held at five, so one
entry had to move. Firefall went instead of Kaneva on the merits — it was the thinnest featured page
by a distance (211 body words against Kaneva's 306, no gallery, one archived link, one year against
four), and Kaneva carries the origin of Ali's UI specialty and the menu-animation-system story the
voice reference cites as the exemplar of her writing.

**The body moved untouched, and that is this section's rule doing its job rather than a shortcut.**
Ali's framing, and it is worth stating as the general form: _leave a demoted entry as it is unless
you actually want to adjust it._ Demotion is a statement about which five entries lead `/projects`,
not a judgment that the writing was too long. Nothing about the page changed except which tier it
sorts into, and `featureOrder` came off because that field means nothing outside the featured tier.

**One repair went with it.** `src/content.config.ts`'s tier comment pointed at CLAUDE.md for this
rule, and [#335](https://github.com/ali-wallick/portfolio/issues/335) had moved it here — so the
contract every session reads cited a document that no longer said it. That is why a session in this
pass read CLAUDE.md, concluded a demotion required rewriting the body to archive register, and told
Ali so. **A cross-reference that survives the move but stops being true is the failure the split was
supposed to avoid**, and it is invisible to every guard in `verify`. The comment now names the file
and the section.

**This is permission, not a quota.** An entry with nothing more to say stays summary-only, and that
is a correct outcome rather than an unfinished one. Prodigal earned a body because the old page had
three things the summary had dropped: the biblical parable the game is named for, the two-mode
design (side-scrolling travel, top-down hunt), and Ali's own note that the opening and closing
pictures aren't hers. The last of those was the load-bearing one — `role: Solo — design, programming,
and art` was, on its own, a slightly _broader_ claim than what she wrote herself in 2009.

**Correction, 2026-08-24 (#92): the load-bearing reasoning above no longer holds, and the caption it
justified is gone.** `role` was trimmed sitewide to a title with no scope (see "The wording pass"
above) — Prodigal's is `Solo developer` now, not `Solo — design, programming, and art` — so the
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

## The current-work line is facts, and each page writes its own sentence (2026-09-04, closes #207)

`jobs[].currentNote` — one finished sentence the homepage's "Currently" box and About's career
paragraph both rendered verbatim — is now `jobs[].current: { since, doing }`, read through
`getCurrentWork()`. The homepage composes "Since 2024, I’ve been on a new team at Second Dinner,
building our first game in Godot!" and About, which has just named the studio, composes "Since
2024, I’ve been on a new team at the studio, building our first game in Godot." with the W4 Games
announcement linked from the whole predicate.

**The distinction that decided it: single-sourcing guards facts, and this field was sharing a
sentence.** The two-page résumé pass had already written the rule from the other side — restating
a fact is the job; restating a sentence is a bug — and the shared sentence was showing its seams in
code, not only in prose. About split the string on the word "Godot" to inject a citation, with a
comment admitting a reword would silently drop it. #253 put a 90-character ceiling on the field for
the homepage's one-line box, so a layout constraint on one page was rewriting the copy on another
(it is why "the studio’s first game" became "our first game"). And the field's own comment had
grown a three-clause contract for its consumers. A fact with a contract like that is a sentence.

**What is single-sourced now: the year and the claim.** The framing "a new team" (#129) is
written in both pages, and that is accepted rather than overlooked: it is settled phrasing guarded
by CLAUDE.md, the same way the résumé group `intro`, `resumeSummary` and LinkedIn's `ABOUT` — the
four other hand-written copies of this claim — already are. The schema protected the fact on two of
six surfaces; it still does, and the sentences stopped fighting.

**The 90-character ceiling moved to the page that has it.** `index.astro` composes the line and
throws at build time if it exceeds 90 characters, so a longer `doing` fails the build instead of
orphaning "Godot!" in production. The exclamation is the homepage’s too; About ends on a full stop.

**About links the predicate, not the word.** "building our first game in Godot" now points at the
W4 announcement, which is better link text than "Godot" was — a reader would expect that word to go
to godotengine.org — and it removes the dependency on the field containing any particular word.

Ruled out: About writing its own full sentence (a fifth hand-written copy with no shared data), and
a templated string with a `{company}` slot ("on a new team at there" shows how fast it needs a
second rule).

## A project has a `kind`, and a hero may be a card (2026-09-05, closes #49, #60)

Started as Ali reading #49 — a low-friction surface for Godot side projects — and saying it need not
be Godot projects at all. Her list of what she actually wants to write up next: the current job,
this website, other non-game projects, and talks — the specific unannounced ones are hers to name
when they exist. Two are the likeliest to exist soon, and she wanted them as **draft pages that never
show on the production site but can be added to until she is ready.**

**The draft half already existed and needed nothing.** `draft: true` renders in `astro dev` and on
every non-`main` branch preview; production, the sitemap, the OG-image set and the completeness
check all exclude it, and previews mark it `noindex`. A draft can sit in `main` indefinitely. That
is the mechanism; it just had never been described as one.

**What was missing was a `kind` axis on `projects`, not a second collection.** #49 proposed a
separate, looser collection, which was right for the two-paragraph notes it described and wrong
for what Ali listed: those are write-ups that happen not to be games, or cannot be pictured. Every
consumer of a project — the index, the cards, the OG cards, the sitemap, `check-links`, the
JSON-LD — reads `projects`, so a second collection is a second copy of all of it. What the schema
assumed instead was that **every entry is a game with a picture of it**, and that assumption is the
thing that moved:

- **`kind: game | site | talk | tool`, defaulting to `game`.** The sixteen existing entries are
  untouched. A non-game entry shows its kind as a chip on the meta strip ("Website", "Talk"), and
  `status` is optional for it — a talk has no shipped/jam state to be honest about — but shown as a
  second chip where one is true. Named for what the thing **is**, not what it was built in; #49's own
  open question, and "Godot" would have duplicated `engine`.
- **`hero: { type: art }` — the generated card at hero size**, for a page whose subject **cannot**
  be pictured. The completeness check is exactly as strict as before; `art` is the honest way to
  satisfy it when a picture is not something Ali can supply later but something the page must not
  have. **Do not reach for it because sourcing a picture is inconvenient** — a jam entry with no
  capture is a draft. It renders as a 3:1 band in the hero's own mat; 21:9 was built first and read
  as a picture that failed to load.
- **`links[].kind` gains `slides`.** Six characters, same as `source`, so the "See Also" gutter did
  not move.

**Two draft entries are the mock-ups, and both stay `draft: true` until Ali says otherwise.**
`/projects/second-dinner-godot` is `kind: game`, `status: unannounced` (which had sat in the enum
with its own colour pair and no user since Phase 5 — this is what it was reserved for), an `art`
hero, `featureOrder: 1`, and a body built only from the two Godot résumé bullets; the Phase 3
ceiling applies to every word Ali adds. `/projects/aliwallick-com` is `kind: site`, led by the old
homepage from `docs/before-after/`, with a scaffold body drawn from the rebuild log. **Its `role` is
deliberately empty**: the honest word for what Ali did on this site is hers to pick, and the
completeness check will refuse to publish the page until she does.

**This closes #60 by deciding it the other way.** #60 said "not a project page" because a thin page
beside Marvel Snap would highlight the thinness. A draft that stays draft until there is enough to
say is the answer to that objection, and a `kind` makes the comparison the page invites a fair one.
The ceiling is unchanged and matters more on a dedicated page, not less.

**The original low-friction idea is #323 now, and it is still the only thing that keeps a site
alive.** Nothing on Ali's list needs it, so it was split out rather than absorbed. Its test is
unchanged: whether Ali posts to it twice without an agent involved.

**`src/styles/base.css` is a `byteHashedFiles` input, so this regenerated the résumé PDFs.**
`check:resume-print` confirms the geometry did not move.

## The whitespace rule and title case became build guards (2026-09-07, closes #338 in part)

Two content conventions that were prose in the brief are rules 6 and 7 in `scripts/check-links.mjs`
now. Both are checked on the **output**, the move #188 made for apostrophes and for the same reason:
that is the only place `.astro` prose, Markdown bodies and front matter meet.

### A word welded to an inline element

The rule from "The wording pass" above — Astro strips the whitespace between a text node and a
following element when a newline separates them, which shipped `or head<a href="/">home</a>` on the
404 — now fails the build.

**Two narrowings, both measured rather than reasoned about, and both worth not undoing.**

**Only the open side.** `</a>` followed by text is the same shape in reverse, and it is also how
correct markup looks: `</a>.` and `</a>,` appear about ten times in `about.astro` and `404.astro`
alone, and Markdown run-in labels render `<strong>HUD:</strong> Player…` with the colon inside the
tag. The content record says the bug happens "in either direction" — **that is a statement about the
bug, not about what is worth checking.** A close-side rule would be all noise.

**Only inside `<p>` and `<li>`.** Outside prose, a missing space is routinely supplied by layout:
the résumé's download button is an `inline-flex` with a `gap`, so `Download PDF` abuts
`<span class="resume-pages">` in the HTML and still renders with a space between them. Unscoped, the
rule reports those two buttons and nothing else — **2 hits, 0 of them bugs.** Scoped to prose it
reports nothing, which is the rate a guard has to hit to be worth more than the sentence it replaces.

That button was flagged as a likely live instance of the bug when this pass started, and checking it
against a real build is what found the flex gap. **It was never broken.**

### Multi-word headings are title case

#182's rule, enforced on rendered `<h2>`.

**The scope is what makes it buildable, and #107 was right to decline the general version.** A
generic AP/Chicago checker cannot reach zero false positives on this site: `Dead Booty: An Atari
2600 Game` and `KinoClue: A Tangible Tabletop Mystery` are correct precisely because both styles
capitalise after a colon, `aliwallick.com` is deliberately lowercase, `Critter³` carries a
superscript mid-word, and `What I’m Building` breaks any tokeniser that splits on `’`.

**Every one of those is a data-driven `<h3>`** — a project title, a job title, a school. Those are
proper nouns, they are exactly what #182's carve-out excludes, and they are the entire false-positive
population. Every `<h2>` on the site is hand-authored: six in `.astro`, five in the résumé, and the
`##` headings in project write-ups. Thirteen distinct strings, all clean.

**So do not extend this to `<h3>`.** That it is clean on `<h2>` is not evidence it would be clean
anywhere else, and the brief's own standing warning is that an observed regularity about this site's
headings was cited back as a settled rule twice before Ali named it an accident.

## The site is American, and the sweep stops at the reader (2026-09-09, closes #357)

Nothing in the repo had ever stated which variant the site uses, so agents picked one per sentence.
The #355 copy review found a published page saying "the colours".

### Ali writes American, measured rather than assumed

The control was sitting in the repo the whole time. Her own primary sources — `snapshot/` (the old
site, ~36,700 words) and `content/archive/` (her blog posts, 2013–2019, ~5,400 words) — carry
**zero** British spellings between them. The old stylesheet is named `css/colors.css`. So this is
not a house style being imposed on her; it is her habit, and the site had drifted off it.

### It was seeded once and compounded, and the curve says so

Patient zero is `totalling`, in `docs/REBUILD-LOG.md`, in commit `0e2e465` — **the commit that added
the agentic layer**: CLAUDE.md, the first three skills, the settings and the hooks. The vector and
the payload shipped together.

From there it climbed monotonically to 452 across 260 commits. The count fell exactly five times,
always by one, always because a line was deleted for an unrelated reason. **Nobody ever corrected one
on purpose.** Density in docs prose ramps 0.41 → 2.2 per 1,000 words over the first week and then
sits flat at ~1.8 for six more: seeded, amplified, saturated. The full measurement is in
[`REBUILD-LOG.md`](../REBUILD-LOG.md).

### The leak is register-selective, which is the finding worth keeping

Same model, same sessions, same repo:

| Surface                                       | Instances |
| --------------------------------------------- | --------: |
| Rendered user-facing copy                     |     **1** |
| Docs, decision records, skills, code comments |   **451** |

Writing _as Ali_ — first person, through `write-copy` — the American default held across 25 pages.
Turning around to write _as an engineer explaining why_, British forms appeared at ~1.8 per 1,000
words, and in a specific vocabulary: `behaviour`, `normalised`, `generalises`, `centred`, `labelled`.
So "the model writes British English" is the wrong shape of explanation. Register is doing the work.

### Only the reader-facing surface was swept

**Fixed:** the one rendered instance (`grey` in the /about cosplay alt text), two comments in shipped
files (`public/favicon.svg`, `public/_headers`), and the ~20 in `CLAUDE.md` and
`.claude/skills/write-copy/` — the priming a copy-writing session actually gets before its first
tool call.

**Left alone: ~430**, in `docs/`, `scripts/`, `src/` comments and the other skills. Two reasons, both
measured. **80 of them sit in files that are byte-hashed inputs to `build-pdf.mjs`** — `base.css`
(38), `tokens.css` (23), `resume.css` (11) and six others — so a pure comment change there fails
`check:pdf` until both résumé PDFs are regenerated and committed, which is exactly the churn #249
warned about. And most of the rest is `REBUILD-LOG.md` and `docs/decisions/`, which are records of
what happened; rewriting their prose after the fact is revisionist for no reader's benefit.

### Why that is not the shape #188 rejected

The issue argued the #188 precedent points at sweeping everything: _"a rule with an exception in it
is a rule someone has to remember which surface they are on."_ **That does not transfer here, and the
difference is the reader.** #188's bug was _visible_ — `didn't` rendering beside `didn’t` on the same
page. A code comment saying `colour` next to rendered copy saying `color` is invisible to every
reader, permanently. And nobody has to remember which surface they are on, because rule 12 fails the
build. The exception is carried by the guard, not by a person.

**The guard is what makes the narrow sweep safe**, and without it the issue's objection would be
right: fixing the words while leaving the mechanism intact would just re-run the same leak. Instead
the leak is allowed to continue where it has no reader, and is caught at the boundary where it does.

### The wordlist is specific forms, and it is asserted against correct English

`scripts/check-links.mjs` rule 12, beside the apostrophe check and checked on `dist/` for the same
reason: the output is the only place the three prose sources meet.

Never an `-our`/`-ise` pattern. `analysis` and `emphasis` are not `-ise` verbs, `capitalism` and
`specialist` are not variants, `dialogue` and `catalogue` are standard American, `--color-*` token
names are already American, and `aria-labelledby` is markup that appears five times in the built
résumé. The pattern is stem + `is` + suffix, so the noun forms never match.

**The dangerous failure mode is a form that matches the American spelling**, because it fails the
build on correct copy everywhere at once. Two drafts did exactly that — `colou?rs?` matched "color",
`honou?red` matched "honored" — and both were caught only because the site happens to use those
words. A wordlist edit breaking a word the site does not use yet would have shipped. So the list is
asserted against a sample of correct forms before it runs, and extending it without extending that
sample is meant to be loud.

The one residual false positive is a proper noun — a game actually titled _Centre_, a quoted source
outside backticks. No such title exists, so the exemption hook is deliberately not built; that is the
call #338 made about its own candidates.

## Firefall back to featured, aliwallick.com to the archive (2026-09-13, reverses #358)

**Ali's call: it reads better.** #358 offered three ways to publish `/projects/aliwallick-com`
without growing the featured tier past five. It took the first one, demoting Firefall. This takes
the second one, which #358 had argued against: the website goes to the archive and Firefall goes
back to its old `featureOrder: 5`. The five featured write-ups are the same five as before
2026-09-09, in the same order.

**#358's objection to this option was about the tier's register:** the archive is history rather
than a portfolio pitch, and this page would be the longest thing in it. That objection is real, and
it did not outweigh how the featured list reads. The body stays untouched for the same reason
Firefall's did when it moved: _leave an entry as it is unless you actually want to adjust it_, and
"Archive pages may carry a short body" above is not a ceiling on what a richer entry keeps.

**What moves besides the two tier fields:** the website becomes the first archive tile (the archive
sorts newest first), and its tile image is its hero, the old homepage, because it has no
`thumbWide`. The homepage's featured list swaps its card for Firefall's. Prev/next on the detail
pages follows the new `/projects` order. The résumé, OG cards, sitemap and URLs do not read `tier`
and are unchanged.

## A second wording pass, read across the site (2026-09-27, #390)

Ali asked whether a newer model would change anything. The measured numbers had held since #31
(16.2 words per sentence, zero em dashes), so the answer was specific sentences rather than a
rewrite. **The pass was worth running because it read every page in one sitting.** Its main finding
was three sentence shapes that each appeared once per page on several pages, which no per-page pass
could see. The `write-copy` skill now says to judge the site as well as the page.

Five things it settled that a future session would otherwise re-derive:

- **Archive entries describe gameplay in the third person, tier-wide.** Art of Rescue, Critter³ and
  Secret Garden's summaries and Night Light's body were written as instructions to the reader
  ("Cycle each tile’s resource…"). SKILL.md §4.13 already preferred third person, and four
  instances made it a pattern rather than a choice. All four now say "Players…" or name the
  character.
- **A relative duration that will silently go false is anchored to a year.** "The last five years
  on the board of my synagogue" is now "Since 2021", and the résumé summary's "Seven of those at
  Second Dinner" is now "At Second Dinner since 2019". This is the site's founding bug (present
  tense that stops being true) in a quieter form. **"Fifteen years" is the exception and stays**:
  it is the homepage's settled number ("The wording pass" above), and it accepts an annual edit on
  purpose.
- **A figure about someone else's live product carries the year it was checked.** Puzzle Cats'
  download count, rating and "still live" now read "As of 2026" (Ali's call: keep the figures, date
  them). `links:external` notices a dead link but never a wrong number.
- **The Vegas Blvd Slots meta systems are Ali's work.** Rewards, gifting, leagues and tournaments
  had been written as features of the game on both the page and the résumé. She worked on all of
  them, so both now say so. The general form is in `write-copy` §6: compression can under-claim.
- **The aliwallick.com "About, after" image is current, and the cutover pair is not.** The gallery
  image was recaptured from the branch build at `capture-comparison.mjs`'s desktop settings, since
  it still showed the headshot and Kerbal photo #181 moved off /about. `docs/before-after/` was
  left alone, because it is the record of the site at launch.
