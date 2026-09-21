# Decision record — résumé

Why the résumé is built the way it is — both densities, the print pipeline, the paper look, and
the guards around them. **Everything here is settled: do not relitigate it.**
[`CLAUDE.md`](../../CLAUDE.md) is the standing brief; this file carries the reasoning.

For the _mechanics_ of adding or changing résumé content — which files to touch, what to
regenerate, what to commit together, the gotchas — use the `update-resume` skill
(`.claude/skills/update-resume/SKILL.md`) instead. Keeping the how-to out of here is deliberate: a
second copy of the mechanism is exactly the drift the content model's guard table exists to rule out.

Sections are in the order they were decided. Append a new pass at the end.

**`grep '^## ' docs/decisions/resume.md` is the index.** A heading here states the decision it
settled rather than its topic, so scanning the headings beats scrolling the file.

---

## Phase 4 gate outcome (2026-08-17)

Four questions, settled.

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
correction under Phase 5 in [`design.md`](design.md), and the token warning under "Working here"
in [`CLAUDE.md`](../../CLAUDE.md).

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

## The resume formality pass (2026-08-26, closes #32)

Ali's brief: **"significantly more formal" than the rest of the site.** Distinct from #31, which
tuned site prose toward her own measured voice. The resume is a different genre, and the target is
her own 2019 resume, not her blog.

