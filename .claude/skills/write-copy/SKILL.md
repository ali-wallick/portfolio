---
name: write-copy
description: Write or edit any prose on aliwallick.com in Ali's voice — About page, homepage, project write-ups, resume bullets, microcopy, alt text, meta descriptions. Use when the user wants copy written, reworded, tightened, or toned; asks for a wording or tone pass; or says something "reads like AI" or "doesn't sound like me". For the structure and front matter of a project entry, use add-project or write-project-page — this skill governs how the words sound, wherever they live.
---

# Write copy in Ali's voice

This is the voice skill. `write-project-page` says what a project write-up should _contain_;
this says how any sentence on the site should _sound_. When both apply, both apply.

## 1. Load the voice before writing a word

**Read `references/ali-voice.md` in full.** It is quoted primary source — real sentences from Ali's
blog, her old site, her 2019 resume, and a set of documents she supplied in 2026 — plus measurements
of all of it against the site's current copy.

Then read the "Voice and content conventions" section of `CLAUDE.md`, which is the authority and may
have moved on since this file was written.

Four independent corpora underpin it: her blog (2010–2019), a set of adult documents (2016–2024),
MobilityWare's 2017 "Meet Ali Wallick" Q&A, and her own chat messages from 2026. The numbers worth
carrying in your head:

|                      | Blog     | Documents | Interview | Chat     | Site (before) | Site (now) |
| -------------------- | -------- | --------- | --------- | -------- | ------------- | ---------- |
| Mean sentence length | **16.9** | **17.2**  | **14.6**  | **17.5** | 32.2          | **16.2**   |
| Em dashes per 1k     | **0.0**  | **0.0**   | **0.0**   | **0.0**  | 15.8          | **0.0**    |

**Seventeen words is her sentence.** Sixteen years, five genres, everything between 14.6 and 17.5 —
it holds when she's careful and when she isn't trying. A page can pass every trope check below and
still not sound like her because every sentence carries three clauses.

**Both gaps are closed as of 2026-08-26** — #31 and its 21 sub-issues shipped, taking the site from
32.2 words to 16.2 and from 91 em dashes to zero. **The numbers are now a position to hold, not a
target to chase**, and the live failure mode is the reverse of the original one: don't re-consolidate
short sentences into long ones, and don't reintroduce an em dash "for rhythm." Re-measure before
assuming either has slipped, and read the "Site (now)" column, not "before."

## 2. Register depends on the surface

One voice, three settings. Getting this wrong reads worse than any individual bad sentence.

| Surface                                | Register                                                                           |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| Blog-derived prose, About              | Warmest. Contractions, parentheticals, a rare earned exclamation.                  |
| Project write-ups                      | Composed. First person, past tense, specifics forward, one warmth beat at close.   |
| Archive-tier entries                   | Composed and lower-key. No warmth beat; "cool old projects", not a pitch.          |
| `highlights` / `highlightsExtended`    | Résumé register, and **labelled** — see §2.1. The most formal surface on the site. |
| Microcopy — nav, 404, contact, buttons | Shortest. Plain and a little dry. A joke only if it's actually funny.              |
| Alt text, meta descriptions            | Descriptive, not voiced. Say what's in the image.                                  |

**For resume work, this skill is half the job.** It governs how a bullet reads; the `update-resume`
skill governs where it lives, the per-job bullet budget, and the regeneration pipeline (PDFs,
`docs/LINKEDIN.md`, the print-geometry baseline). Changing resume wording without reading that one
will fail `npm run check:pdf` at deploy time.

### 2.1 Résumé register is labelled, and it is deliberately not the site's prose voice

