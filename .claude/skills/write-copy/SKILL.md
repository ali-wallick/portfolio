---
name: write-copy
description: Write or edit any prose on aliwallick.com in Ali's voice — About page, homepage, project write-ups, resume bullets, microcopy, alt text, meta descriptions. Use when the user wants copy written, reworded, tightened, or toned; asks for a wording or tone pass; says something "reads like AI" or "doesn't sound like me"; or is working issue #31 and its sub-issues. For the structure and front matter of a project entry, use add-project or write-project-page — this skill governs how the words sound, wherever they live.
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

|                      | Blog     | Documents | Interview | Chat     | The site |
| -------------------- | -------- | --------- | --------- | -------- | -------- |
| Mean sentence length | **16.9** | **17.2**  | **14.6**  | **17.5** | 32.2     |
| Em dashes per 1k     | **0.0**  | **0.0**   | **0.0**   | **0.0**  | 15.8     |

**Seventeen words is her sentence.** Sixteen years, five genres, everything between 14.6 and 17.5 —
it holds when she's careful and when she isn't trying. The site is at 32, not occasionally but
uniformly. **This is the highest-leverage fix available, ahead of any word choice**: a page can pass
every trope check below and still not sound like her because every sentence carries three clauses.
The sharpest version: **the longest sentence in her whole 2017 interview is 27 words, shorter than
the site's average.**

**Zero em dashes in 9,937 words of hers**, against 91 in the site's 5,743.

## 2. Register depends on the surface

One voice, three settings. Getting this wrong reads worse than any individual bad sentence.

| Surface                                | Register                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| Blog-derived prose, About              | Warmest. Contractions, parentheticals, an earned exclamation.                   |
| Project write-ups                      | Warm but composed. First person, past tense, specifics forward.                 |
| `highlights` / `highlightsExtended`    | Résumé register: verb-first, subject dropped, no contractions, no exclamations. |
| Microcopy — nav, 404, contact, buttons | Shortest. Plain and a little dry. A joke only if it's actually funny.           |
| Alt text, meta descriptions            | Descriptive, not voiced. Say what's in the image.                               |

**For resume work, this skill is half the job.** It governs how a bullet reads; the `update-resume`
skill governs where it lives, the per-job bullet budget, and the regeneration pipeline (PDFs,
`docs/LINKEDIN.md`, the print-geometry baseline). Changing resume wording without reading that one
will fail `npm run check:pdf` at deploy time.

**Contractions and exclamations track the surface, not the voice.** She runs 17 contractions per 1k
words in the blog and 0.7 in formal documents; 96 exclamations in the blog and 9 across 4,200 words
of documents. The site sits at 22 contractions per 1k and is fine. Don't tune either against a
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
table above — it's a one-page exception, not a new default.

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
- **Starting sentences with "And" or "But".** She does this. Keep it.

Things to cut on sight, because they aren't hers at any dosage:

- **The "part X, part Y" genre-blend hedge.** _"Part Rubik's Cube and part Sudoku"_ is the same
  device as "part heist thriller, part coming-of-age story" — a neat balanced construction a model
  reaches for to describe something by comparison instead of stating it. Even when the comparison
  itself is sourced (critter-3, [#91](https://github.com/ali-wallick/Portfolio/issues/91): the
  archived source page really does say "a cross between Rubik's Cube and Sudoku"), the "part X and
  part Y" phrasing is the more polished-sounding version of that same idea. Flagged on sight by
  Ali. State the mechanic instead of the comparison — see the content-pass note on comparisons
  donating mechanics that were never actually there.
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
  the source-compression scenario `content-pass` is built around; it shows up just as readily when
  composing new copy directly from a dictated brief.
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
9. **Say that she liked it.** She leads with an enthusiasm verb five times in 320 words of
   interview: "I love being able to get in every day and work on challenges that make our games
   tick." The site records what she did and almost never that she enjoyed it. One "I loved building
   this" costs nothing and doesn't turn a page into a blog.
10. **Name the specific thing.** Blendoku, Carcassone, Castles of the Mad King Ludwig — not "board
    games". The same instinct as the undramatised numbers, applied to nouns, and the most reliable
    single marker of her writing.
11. **Label a section, then explain it plainly.** Bolded label, colon, ordinary prose. Both her
    escalation letter and her volunteer synthesis doc are built this way — independent confirmation
    that the Marvel Snap page's structure is hers.
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

## 5. Never let a tone pass change a fact

An edit pass is not a re-reporting pass. Tightening prose is exactly where invented specifics slip
in, because a punchier sentence often wants a detail the source doesn't have.

- **Facts, dates, numbers, and job titles do not move.** If a rewrite needs a fact the source lacks,
  ask. `CLAUDE.md`'s "Facts worth having on hand" is the reference.
- **The Second Dinner ceiling holds absolutely: craft, not product.** The 7 August 2024 W4 Games
  statement is the limit — Godot, next game, no title, platform, or genre.
- **I Fits I Sits: never imply Ali worked on a shipped release.** She pitched and prototyped it,
  under that name — both public names it shipped under later (It Fits I Sits, then Puzzle Cats)
  were other teams' renames, not her work.
- **Past tense for past work.** The site's founding bug was present tense that stopped being true.
- **Marvel Snap pages are about her work on it, not about the game.**

## 6. Measure, then read

The repo settled its colours, fonts and motion on measurement rather than taste. Copy gets the same
treatment.

```bash
node .claude/skills/write-copy/scripts/copy-stats.mjs src/content/projects/*.md
node .claude/skills/write-copy/scripts/copy-stats.mjs --baseline   # Ali's own writing, for comparison
```

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

## 7. Hand it back as a diff, not as a fait accompli

Copy is Ali's, and a tone pass is the one kind of change where "it builds" proves nothing.

- Work on a branch, push, and give her the preview URL. Reading it in the real design is the point —
  it's why #31 waited for Phase 5.
- **Show what changed and why, per page**, not just a diff. One line each: what you cut and what the
  sentence was doing wrong.
- **Flag anything you were tempted to reword but couldn't without a fact you don't have.** That's a
  question for her, not a gap to paper over.