**The bullets are labelled now, and the format is recovered rather than invented.** Every bullet is
`{ label, text }` in the schema and renders as **`Label:`** plus a clipped formal clause. Ali's 2019
resume was built exactly this way ("Vegas Blvd Slots:", "UI Programming:", "Client Engineering:"),
which makes it the same argument the Phase 5 palette revival ran on: a format Ali chose herself
cannot be mistaken for a template. `resources/WallickAli-Resume.pdf` is the redacted PDF, and `resources/resume-redacted.png` beside it
is a readable 200-DPI render (#360) — reach for the PNG first. The PDF has to be decoded to read — it is a subset-font PDF, so `grep` gets
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
the collection at `f812139` (#61) for lack of a `hero`. Cutting it means every _project_ in the
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
Phase 3 gate ([`content.md`](content.md)) makes for the Marvel Snap `Tooling` bullet being worth a
reader seeing twice. Don't
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

### An inline box's rect is a fact about line breaking, not about the element (2026-08-31, closes #284)

The tolerance above had one blind spot, and it made `check:resume-print` red on Ali's Mac against a
green CI on the same clean `main`. **`getBoundingClientRect()` on an inline element returns the union
of its line boxes**, so it measures where the lines happened to break. The moment shaping drift in
the _preceding_ text lets one more word fit at the end of a line, an unchanged element reports
`680 × 31.91` in one environment and `468.84 × 15` in the other — a 31% width diff and a full
line-height of `y`, while the containing `li` is byte-identical at `685 × 33.81` in both. Nothing
wrapped differently; only which line the continuation started on.

**Inline rows now assert `advance`** — the summed width of their line boxes — instead of that union
rect. It is break-invariant (to within the space a break collapses, ~0.6% here) and still moves on a
text edit, a font-size or tracking leak, or a padding leak. What it gives up is positional assertion
on inline boxes, which is an admission rather than a loss: an inline's `x`/`y` is a function of line
breaking and was never portably assertable. **Block-level elements keep the strict `y`/`height`
check**, which is where a reflow belongs — a line gained or lost changes the height of the block
containing it. Verified by injecting leaks: an inline `padding-inline` invisible to every captured
style property flags 23 elements, and a real reflow flags 119.

**The trigger was that the baseline had quietly become _Linux_-recorded, and nobody could see it.**
#191's baseline is a mix of integer and fractional widths (CoreText subpixel advances); from #238
onward every width in the file is a whole number, which is FreeType rounding. So macOS had been the
odd one out for three commits, with no way to tell from the file. **The baseline now carries an
`environment` block and the script names the mismatch above any diff** — "baseline recorded on
linux, this run is darwin" — which is the line that would have started #284 instead of ending it.

Two things that were investigated and are dead ends, so nobody re-runs them: **Node version is
irrelevant** (Node launches the browser; it does not lay out text), and
`--font-render-hinting=none`, `--disable-font-subpixel-positioning` and `--disable-lcd-text` produce
byte-identical output on macOS, because they act on FreeType. There is no flag that makes the two
platforms agree from this side.

## The resume switches density in place (2026-08-29)

Ali's pick from four options, chosen over cross-document view transitions between the two routes.
`/resume` now toggles between the one-pager and two-pager in place instead of navigating: a
segmented control flips `data-density` on the article, the document grows into its long form, the
URL becomes `/resume#detailed`, and the PDF link follows. The mechanism a future session needs to
know:

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
  two-pager URL for humans is still `/resume/full` — a no-JS visitor handed `/resume#detailed` sees
  concise, which is the accepted cost of hash state.
- **The enhancement script's init must never write to the article** (`src/scripts/
resume-density.ts`, which is in `build-pdf.mjs`'s `byteHashedFiles` for exactly this reason —
  a future on-load flip would silently change the committed PDF). The `#detailed` deep link is
  applied by a tiny `is:inline` script in `resume.astro` before first paint; the module only syncs
  the controls.
- **The animation is `document.startViewTransition`**, feature-detected, skipped under
  `prefers-reduced-motion` — checked in the script because no token can express a transition's
  _absence_, the same reasoning as the reticle's own fade curve. (This used to say a token cannot
  reach a view transition at all, which is wrong; see the correction under "The density toggle's
  motion" below.) Per-element `view-transition-name` polish was deliberately left for a later pass
  with Ali, and is settled now — same section.
- **The print-geometry baseline now renumbers on every resume edit.** `nth-of-type` counts hidden
  siblings, so both routes' paths shift when a bullet is added anywhere. (It also used to capture
  those hidden subtrees' children as zero-rect rows; since
  [#330](https://github.com/ali-wallick/Portfolio/issues/330) a hidden subtree is one row asserting
  it is still hidden.) The `update-resume` skill carries the how-to-read-it note; the check that
  matters is that visible rows' _values_ (y/height especially) didn't move.

## The density toggle's motion: the document reflows, it doesn't dissolve (2026-09-01, closes #260)

Settled with Ali on a live switcher, the eighth run of that loop. Ali's issue was two sentences —
"could look cool if it slid over time into place" — and the toggle already ran inside
`startViewTransition`, so what was missing was never the transition. It was that **nothing on the
résumé carried a `view-transition-name`**, which makes the whole page one snapshot: the document
cross-fades into its taller self and no part of it appears to move.

Each `.resume-section` and `.resume-job` is named now, so every one gets its own group and tweens
from its old rect to its new one. Skills and everything under it slide the 142px the revealed
Summary pushes them; Summary fades into the gap that opened. Mechanism in
`src/scripts/resume-density.ts` and `src/styles/resume.css`; both carry the reasoning beside the
code.

**The measurement reframed the issue before any candidate was built.** The résumé is 2.75x the
viewport at concise and 4.32x at full on a 1280x800 desktop, 4.49x and 7.56x on a 390x844 phone. So
at the top of the page, where you actually click the tabs, **the entire visible event is one 93px
paragraph appearing and everything under it moving down 142px.** Personal Projects, the extra
bullets and Education are all below the fold at the moment of the click. Anyone tempted to make this
grander should know it is a small local event, not a document-wide reflow.

**The names are written for the duration of the toggle and taken off again**, which is two decisions
in one and both matter. At rest the DOM is untouched, so `build-pdf.mjs` and
`check-resume-print.mjs` — which navigate `/resume` fresh and never toggle — measure exactly what
they measured before this existed. And `base.css` opts the whole site into _cross_-document
transitions, so a name left on an element would make navigating **away** from `/resume` animate that
element separately from the page: a different feature nobody asked for. Transient names cannot leak
into it.

**An index is a safe key here and nowhere else.** Density hides nodes; it never adds, removes or
reorders them, so the nth match is the same element in both states. If a future density difference
ever changes the node list, this has to become a content-derived key — a name that moved between
states would tween the wrong pair of rects.

### Three candidates lost, and one of them should not be rediscovered

- **A whole-page directional slide**, travelling the way the tab strip reads. It works and it is on
  the wrong altitude: it animates the page rather than the change.
- **The tab fill sliding between tabs**, which Ali rejected as too much motion on top of the
  document already moving.
- **The revealed sections arriving from above** rather than fading into the gap — the closest
  literal reading of "slid into place", built as its own round, compared side by side, and not
  taken. It is the one most likely to be proposed again as an obvious improvement. It was not
  overlooked.

### Four things measurement corrected, all of which had produced confident wrong answers

- **A view transition's snapshot is not clipped to the viewport.** This was the stated risk that
  nearly kept named elements off the table at all: the Experience section is 1215px against an
  800px desktop viewport, and the Second Dinner entry is 1495px against a phone's 844px. Chromium
  captures them at full height — `1215.44px` and `2562.31px`, read off the pseudo-elements
  mid-flight. There was nothing to insure against.
- **A custom property _does_ reach a view transition's animation.** The pseudo tree is anchored on
  the root element and inherits from it, so `var(--duration)` resolves inside
  `::view-transition-group(*)`. What no token can express is a transition's **absence**, which is
  the real reason the reduced-motion opt-out is written as `animation: none`. Corrected in
  `base.css` and in two places in these records.
- **Firefox 144 shipped same-document view transitions** (October 2025), so the toggle has been
  animating there for most of a year while `resume-density.ts` claimed it did not. Cross-document
  transitions — `base.css`'s `@view-transition` — are still the half Firefox lacks.
- **The tab strip does not "jump" when the density changes, it cross-fades.** `.resume-actions`
  sits outside `article.resume` and is named by nothing, so it stays in the root snapshot for the
  whole duration. The switcher's own label for the incumbent said "jumps" and was wrong; that is
  plausibly why a sliding fill read as too much, since it was adding a slide on top of a cross-fade
  rather than motion to a still control.

**A headings-only variant was also built and cut before it ever went on the panel**, on the first of
those corrections. Worth recording because the failure is general: naming only the headings detaches
each from its own body text, which then cross-fades in place underneath — the old Skills rows print
straight through the new Summary paragraph. **Name whole blocks, or name nothing.**

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
under Phase 5 in [`design.md`](design.md) for the print block being beatable on specificity.
**Anything added to the panel goes
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
  the CLS reason under Phase 5 in [`design.md`](design.md).
- **A 1px border moves whatever is measured from it, and this control hit that four times** — the
  rule's own thickness, the tab's left border, the panel's border, and finally a `+ 1px` ported
  from the lab that was right there and wrong here, because the port dropped an inner flex wrapper
  and a negative margin resolved differently. Hence the habit, which generalises past this project:
  **when a border or a negative margin is added to something an alignment is measured from,
  re-measure — do not port the number.** The vertical and horizontal offsets on the download are
  asymmetric today for exactly this reason, and that is correct rather than a fudge.
- **Below 48em the download leaves the header and the bar becomes `column-reverse`.** The tabs are
  first in the DOM because that is the order a keyboard and a screen reader should meet them in;
  reversing the paint keeps them on the bottom line still touching the panel, without touching focus
  order.

### The résumé PDFs were never actually set in Public Sans (2026-09-05, closes #306)

#191 named a self-hosted face for paper and CLAUDE.md has said since then that the PDF is
"reproducible on any machine". It wasn't. Every PDF this repo has ever committed was set in a
platform fallback — **Helvetica when rendered on Ali's Mac, Liberation Sans when rendered on
Linux** — which is precisely the machine-dependent substitution #191 existed to end, and on macOS
precisely the unlicensed-embed problem it named.

**The cause is a load-order trap worth carrying past this repo: a webfont used only under
`@media print` is never fetched until something switches to print media.** `page.pdf()` emulates
print internally, so `build-pdf.mjs` looked complete. But on screen the résumé is set in Figtree,
so nothing requested Public Sans, `document.fonts.ready` resolved without it, and the print
snapshot was taken before the fetch it had just triggered could land. One line —
`page.emulateMedia({ media: 'print' })` **before** the `fonts.ready` await — fixes it.

**It hid because the two guards were measuring two different documents, and each was internally
consistent.** `check-resume-print.mjs` emulates print media, so it has always measured the real
Public Sans layout and has always passed. Nothing ever looked at the PDFs' own embedded fonts. The
on-screen `/resume` page is Figtree, so **nobody had ever seen the Public Sans rendering** — the
face was chosen on a switcher, verified by measurement, and then not shipped. Its content height
is 927.92px, which is the 928px #191 recorded, so the geometry was right the whole time; only the
glyphs were somebody else's.

**The guard is `assertPrintFace` in `build-pdf.mjs`, and what it asserts is the part worth
copying.** #306 opened with byte or content-stream comparison against a reference render, which
cannot work — Chromium stamps a fresh `/CreationDate` and `/ID` into every PDF, and glyph IDs are
subset indices, so identical documents diff as thousands of changes. **The property that was
actually drifting is which face got embedded, and a PDF states that about itself.** So the check
needs no browser, no reference render and no tolerance, and runs in `--check` on Cloudflare beside
the staleness hash. It deliberately does not police the subset count: gating on that would fail a
build for the platform it ran on.

**The general shape: a hash of the inputs is not a check on the output.** `check:pdf` proved the
committed PDFs were built from today's résumé and said nothing about how. That gap is why a
wrong-face document shipped for months with three guards green.

**And if you add a design token, add it to `resume.css`'s `@media print` block too.** That block
pins paper to the Phase 4 palette and type scale by redefining tokens, and it only covers the ones
listed in it — anything new reaches the PDF. The page-count assertion catches a leak big enough to
cost a page and nothing smaller, which is how Phase 5 shipped 19pt of silent reflow. **And pinning
a token is not sufficient either** — any selector outranking a bare `:root` beats the print block
regardless of the media query. Both failure modes, and the fix, are under Phase 5 in
[`design.md`](design.md) and in
[#35](https://github.com/ali-wallick/Portfolio/issues/35).

## The résumé's paper look (2026-09-06, closes #235)

Settled with Ali across twelve rounds on a live switcher — the thirteenth run of that loop, and the
first on paper. The instrument rendered the printed page on screen, at letter geometry, with the
print cascade transcribed and the real page breaks simulated; it is kept as a template in the
`design-switcher` skill (`references/resume-paper-sheet/`) for the next pass, for the same reason
#246 kept the panel out of `src/`. PR [#326](https://github.com/ali-wallick/Portfolio/pull/326)
carries every round's measurements. What belongs here is what settled and the four rules that
generalise.

**What settled, all on paper.** The name in Gabarito at 24pt in the site's magenta (`#c4005f`),
with the section headings and their rules in the same ink and nothing else — the ink stays on the
things that name the document's structure. Two faces and no more: Gabarito on the name only, Public
Sans for everything else including the section heads, because a display face on job titles or
labels reads as a third register. Section headings carry the rule running from their end to the
right edge on the same line, with 14pt above each. The header is two columns: name and role left,
the location on its own line under the role, the three contact lines stacked right. The job line is
company first and bold, then the title. Skills is one aligned label column. Each Second Dinner group
carries a 1.5pt magenta bar down its left, with an italic subtitle, and no other job does: **the bar
means "one of several bodies of work under this employer"**, which is why the uniform version lost.
Page 2 of the two-pager opens with the name at 16pt and "Page 2 of 2" in a taller top margin.

**What the screen took, and did not.** The site's résumé keeps its own type and colour. It took the
structural half — company-first, the aligned skills column, the bars — and the bars are in
`--color-frame`, not the accent: on screen magenta means _where you are_ and the frame colour
already means _this object has an edge_. **The contact block is hidden on screen**, Ali's call: the
header, the footer and `/contact` carry the same three links, and the slot is where the download
button lives. Paper keeps it, because a PDF that does not say whose it is gets separated from its
filename.

**Ali's brief was that paper may diverge where something looks good printed and would not on a
webpage, and the location line is the shape of that divergence**: one DOM string, a separator the
print block hides and a span it makes a block. Nothing is written twice.

### Four things measured, each of which overturned a plausible answer

- **`@page` margin boxes work in Chromium 151, and they are how the page-2 header is done** —
  `@page :first` keeps them off page 1, `counter(page)` and `counter(pages)` resolve, and pages
  after the first can carry a different top margin. So the header costs page 1 nothing and page 2
  48px: **the two-pager's budget is 960 + 912, not 2 × 960**, and `resume-headroom.mjs` reads it
  that way. Two limits from the same experiment: a webfont named in a margin box does not resolve
  (the box falls back to the body face, so the header is Public Sans and names it explicitly), and a
  `position: fixed` element is not a repeating header (it printed once, on page 1, in the content
  area). And cascade order beat `:first`'s specificity for the box's `content` — the first render
  printed the name on page 1 as well, because `ResumeDocument.astro`'s inline rule came later in
  the document than the stylesheet's exclusion. The exclusion is repeated after it, on purpose.
- **A variable font embeds as a Type 3 font, and the guard could not see it.** The first PDFs set
  the name in `Gabarito Variable`; Chromium embedded the instance as glyph procedures with no
  `BaseFont`, which is the one kind of PDF text applicant-tracking parsers most often cannot read,
  and on a résumé the name is the worst place for that. `assertPrintFace` scanned only `BaseFont`
  and passed. Paper names the **static** Gabarito 700 now (`@fontsource/gabarito`, imported on the
  two résumé routes beside Public Sans), and the guard reads `/FontName` too and fails on any
  `/Subtype /Type3`.
- **The one-pager had 32px of slack, not the 102 this file recorded from #32** — bullets landed in
  between (#191 measured 928 of 960, and that was the truth this pass started from). It is at
  **947 of 960** now, with 14pt section spacing chosen over 12pt knowing it spent most of the rest.
  The next bullet added to the one-pager costs a page, and `update-resume`'s trim rule applies.
- **A left-gutter layout — headings in a margin column, the textbook "designed résumé" — cannot fit
  the one-pager.** It costs the content column 116px of its 701 and every bullet rewraps: 120px
  over on its own, 88 over with every height-saving mark beside it. Measured, labelled as such on
  the panel, and not taken. Don't rediscover it.

### Two rules for the next pass on paper

- **Measure the instrument before judging anything on it.** The sheet was checked against
  `/resume` under real print emulation, element by element, and read 94 of 94 before any candidate
  went up. A transcription of the print block that drifts by one rule is a convincing wrong
  instrument.
- **Show the break, not a line.** A job never splits across pages and a heading never ends one, so
  the real break falls before the first block that would cross, pulled back past any heading it
  must stay with. Ali could not tell where the two-pager broke until the sheet paginated that way.
  It breaks before MobilityWare, leaving 128px white on page 1, and that is the cost of never
  splitting a job. If the Second Dinner entry ever grows past a page it will split inside itself —
  the case to watch.

## Paper's token vocabulary is three pins (2026-09-06, closes #327)

The `@media print` block's `:root` carried 54 pins and an instruction to add every new token to it.
It carries **three** now — `--font-body`, `--leading-tight`, `--measure` — and no instruction.

**The 51 that went were insurance against a hazard that stopped existing.** Bisected per pin at
HEAD, by two independent methods (deleting each pin from the served CSS, and injecting
`--pin: initial`, the guaranteed-invalid value): 51 of 54 move **zero rendered elements** on either
route. Since #62 an unpinned token on paper is _undefined_, so a declaration using one drops to its
initial value — **an unpinned token cannot print a surprise, because it prints nothing.** Every one
of the 51 was justified by some version of "pin it so a future rule that picks it up prints
something sane rather than a surprise," and that is the sentence the measurement retired.

**The criterion that settled it was Ali's: keep the pins with a connected decision. It collapses to
the same three** — and the two best-documented pins turned out to be the clearest deletes.
`--measure-wide` and `--color-index` were the only pins carrying a comment written to justify their
own existence, and both said "pinned per the rule at the top of `tokens.css`" — a rule #108 had
already corrected to "decide whether paper needs it." Their connected decision had been overturned
in the file they cited. **A pin justified only by a rule is worth exactly what the rule is worth.**

**They are pins rather than literals, and that is the reason Shape B lost.** `p, ul, ol { max-width:
var(--measure) }` is a top-level `base.css` rule. A pin tracks that selector automatically; a
literal `p,ul,ol { max-width: 68ch }` in the print block is a second copy of the selector, free to
desync the moment the selector changes — the drift the content model's guard table exists to rule
out. Replacing 51 inert lines with a real coupling is a bad trade.

**Two observations were rescued as prose rather than as 19 pins**, because they are true and would
otherwise have been orphaned: Phase 5's interaction layer has nothing to say on paper _by nature_ (a
reticle cannot exist on a sheet; a printed résumé states its own dates), and a height device that
reaches paper is a page-count hazard that surfaces as a build failure several bullets later rather
than as anything visible. Both are in the block's header now, addressed to whoever writes the next
print rule.

### The guard question, and why no new guard was built

The spike proposed a check enumerating print-reachable `var()` consumers. Measured, it would be
mostly redundant. Injecting a print-reaching rule into `base.css` both ways:

| Rule consumes         | On paper                | `check:resume-print`                  |
| --------------------- | ----------------------- | ------------------------------------- |
| a **pinned** token    | applies, geometry moves | **fails loudly**, dozens of rows      |
| an **unpinned** token | silently no-ops         | **passes** — correctly, nothing moved |

So the PDF's correctness is already guarded. The only gap left is _"an author wrote a print rule
that silently does nothing"_ — a dead-rule linter, not a wrong-PDF guard. Worth building if that is
ever the stated goal; it is not what #327 was for.

**#235 had left a stale claim inside the block, and the prune caught it.** `--font-mono`'s comment
said "Paper is set in one face" — false since the paper-look pass. `.resume-head h1` names static
Gabarito **literally**, so `--font-display` was bypassed entirely rather than being the mechanism.
Paper is two faces, and the surviving `--font-body` comment says so.

**Four stale "denylist" sites were corrected and one was kept.** `resume.css`'s in-block comment
(which contradicted `tokens.css`'s corrected header outright — two files giving opposite
instructions for the same act), `.claude/skills/design-switcher/SKILL.md` (instruction to a future
session, so the highest-leverage one), `base.css`'s reticle-timing comment, and
`check-resume-print.mjs`'s own header. **`resume.css`'s universal-`transition` comment was kept**:
it calls the block's _property_ rules a denylist, which is still true and is now the only live half
of the hazard.

**The re-baseline was 42 rows and all of them were hidden chrome.** `check:resume-print` captured
`.site-header`, `.site-footer`, `.page-head` and `.resume-actions`, which the print block hides —
so a change that moved nothing on paper still showed up as 42 diff rows. That was a property of the
guard, not of this change, and it was
[#330](https://github.com/ali-wallick/Portfolio/issues/330), fixed the same day — see
"A hidden subtree is one row asserting it is hidden".

## A hidden subtree is one row asserting it is hidden (2026-09-06, closes #330)

Split out of #327, and it is the same trap that issue recorded, one file over.
`scripts/check-resume-print.mjs` dropped any element whose own `display` computed to `none` —
which drops a hidden block and **keeps every descendant of it**, because `getComputedStyle` on a
child of a `display: none` element returns the _child's_ own display. The filter had to be an
ancestor walk, not a per-element check. That is the same distinction #327's spike got wrong in the
other direction: a naive filter there reported 21 unpinned-token consumers on paper when the real
number was 3.

**The cost was measured rather than assumed, which is the reason this was worth doing.** #327 moved
nothing at all on paper — bisected per pin, 51 of 54 changed zero rendered elements — and
`check:resume-print` reported **42 diff rows** anyway, every one of them chrome that never reaches
the PDF. So the guard's signal-to-noise ran backwards on exactly the changes it should have been
cheapest for.

**The fix is not to drop those rows, and that distinction is the decision.** A chrome block
_becoming_ visible on paper is a real bug — it is why `base.css` has an `@media print` rule for the
reticle at all. So the root of each hidden subtree is recorded as a one-field row asserting
`display: none`, and its descendants are not captured. **A row asserting that something is hidden
is a better guard than a row asserting the geometry of something invisible**, and it is a cheaper
one: flipping it is one named field on one named element rather than a scatter of rects.

**Verified by injecting each failure it has to catch**, since a guard that got quieter is exactly
the change that needs proving it did not get blinder:

| Injected into the print block            | Rows reported                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------------- |
| `.site-footer` no longer hidden          | `display: "none" → "rendered"` on the footer, plus its whole subtree as added paths |
| A list indent (`padding-left` on a `ul`) | 21                                                                                  |
| A colour leak, costing no height         | 45                                                                                  |
| A font-size leak                         | 195                                                                                 |
| The #330 change itself                   | **0 changed rows** — 92 removed, 37 added, no geometry or style moved               |

That last line is the whole point: the structural churn is a one-time re-baseline, and every
rendered row's values came out identical.

**Two things the pass swept up.** `<script>`/`<style>` are dropped by tag rather than by being
hidden — asserting a script is invisible says nothing — and the reticle's four `<i>` children were
being captured on both routes, since the reticle itself is `display: none` on paper and the naive
filter kept its children. **And the `[data-full-only]` nodes are the same shape**: the concise
document hides them, so `/resume` now carries one hidden row per full-only node instead of a
zero-rect row per descendant, and that row is a real assertion that the density mechanism still
holds on paper.

Row counts: **165/190 → 139/161**, of which 37 are hidden roots. The `environment` block still
reads `linux`, unchanged and matching CI.

## The résumé downloads carry Ali's name (2026-09-08)

The download button's `download` attribute was bare, so both PDFs saved as whatever the URL was
called — `resume.pdf` and `resume-full.pdf`. Ali's point, which is the whole reason this is worth a
change: a recruiter downloading three candidates' résumés gets three files named `resume.pdf`, and
the one with a name on it is the one that stays findable. The attribute now carries a value:
`AliWallick-Resume.pdf` and `AliWallick-Resume-Detailed.pdf`.

**The URL deliberately did not change to match, and renaming the built files would be a
regression.** `/resume.pdf` is the 301 target for the old site's `/resources/WallickAli-Resume.pdf`
(`public/_redirects`), which Google has indexed, and it is the address `docs/LINKEDIN.md` hands out.
`download` renames the saved copy without touching any of that, which is why it is the right lever
and a file rename is not.

**There is no standard here, and the search for one is a dead end.** ATS systems parse a PDF's
contents, not its filename, so nothing machine-readable depends on the string — it is read only by a
person looking at a folder. The convention that exists is career advice rather than a spec: name
first, then the word "Resume", no dates or `v2` suffixes that make the file look stale six months
on. `Detailed` matches the tab label so the file names what was clicked, and hyphens keep it intact
through mail clients that mangle spaces.

**The mixed case is deliberate and is not the lowercase-hyphen convention every path on this site
follows.** That convention is about strings a server resolves — case-sensitivity between a
case-insensitive macOS checkout and a case-sensitive Linux origin, tidiness in a URL. None of it
applies, because **this string is never resolved by anything**: no redirect, no `check-links` run,
no build step reads it, since the browser only writes it to disk. It is a document title, so it is
cased like one. A future session tempted to "fix" it to `aliwallick-resume.pdf` for consistency
would be applying a URL rule to something that is not a URL.

**Two things follow that are easy to miss.** The name has to move with the href in
`src/scripts/resume-density.ts`, for the same reason the page count does — after an in-place toggle
the button points at the other file, and a download named for the density you switched away from is
worse than no name. And the rename **only covers this button**: anyone who opens `/resume.pdf`
directly, from LinkedIn or from that old indexed redirect, still saves `resume.pdf`. Fixing that
half would need a `content-disposition` header on the asset, which is a Cloudflare `_headers`
change and was not made — the button is the path nearly everyone takes.

Verified by driving the built site rather than by reading the bundle: Playwright's `download` event
reports `suggestedFilename()` as `AliWallick-Resume.pdf` at rest and `AliWallick-Resume-Detailed.pdf`
after toggling to the two-pager. `ResumeActions.astro` and `resume-density.ts` are both in
`build-pdf.mjs`'s `byteHashedFiles`, so the PDFs regenerated; `check:resume-print` confirmed the
geometry is unmoved, which is the guard that matters — the changed bytes say nothing.

## A PDF that declares no title lets Google write one (2026-09-08, closes #197)

For years Google's result for `resources/WallickAli-Resume.pdf` carried Ali's PO Box in the result
**title**, and #40, #132 and #197 all reasoned about it as a fact about the file's _contents_. It is
really a fact about its _metadata_. The 2019 PDF declares **no `/Title`, no `/Creator` and no
`/Producer` at all** — checked directly, not inferred — and a PDF with no declared title leaves
Google to synthesise one from the first line of visible text. On that document the first line was
the name, the email and the address.

**The generated PDFs cannot have that shape, and nobody guarded against it.** `build-pdf.mjs`
renders the real `/resume` and `/resume/full` routes through headless Chromium, so each PDF inherits
the `<title>` `BaseLayout` already emits for every route — `Resume — Ali Wallick`, from #256's
`fullTitle`. Chromium writes that to `/Title` and sets `/DisplayDocTitle true`, so a viewer shows the
declared title rather than the filename. **This is a second-order benefit of Phase 4's "single
source, with real PDF files" decision**: a document that is a render of a route cannot lack a title,
because the route it renders from cannot.

Measured on the served bytes, when #197's URL Inspection returned the live file:

| Field              | `resources/WallickAli-Resume.pdf` (2019) | The generated PDFs         |
| ------------------ | ---------------------------------------- | -------------------------- |
| `/Title`           | absent                                   | `Resume — Ali Wallick`     |
| `/Creator`         | absent                                   | names the rendering engine |
| `/Producer`        | absent                                   | names the rendering engine |
| `/DisplayDocTitle` | absent                                   | `true`                     |

**The right-hand column is deliberately not the literal strings, and that is the correction worth
keeping.** An earlier draft of this section pinned `Chromium` and `Skia/PDF m151` under a column
headed `public/resume.pdf` — values read off the _deployed_ file. The committed one said
`HeadlessChrome/141.0.0.0` and `Skia/PDF m141` at the same moment, because a web session's fallback
Chromium had rendered it. Per #306 that variance is expected and not a defect, so pinning either
string here only guarantees the record goes stale on the next regeneration. **What is structural is
that all four fields are declared at all**, and on the 2019 PDF not one of them is.

### What closed #197

The question the issue held open was whether the #132 redirect alone would retire the indexed result,
or whether a Search Console removal had to be spent. It was the redirect. URL Inspection returned
**"URL is not on Google"**, last crawled 2026-09-07, and the live test resolved the `www` → apex →
`/resume.pdf` chain to the current one-page résumé: `/Count 1`, three link annotations
(`contact@aliwallick.com`, the apex, LinkedIn), no address. The producer fingerprint matched
`origin/release`'s committed `public/resume.pdf` byte for byte, which is also a rare positive result
against "deployed state drifts from the repo".

**One method note worth keeping, because it produced a confident wrong answer first.** A web search
run from a session here reported the old result still ranked and still titled with the address, and
that was posted to #197 as evidence before Search Console contradicted it. Third-party search indexes
carry their own pre-cutover snapshots. **For "what does Google hold?", Search Console is the source
and a search tool is not.**

[#200](https://github.com/ali-wallick/Portfolio/issues/200) is untouched by any of this and stands on
its own facts — archive.org preserves by design, and its 2010 capture carries a home street address
and a mobile number rather than the PO Box.

### The guard question, and why the answer is weaker than it looks

`countPages()` already parses these bytes to assert the one-pager is one page, so asserting a
non-empty `/Title` beside it would be a few lines in a file that is already the right home — no new
script, no heuristic, and it cannot fire on correct output. Cheap.

**What it would protect is no longer the leak, though.** The current résumé carries no address at
all, so a PDF shipping without a title would cost an ugly synthesised result title built from a line
that is now just the name and the public contact links. That is a cosmetic regression, not a
disclosure. Recorded here rather than built, on the same reasoning #327 and #338 used when they
measured a candidate guard and declined it: the mechanism is worth knowing, and the failure it
prevents has to earn the check.