Settled with Ali 2026-08-26 ([#32](https://github.com/ali-wallick/Portfolio/issues/32)). A bullet is
`{ label, text }` in the schema, and renders as **`Label:`** followed by a clipped formal clause:

> **Localization:** Owned the feature end to end, including Unity's Localization package, the import
> and export pipeline, font handling, and the team's UI text workflow.

**This is recovered, not invented.** Ali's own 2019 resume built every bullet this way — "Vegas Blvd
Slots:", "UI Programming:", "Client Engineering:" — and it is the same move §4.11 already documents
from her escalation letter and her volunteer synthesis doc. Decode
`resources/WallickAli-Resume.pdf` before proposing a change to the format; it is the primary source,
and it is the only place the original document survives.

Rules that come with it:

- **The label is a topic, not a clause.** `max(28)` chars, enforced by the schema, so the build fails
  rather than the format silently eroding back into prose. Prefer the project or discipline name,
  which is what the 2019 resume used.
- **The label is title case** (2026-08-26, #32). `UI Programming`, `Live-Ops Content`,
  `Cross-Cutting Work`; AP/Chicago rules. Recovered the same way the format was -- every label in the
  job files' verbatim 2019 sections is title case, `Unreleased Casino` included. It is also the only
  self-consistent option, since proper-noun labels are title case whether you choose it or not.
- **Drop the subject, unless the subject isn't Ali.** The bullets are subject-dropped and verb-first
  by default. The one deliberate exception on the page is the awards bullet, which names Marvel Snap:
  a bare "Won Best Mobile Game" reads as a personal award. If the sentence's true subject is the
  product or the team, say so rather than letting the register imply otherwise.
- **Don't restate the label in the sentence.** "Localization: Owned localization end to end" wastes
  the device. "Owned the feature end to end" says the same thing once.
- **No contractions, no exclamations, no first person.** These bullets are subject-dropped, which is
  why `--resume` scores them against a résumé baseline: zero for first person and em dashes, 10.1
  per 1k for contractions (the counter can't tell a possessive `'s` from a contracted one, so it
  never reads zero), and no measurement of exclamations at all.
- **Verbs are formal, not conversational.** The #32 pass removed: "hands the ticket to", "brought
  teammates onto", "took it to release", "let us author", "keeping the team moving quickly", and
  "plus" used as a conjunction. Each reads fine in site prose and casual in a bullet.

**Enumerations are allowed to run long, and there is now somewhere to put them.** The measured mark
is 13.5 words and the shipped bullets sit at 17, and most of the excess is a verb followed by four or
five named things. That is §4.10 — name the specific thing — and cutting it to hit a number would
remove the most reliable marker of her writing to fix a metric. Tighten loose connective prose
instead.

When an enumeration genuinely costs a line on the one-pager, **move it to the bullet's `extended`
field** rather than deleting it: it is a continuation appended only on `/resume/full`, so the fact
survives at full detail on the long version. That is what happened to Firefall's list of screens and
Kaneva's list of menus (#32). `update-resume` §1 has the rule that keeps this from becoming a second,
drifting copy.

**Two `full`-only sections carry their own register.** `resumeSummary` and `resumePersonalProjects`
in `src/config/resume.ts` are hand-authored and appear on `/resume/full` only. The summary is three
sentences and must not open with the 2019 original's "Programmer passionate about developing games",
which is the throat-clearing formula §3 bans.

**Contractions and exclamations track the surface, not the voice.** She runs 17 contractions per 1k
words in the blog and 0.7 in formal documents; 96 exclamations in the blog and 9 across 4,200 words
of documents. The site sits at 16.9 contractions per 1k and is fine. Don't tune either against a
sitewide number — tune them against the row above.

**The table is the default, not a ceiling — a single page can deviate on explicit request.** Kaneva
([#140](https://github.com/ali-wallick/Portfolio/issues/140)), 2026-08-25: Ali asked for the whole
page to read more formal and less conversational than the "warm but composed" project-write-up row
above. What worked was drafting two genuinely different directions — a light dial-down (cut
contractions and soft connectives like "I enjoyed," keep the story shape) and a dry technical-report
register (clipped declarative sentences, no narrative color) — and asking which one, or something in
between, rather than guessing at one rewrite. She picked the lighter one. First person and past tense
held in both drafts; those aren't register, they're settled sitewide (CLAUDE.md). **Record a register
override where it happened** (the page's own PR, or a comment on its issue), not as a change to the
table above.

**Correction, 2026-08-26: that override stopped being a one-page exception and is now the site's
default.** Kaneva's dial-down propagated by citation — [#137](https://github.com/ali-wallick/Portfolio/issues/137)
reworded Vegas Blvd Slots specifically to match "I Fits I Sits, Firefall, and Kaneva," at which point
four of the five featured pages were formal by explicit request and the "warm but composed" row was
describing a register no page still had. Ali's own read on the finished pass: **"some warmth is good
but I'm definitely wanting to veer more professional than the old site."** The table rows above are
rewritten to say what the site actually does, and the mechanism worth keeping is the one Kaneva
established: **when a register call is genuinely open, draft two distinct directions and ask, rather
than guessing at one rewrite.**

**Asked to bring one page's register closer to named sibling pages, `grep` the site for the
flagged phrase before rewriting it.** Vegas Blvd Slots
([#137](https://github.com/ali-wallick/Portfolio/issues/137)): "cut my teeth," "entirely myself," and
an "I went in... I came out..." bookend all sound perfectly normal read once. `grep -rn "<phrase>"
src/content/projects/ src/content/jobs/` confirmed all three were unique to that one page — **that
uniqueness is the actual signal a phrase is a register outlier**, rather than an ordinary casual word
the rest of the site also uses at the same rate. For the specific ask of matching one page's tone to
others by name; not for every wording tweak.

**"More professional than the old site" is the calibration, and the old site is the thing to measure
against — not the blog.** The 2010 homepage's "I'm a gal passionate about developing games" is the
register being moved away from. The adult documents corpus (17.2-word sentences, 0.7 contractions per
1k, 9 exclamations in 4,200 words) is the target, and `references/ali-voice.md` is explicit that the
site wants "the register of the former with some of the warmth of the latter." **Some. The site is
under the documents' exclamation rate right now and that is fine** — see the settled note in the
reference before treating any warmth metric as a gap to close.

## 3. AI tells — the pattern is the tell, not the instance

**This is the part to get right, and the failure mode is over-correcting.** Prose written to dodge
a banned-word list reads as strangled, which is its own tell. Ali's own blog trips several of these
once each and reads perfectly human.

**The rule: one is a sentence, four is a signature.** Almost everything below is fine in isolation
and damning in repetition. Judge the page, not the line.

Things that are only bad in bulk — use them when the sentence genuinely wants them:

- **Triads.** "Notifications, localization, and deep linking" is just an accurate list. Three
  three-part lists on one page is a cadence, and a reader feels it without being able to name it.
  Vary list lengths — two and four are allowed to exist.
- **Antithesis** ("not X, but Y"). Ali wrote one. It's a real rhetorical figure. It becomes an AI
  tell when every paragraph pivots on one.
- **Short punchy fragments for emphasis.** One per page lands. Four is a LinkedIn post.
- **Bolded lead-ins to paragraphs.** The Marvel Snap page uses them well and structurally. A page
  where every paragraph opens with a bolded phrase has become a slide deck.
  **The site's bold convention is structural — list labels and paragraph lead-ins.** A single word
  bolded mid-sentence in ordinary prose ("a menu **animation** system") is worth asking about rather
  than assuming it's deliberate emphasis; kaneva's survived four revisits as an unexplained leftover
  ([#140](https://github.com/ali-wallick/Portfolio/issues/140)). It isn't wrong markdown, so nothing
  will flag it.
- **Starting sentences with "And" or "But".** She does this. Keep it.

Things to cut on sight, because they aren't hers at any dosage:

- **The "part X, part Y" genre-blend hedge.** _"Part Rubik's Cube and part Sudoku"_ is the same
  device as "part heist thriller, part coming-of-age story" — a neat balanced construction a model
  reaches for to describe something by comparison instead of stating it. Even when the comparison
  itself is sourced (critter-3, [#91](https://github.com/ali-wallick/Portfolio/issues/91): the
  archived source page really does say "a cross between Rubik's Cube and Sudoku"), the "part X and
  part Y" phrasing is the more polished-sounding version of that same idea. Flagged on sight by
  Ali. State the mechanic instead of the comparison.

  **And a comparison used for shape or feel can silently donate a mechanic that was never there.**
  Critter³'s source called it "a cross between Rubik's Cube and Sudoku" — about the cube's six sides
  and the placement logic, not about twisting anything. The draft nonetheless credited Ali with
  building "the cube's rotation," inferred from the comparison plus the old page's "turning and
  clicking mechanism" — where "turning" meant the camera orbit, not a puzzle mechanic. Nothing
  mechanical catches this. When a source pitches a project as "X, but like [famous thing]," **verify
  the comparison against the actual how-to-play instructions** before writing what it implies into a
  mechanics description. The famous thing's own mechanic is not evidence.

- **Em dashes.** Zero in 9,937 words of her writing. Use a spaced en dash (–), a comma, parentheses,
  or a full stop. Parentheses are the most characteristic of her: _"(and went for multiplayer which
  is always a ridiculous game jam choice)"_. Splitting a 32-word em-dash sentence into two 16-word
  sentences usually fixes the length problem and the punctuation problem at once.
- **The thesis-colon aphorism.** A complete declarative sentence, a colon, then a clause that mirrors
  or restates it — _"The constraint was the whole project: say as much as possible with as few
  pixels and colors as the system allowed."_ It's the mic-drop shape a model reaches for, and it's
  dangerous precisely because it passes every other check here: no em dash, normal sentence length,
  no banned words — and it still read as generated the moment Ali saw it ([#92](https://github.com/ali-wallick/Portfolio/issues/92)). State the idea
  plainly instead: _"Working within its pixel and color limits ended up being most of the game
  design."_ **Distinct from the positive move in §4.11** — that's a short noun label
  ("Localization:") followed by ordinary explanation; this is a full sentence performing a reveal.
- **The "taught me a lesson" closer.** A specific accomplishment followed by a sentence that
  generalizes it into a moral — _"That taught me something that's stuck. The most valuable thing I
  build is sometimes not the feature, but the tool that makes the next ten features cheaper."_ Ali's
  reaction on kaneva ([#140](https://github.com/ali-wallick/Portfolio/issues/140)) wasn't "this
  sounds AI" — it was "this is sappy." **Distinct from both neighbors above**: it isn't a colon
  construction (so the thesis-colon check doesn't catch it), and it's a single antithesis on the
  whole page, not a repeated one (so the dosage rule for antithesis above doesn't catch it either).
  The tell is the move itself — stating the fact, then explicitly narrating what it taught her —
  regardless of the sentence's shape. Cut the reflection and let the fact carry it: _"It ended up
  being adopted by both the UI and game teams"_ already says everything the moral was reaching for.
- **The two above stack, and the stack is worse than either alone.** firefall
  ([#139](https://github.com/ali-wallick/Portfolio/issues/139)) shipped a "What I learned" closer
  with a thesis-colon-shaped sentence immediately followed by a taught-me-a-lesson-shaped one —
  _"That's a different kind of ownership than end to end at Kaneva. I learned to work at the
  boundary between my own scripting layer and the core engine, alongside the engineers who owned
  the rest of it."_ Each sentence alone might pass a quick read; back to back they read as one
  continuous wrap-it-up move, because a "What I learned" section is structurally the reflective beat
  of the page and both tells are reflection-shaped. Worth checking a closing paragraph as a unit, not
  just sentence by sentence. Ali's fix, picked from three options: name the specific team and end on
  a plain concrete fact instead — _"I worked right at the boundary between the Lua/XML layer and the
  core engine. That put me in the engine team's code almost as often as my own."_ **Also worth
  noting: this draft wasn't compressed from an old page** — it was written fresh from facts Ali
  described live in chat (team size, disciplines, other teams). The AI-tell risk isn't specific to
  rewriting existing copy; it shows up just as readily when composing something new directly from a
  dictated brief.
- **"X, Y among them," over a closed set.** The phrasing implies a longer list you're sampling from.
  Art of Rescue's summary read "levels made from their own famous motifs, Monet's lily pads among
  them" — the team built exactly two levels, Monet and Dalí. Ali's fix
  ([#89](https://github.com/ali-wallick/Portfolio/issues/89)) was to name both in the body instead.
  Reach for "among them" / "such as" only when the source actually supports more items than you're
  naming; when the full list is short, just state it.
- **Autopilot vocabulary**: leverage, robust, seamless, delve, myriad, plethora, testament,
  landscape, elevate, unlock, cutting-edge, "deep dive", "at the end of the day", "it's worth
  noting", "in today's ... world", ensure, utilize, facilitate. Write make sure, use, help.

  Ali does use two of these. "Passionate about" and "utilizing" both appear in her cover letters, and
  **the cover letters are the least her-sounding writing in the corpus** — no specifics, no
  parentheticals, no motive stated, no evident interest in anything. So these aren't banned because
  she dislikes them. They're a _symptom_ of writing to a form instead of about a thing. Hitting one
  is a prompt to check whether the whole paragraph has gone generic.

  Refinement: **"passionate" is genuinely her word** — she picks it as one of three to describe
  herself in the 2017 interview. What doesn't survive is _"I am a programmer passionate about making
  games"_ as an opening line. Ban the throat-clearing, not the word.

- **The false-modesty humblebrag.** "I was lucky enough to…" She says "I was thrilled", which is
  warmer and not a performance.
- **Inflated adjectives on real numbers.** "an impressive 188K daily active users." She writes "It
  peaked at 188K daily active users!" and moves on. The number does the work.
- **Summary paragraphs that restate the page.** Her posts stop when the story stops.
- **Rule-of-three adjective strings**: "fast, reliable, and maintainable." Pick the true one.

## 4. Positive moves — what actually makes it read as her

Copied from her own sentences, not from a style guide:

1. **State the motive in plain words.** "after being frustrated at having to hand-code any
   animation." Why she built it is the humanising detail, and it's usually the missing one.
2. **Use a parenthetical aside** where you were about to use an em dash.
3. **Put concrete numbers in undramatised.** 61 levels, 188K DAU, 48 hours, four years.
4. **Be interested in the thing, not in yourself.** "the crazy amount of depth that goes into these
   machines from every aspect."
5. **Credit teammates by what they did.** "Our level designers worked really hard on the intro
   levels."
6. **Let one sentence be short.** Then a longer one. That alternation is her rhythm.
7. **Concede, then press.** Her signature move in adult writing — give the other side its full due,
   sincerely, then don't drop the point. _"This is pretty clearly a problem caused by Dometic and not
   HC. […] However, I did several hours of free research."_ On a portfolio page this is how you write
   about a decision that was reasonable at the time and still had to be redone.
8. **Open with a question when a piece of work solved a real problem.** She uses question marks more
   in adult writing than in the blog; the site uses none. One, to state the problem, is in voice.
9. **Say that she liked it — once, at the close.** She leads with an enthusiasm verb five times in
   320 words of interview: "I love being able to get in every day and work on challenges that make
   our games tick." That interview is employer-published, not a blog, which is what makes the
   enthusiasm verb the right instrument for warmth at professional register — it costs nothing and
   doesn't turn a page into a blog, where an exclamation point would.
   **The site's settled dosage, measured 2026-08-26: exactly one beat, in the closing section.**
   `/contact` is the one page outside that shape — microcopy, no closer, and its warmth beat is the
   sentence itself. Ali asked for it (#119, 2026-09-03), which is the only way any of the site's
   exclamations got there.
   Kaneva, Marvel Snap, Vegas Blvd Slots and About each carry one; the homepage carries one on its
   Currently line; Firefall and I Fits I Sits deliberately carry none (Firefall's flat closer was
   Ali's pick on #139); the archive tier carries none by design. Adding a second to a page that has
   one, or a first to an archive entry, is drift rather than warmth — see `references/ali-voice.md`
   for the full map.
   **When a page needs a beat, look for the thing that already warrants one before writing a new
   clause.** The homepage's beat is a single exclamation on its composed "Currently" line
   (`index.astro`, "building our first game in Godot!"), chosen by Ali over a proposed warmth clause in the lede — the current work was
   already the gladdest fact on the page, so it only needed the punctuation to say so.
10. **Name the specific thing.** Blendoku, Carcassone, Castles of the Mad King Ludwig — not "board
    games". The same instinct as the undramatised numbers, applied to nouns, and the most reliable
    single marker of her writing.
11. **Label a section, then explain it plainly.** Bolded label, colon, ordinary prose. Both her
    escalation letter and her volunteer synthesis doc are built this way — independent confirmation
    that the Marvel Snap page's structure is hers.
    **At list scale, this is the fix for 3+ parallel items dumped into prose**, any tier:
    `- **Label:** clause.` — colon rather than period, since a list item is usually one clause, and
    the word after the colon is capitalized. Settled on mini-mages, where three named mini-games ran
    together as three sentences that each opened with a proper noun and a linking verb
    ([#95](https://github.com/ali-wallick/Portfolio/issues/95)); extended to a featured body on
    kaneva, whose eight menu categories were buried in two comma-heavy sentences
    ([#140](https://github.com/ali-wallick/Portfolio/issues/140)). Reach for it when the alternative
    is a prose list of parallel items — not as a general licence for lists.
12. **Earn a success claim with the obstacle first — don't reach for "the first X that actually
    worked."** That construction passes every other check here (no em dash, in-range length, no
    banned vocabulary) and still reads as a flex, and the mechanism is specific: "first X that
    actually worked" implies a string of earlier X's that didn't, an unflattering claim about her
    own past work that nothing sources. It isn't a comparison to anyone else — Ali's own read
    ([#99](https://github.com/ali-wallick/Portfolio/issues/99)) was "like in the past I made things
    that didn't work?" Her own move, from the 2014 GGJ blog post behind tilting-at-windmills: state
    the concrete difficulty ("a very locked-down network at the jam site"), then let a short, earned
    exclamation carry the payoff — "we pulled through with a great little prototype." The obstacle
    is what makes the win worth stating instead of implying a history of failure.

13. **Lean third person when describing gameplay, not "you."** "You play a pirate hunting..." reads
    like an instruction manual; "A pirate hunts..." reads like a synopsis, and Prodigal's body
    already does it ("A wolf leaves its pack to find food..."). Not a hard rule, but worth a second
    look whenever "you" turns up describing a mechanic — it's an easy default to reach for without
    noticing ([#92](https://github.com/ali-wallick/Portfolio/issues/92)).
14. **Use the real game-dev name for a mechanic, not an everyday metaphor.** Mini Mages' draft
    described two iPhones becoming "steering wheels" — accurate, and a car metaphor for what a game
    developer would call tilt controls. Ali's fix: "tilt controllers"
    ([#95](https://github.com/ali-wallick/Portfolio/issues/95)). Same accelerometer either way; only
    one phrasing sounds like it was written by someone who builds games, which is the whole brief.
15. **Call the thing what it actually is.** Not every project is comfortable being called "a game."
    Night Light's draft defaulted to "the whole game"; Ali's reaction was "game is a stretch for what
    this is," and its own old page had already hedged it as a "scene" with game elements
    ([#96](https://github.com/ali-wallick/Portfolio/issues/96)). Check what noun the source reaches
    for — scene, piece, demo, sketch — before defaulting to "game," especially for coursework and
    non-interactive pieces.

## 5. Headers are title case

Multi-word headers ("Featured Work", "What I Built") are title case, not sentence case, by
AP/Chicago rules — small function words lowercase unless first or last, so "Off the Clock" and not
"Off The Clock". Applies to any header you write or touch, not just project write-ups.

**`npm run links` fails the build on a sentence-case `<h2>`** (#338), so a slip is a CI failure and
not something to catch by eye. It checks `<h2>` only, which is every hand-authored heading on the
site; `<h1>` and `<h3>` are project and job titles, and those are proper nouns that get whatever
casing they actually have — `aliwallick.com` stays lowercase. See
[`docs/decisions/content.md`](../../../docs/decisions/content.md) for why the guard stops where it
does.

**And the apostrophe is `’`, everywhere** — front matter, Markdown bodies, `.astro` prose, and the
hand-authored strings in `src/config/` and `scripts/build-linkedin.mjs`. `CLAUDE.md` is the
authority on why (one character, one rule, no surface to remember; don't rely on smartypants even in
a body). A straight apostrophe inside backticks is quoting source and stays. `npm run links` fails
the build on a straight one in rendered prose, alt text, or a meta description, so a slip is a CI
failure rather than something to catch by eye.

## 6. Never let a tone pass change a fact

An edit pass is not a re-reporting pass. Tightening prose is exactly where invented specifics slip
in, because a punchier sentence often wants a detail the source doesn't have.

- **Facts, dates, numbers, and job titles do not move.** If a rewrite needs a fact the source lacks,
  ask. `CLAUDE.md`'s "Facts worth having on hand" is the reference.
- **A verb narrating _how_ something was accomplished is its own claim.** Marvel Snap's "championing
  a migration to MVVM... arguing for it and getting a team to come along" was signed off at the
  Phase 3 gate and repeated across five surfaces, and it was wrong: the work was tooling-led, not an
  advocacy campaign ([#136](https://github.com/ali-wallick/Portfolio/issues/136)). The migration and
  her leading it were both true the whole time; only the mechanism was misdescribed. _Argued for_,
  _championed_, _pushed_, _convinced_, _drove_ narrate an interpersonal story that's easy to get
  subtly wrong even when the underlying fact is solid and long-settled. Read one back to Ali the way
  you'd check a date — **a prior sign-off is not evidence it was ever fact-checked at that level.**
- **A verb corrected once doesn't stay corrected when the fact is restated somewhere new.** That
  same MVVM verb landed again as "driving its MVVM migration" when the fact was compressed into the
  `/projects` index summary, in a location the earlier fix never touched; Ali's read: "it was a team
  effort and I feel like driving is an overclaim"
  ([#101](https://github.com/ali-wallick/Portfolio/issues/101)). Check the verb independently on
  every new surface — a summary, LinkedIn, the resume. A fix in one place does not propagate.
- **A summary can overclaim through inclusion alone, even when every word is true.** The same
  summary named "client and server systems," which the body genuinely supports — but naming server
  work in a one-line, three-fact sentence gives it the same weight as everything else, independent
  of how much of the work it actually was. **Compression promotes whatever survives it.** Check with
  the source whether a technically-true detail deserves that promotion, not just whether it's true.
- **The Second Dinner ceiling holds absolutely: craft, not product.** The 7 August 2024 W4 Games
  statement is the limit — Godot, next game, no title or genre; "mobile" is sayable on Ali's own
  statement (2026-08-26, #32; the correction is recorded under CLAUDE.md's "What is safe to say
  about Second Dinner").
- **I Fits I Sits: never imply Ali worked on a shipped release.** She pitched and prototyped it,
  under that name — both public names it shipped under later (It Fits I Sits, then Puzzle Cats)
  were other teams' renames, not her work. **A body's credit-scope caveat does not reach the
  `summary` automatically**, and on `/projects` the card renders only the summary: the body said
  outright "I did not work on either shipped release" while the card said the prototype "grew into
  Puzzle Cats, downloaded more than a million times," with nothing attributing the shipping to other
  teams ([#101](https://github.com/ali-wallick/Portfolio/issues/101)). Whenever a body carries a
  "didn't work on X" caveat, **read the summary in isolation, as a reader who never clicks
  through.**
- **Past tense for past work.** The site's founding bug was present tense that stopped being true.
- **Marvel Snap pages are about her work on it, not about the game.**

## 7. Measure, then read

The repo settled its colours, fonts and motion on measurement rather than taste. Copy gets the same
treatment.

```bash
node .claude/skills/write-copy/scripts/copy-stats.mjs src/content/projects/*.md
node .claude/skills/write-copy/scripts/copy-stats.mjs --baseline   # Ali's own writing, for comparison
node .claude/skills/write-copy/scripts/copy-stats.mjs --resume     # the resume bullets
```

**Use `--resume` for resume work, never the default mode.** `strip()` removes front matter, and a
resume bullet _lives_ in front matter — so pointing the default mode at `src/content/jobs/*.md`
measures the "Source material (2019 resume, verbatim)" bodies and not one line of shipped copy. That
was silently true for as long as the script existed, and it is why #32's opening measurement had to
be taken before anything could be judged. `--resume` reads `highlights` + `highlightsExtended`,
joins each bullet as the reader meets it (`Label: text`), and scores against the résumé baseline plus
four formality tells the prose mode does not carry.

It reports tell counts and drift from Ali's measured baseline. **It is advisory and deliberately not
wired into `npm run verify`** — tone is not gateable, and every number in it has a legitimate reason
to be exceeded. Exceeding one on purpose is a fine answer. Exceeding one by accident is what the
script is for.

**A bolded lead-in label defeats the sentence splitter the same way, and it inflates the number
rather than merely merging two sentences.** `**Driving an MVVM migration for the PC launch.**
Alongside the push...` puts `.**` — a period followed by asterisks, not whitespace — between the
label and the sentence, so the two fuse and the label's words are counted as part of it. On
marvel-snap ([#136](https://github.com/ali-wallick/Portfolio/issues/136), 2026-08-26) that reported
one sentence "over 35 words" at 39w for a sentence that is actually 31w. **Any page using the §4.11
bolded-label move will do this on every label**, so check the rendered figure before trimming:
`audit-page.mjs` reads `dist/` with the markdown already stripped, and reported 31w for the same
sentence. Trim what the reader actually reads, not the markdown.

**A closing quotation mark right after a sentence-ending period defeats the sentence splitter.**
Its regex only breaks a sentence on `[.!?]` followed by whitespace — `Stupid." We built` has no
whitespace between the period and the closing quote, so the two sentences merge into one and can
trip the `sentences over 35 words` flag on prose that reads fine out loud (found on critter-3,
#91). Read the flagged sentence before trimming it: if it's an artifact of quoted dialogue or a
title ending a sentence, restructure so the quote lands mid-sentence instead (`calling ourselves
"X," was...` rather than `as "X."`), which sidesteps the false split without changing what the
sentence says.

Then finish the way every other content change here finishes:

```bash
SHOW_DRAFTS=true npm run build && npm run links
```

If resume copy changed, `npm run build:pdf` and commit the regenerated `public/*.pdf` and
`scripts/resume-pdf.lock.json` — `npm run check:pdf` fails the deploy on a stale PDF.

## 8. Hand it back as a diff, not as a fait accompli

Copy is Ali's, and a tone pass is the one kind of change where "it builds" proves nothing.

- Work on a branch, push, and give her the preview URL. Reading it in the real design is the point.
- **Show what changed and why, per page**, not just a diff. One line each: what you cut and what the
  sentence was doing wrong.
- **Offer options on lines that carry weight, not just a single rewrite.** For a sentence doing real
  interpretive work — a summary's hook, a body's framing sentence, anything Ali is likely to have a
  personal reaction to — draft two or three genuine alternatives and let her pick. It's cheaper for
  her to react to three short options than to describe in prose what's off about one line, and it's
  how the dead-booty pass landed its best sentences
  ([#92](https://github.com/ali-wallick/Portfolio/issues/92)). Captions, plumbing and anything
  low-stakes are fine as a single pass.
- **Flag anything you were tempted to reword but couldn't without a fact you don't have.** That's a
  question for her, not a gap to paper over.
