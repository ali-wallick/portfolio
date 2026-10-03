# Ali's voice, from primary sources

Everything here is quoted or measured from Ali's own writing. Nothing is invented, and nothing is
inferred from "what a game developer sounds like."

## The corpora

| Corpus        | What                                                                                                            | Size         | In the repo?       |
| ------------- | --------------------------------------------------------------------------------------------------------------- | ------------ | ------------------ |
| **Blog**      | `content/archive/`, 20 posts, 2010–2019. Unedited, first person, young.                                         | ~5,100 words | yes                |
| **Old site**  | `snapshot-pre-retirement` tag — About, index, project pages. More considered, still hers.                       | ~1,800 words | yes                |
| **Résumé**    | 2019 bullets, verbatim under "Source material" in `src/content/jobs/*.md`.                                      | ~400 words   | yes                |
| **Documents** | Five adult documents, 2016–2024, written to persuade or explain — none about games. Supplied by Ali 2026-08-24. | ~4,200 words | **no — see below** |
| **Chat**      | Ali's own messages in the session that built this skill, 2026-08-24. Casual, unedited, typed quickly.           | ~260 words   | no                 |

**The documents are deliberately not committed.** They carry personal detail and third parties that
have nothing to do with the portfolio, and this repo may go public
([#48](https://github.com/ali-wallick/portfolio/issues/48)). Their measurements are recorded here
rather than being re-derivable — which is a real cost, and the right trade. `--baseline` on the
checker re-derives the blog numbers only.

**The documents corpus is the important one**, because it is adult Ali writing to persuade someone.
The blog is a 25-year-old being delighted. The site needs the register of the former with some of the
warmth of the latter.

## The measurements

`node .claude/skills/write-copy/scripts/copy-stats.mjs --baseline` reproduces the blog column.

| Metric                   | Blog (2010–19) | Documents (2016–24) | Interview (2017) | Chat (2026) | Site (before) | Site (now) |
| ------------------------ | -------------- | ------------------- | ---------------- | ----------- | ------------- | ---------- |
| Words measured           | 5,122          | 4,229               | 323              | 263         | 5,743         | 3,045      |
| **Mean sentence length** | **16.9**       | **17.2**            | **14.6**         | **17.5**    | **32.2**      | **16.2**   |
| Longest sentence         | 57             | 44                  | **27**           | 36          | 49            | 39         |
| Em dashes per 1k         | **0.0**        | **0.0**             | **0.0**          | **0.0**     | 15.8          | **0.0**    |
| Contractions per 1k      | 17.0           | 0.7                 | 18.6             | 49.4        | 21.6          | 16.9       |
| Exclamation points       | 96             | 9                   | 8                | 0           | 2             | 1          |
| Question marks           | 6              | 16                  | 0                | 3           | 0             | 0          |

**The "Site (now)" column is post-pass and is the one to read.** #31 and its 21 sub-issues closed
2026-08-26; the "before" column is kept because it is the evidence that motivated the pass, not a
description of anything that still exists. Scope note: "before" measured 5,743 words across all
content; "now" measures 3,045 words of `src/content/{projects,jobs}` **body prose only** — front
matter and `.astro` page copy are excluded, and the drop in total is real (the em-dash pass tightened
prose, and `jobs[].summary` came out of the model entirely for #135/#141). **The exclamation row
counts body prose only, so it reads 1** — the other two live outside that scope rather than missing
from it: one on the homepage's composed "Currently" line (`index.astro`, since #207; About renders the
same fact with a full stop), and one in `/contact`'s invitation sentence, `.astro` page copy
(2026-09-03, #119).

Re-measure with `copy-stats.mjs src/content/projects/*.md src/content/jobs/*.md`. The column is the
state at that date, not a live reading — re-run today and the words and the longest sentence have
moved with the content.

**The contraction row was unreproducible from 2026-08-26, and it is the reason to distrust a clean
number rather than a flagged one.** #188 curled the apostrophes sitewide that day and prose mode
counted only the straight form, so the tool returned **0 contractions per 1k for every file on the
site** and flagged each one as far under the blog's 17 — an invitation to add contractions to prose
that already had them, on a metric this reference says twice not to tune toward. Fixed 2026-09-03
([#295](https://github.com/ali-wallick/portfolio/issues/295)); re-measured the same day, the site
reads **16.7 per 1k** across 3,177 words, so the 16.9 recorded above holds and nothing about the pass
needs revisiting.

**Every figure in this row counts possessive ’s alongside contracted ’s**, so all six columns read
high by however much their corpus talks about other people's things. That is how they were measured
and it is why they are comparable to each other; three of the corpora are not in this repo and can
never be re-measured under a stricter rule. Read the row as a direction and not as a count — and
never as evidence a page is short of contractions, which is the failure the fix above closed.

### The two findings that matter

**1. Seventeen words.** Four corpora: a blog written in her twenties (16.9), formal adult documents
(17.2), an employer Q&A (14.6), and messages typed into a chat window in 2026 (17.5). Sixteen years,
five genres, and everything sits between 14.6 and 17.5. **That is her sentence**, not an artifact of
any one register — it holds when she is being careful and when she isn't trying at all. A page can
avoid every AI tell on this list and still not sound like her if every sentence carries three
clauses.

**This gap is closed, and the number is now a floor to hold rather than a target to chase.** The
site was at 32.2 when this file was written — uniformly double, not occasionally long — and the #31
pass brought it to 16.2. The failure mode from here is the opposite one: don't "improve" a page by
consolidating short sentences back into long ones. `CLAUDE.md` carries the same warning.

The sharpest way to put the original finding: **the longest sentence in the entire 2017 interview is
27 words, which was shorter than the site's average.**

The chat and interview corpora are too small to take prose cues from, and chat's contraction and
first-person rates are register artifacts. They earn their rows for the one number.

**2. Zero em dashes in 9,937 words.** Across all four corpora, Ali has not used one. The site had 91
in 5,743 words when this was written; it now has **zero in visible page prose**, and that is
deliberate rather than incidental. The `{title} — Ali Wallick` `<title>`/`og:title` template is the
one surviving instance sitewide and stays — it is a structural separator, not prose.

_(Earlier drafts of this file said "one em dash." That one instance turned out to be in a `note:`
field written by a previous agent in a blog post's front matter — not Ali's writing at all. Corrected
2026-08-24.)_

She reaches for something else every single time:

- **Parentheses** — most characteristic. _"(and went for multiplayer which is always a ridiculous
  game jam choice)"_
- **A spaced hyphen** — 14 times in the documents. _"a 'game jam' - basically a weeklong contest"_
- **A spaced en dash** — 45 times in the blog. _"your first days will be overwhelming – that's ok"_
- **A full stop.** Usually the best option, because it fixes the length problem at the same time.

### What the numbers do _not_ say

- **Contractions are genre-dependent, not a voice trait.** 17/1k in the blog, 0.7/1k in formal
  documents. The site sits at 21.6 and is fine. Don't tune this.
- **Exclamation points are genre-dependent too.** 96 in the blog, 9 in the documents. Do not sprinkle
  the blog's rate across the site. **Settled 2026-08-26: the site's near-zero rate is correct and is
  not a gap to close.** Ali's own framing on reviewing the finished pass — "some warmth is good but
  I'm definitely wanting to veer more professional than the old site." The evidence agrees, and the
  mechanism is the thing to carry forward: **every exclamation in the site's visible prose is there
  because Ali asked for it directly.** "But we pulled it off!" (tilting-at-windmills) came from
  [#99](https://github.com/ali-wallick/portfolio/issues/99), and "the studio's first game in Godot!"
  (the homepage's Currently line; About carried the same sentence until #207) came from her review of the recalibration pass
  itself — she rejected a proposed warmth clause in the homepage lede and asked for the exclamation
  instead, on the ground that the current work is the thing worth being glad about. A third arrived
  the same way on 2026-09-03: `/contact`'s invitation sentence closes on "are all welcome!", asked
  for by Ali after reading the drafted line without one
  ([#119](https://github.com/ali-wallick/portfolio/issues/119)). **When she wants one, she says
  so.** One earned exclamation where something genuinely great happened is in-voice; a
  pass that adds them to hit a rate is not.
- **Question marks go the other way.** She uses them _more_ in adult writing than in the blog —
  see "Pressing with questions" below. The site has none.

## Sentences that are unmistakably hers

Study the rhythm, not the topic.

> After burning through my family's long distance minutes calling my uncle for advice on Myst at the
> age of 7, we knew the passion was here to stay.

> One of my favorite projects at Kaneva was a animation system I created after being frustrated at
> having to hand-code any animation. It ended up being used by both the UI and game teams!

> I've participated before (and went for multiplayer which is always a ridiculous game jam choice),
> but this year I decided to pitch!

> My biggest focus was on the level creator. I wanted to make sure we could have the tools to create
> a bunch of levels as I felt this was going to be incredibly important to the demo.

> It's really rewarding to board a plane and almost always see someone playing one of our games!

> One panel you'll see at many conventions is something along the lines of "how to break in", but
> rarely had I seen panels about what to do after that.

> I'm really enjoying learning about the crazy amount of depth that goes into these machines from
> every aspect.

### What those have in common

1. **Short declaratives, then one longer one.** She does not write 32-word sentences back to back.
2. **Parentheses for the aside** — where the site currently reaches for an em dash. _"(and went for
   multiplayer which is always a ridiculous game jam choice)"_.
3. **The motive is stated plainly.** "after being frustrated at having to hand-code any animation."
   She says _why_ she built something, in ordinary words, and that's what makes it read as a person.
4. **Concrete numbers, undramatized.** 61 levels, 188K DAU, four years, 48 hours. Stated and moved
   past — never "an impressive 188K."
5. **Enthusiasm about the craft, not about herself.** "the crazy amount of depth that goes into
   these machines." She is interested in things.
6. **Plain vocabulary.** No instance of: leverage, robust, seamless, delve, myriad, testament,
   landscape, elevate, unlock, cutting-edge. Her fanciest recurring word is "camaraderie."
7. **Credit lands on other people, specifically.** "Our level designers worked really hard on the
   intro levels." "A really great team formed."

## The 2017 interview: her voice when asked directly about her work

MobilityWare's "Meet Ali Wallick" Q&A. First-party — her employer publishing her answers — so it is
on the record and quotable, the same tier as the Marvel and Second Dinner videos in
`docs/decisions/content.md`.
Three things in it are directly usable.

### "Logic and creativity" is her own thesis about her work, stated twice

The single most valuable line in the corpus, because she arrives at it independently in two places
years apart:

> I discovered my love for programming in college, especially for **front end development where I can
> combine the logic of programming and creativity of design.** (2017)

> Immediately, I knew the major was for me — it combined computer science and digital media and
> **provided the perfect blend of creativity and logic.** (old `about.html`)

Same claim, same pairing, unprompted, two separate occasions. **This is not a phrase to invent for
her; it is one she already has**, and it is a far better answer to "why UI and front-end work"
than anything a wording pass would come up with. It's a strong candidate for the About page and
worth checking against whatever that page currently says.

### She leads with "I love", constantly

Five times in 320 words: "I've loved games since I was little," "I discovered my love for
programming," "I love the idea of being able to work on games that reach such diverse demographics,"
"I love being able to get in every day and work on challenges that make our games tick," "I also love
all the board games that are coming to mobile."

The site's copy states what she did, and states that she liked it sparingly. **The enthusiasm verb —
not the exclamation point — is the instrument that carries warmth at professional register**, and
this interview is the proof: it is an employer-published Q&A, not a blog, and she still says "I love"
five times in 320 words. An enthusiasm verb costs nothing and doesn't turn a page into a blog.

**Where the site actually landed (measured 2026-08-26, post-pass).** Four of the five featured pages
carry exactly one warmth beat, and all four sit in the closing `## What I Learned` section rather
than the body: Kaneva ("discovered a love for UI programming"), Marvel Snap ("I'm proudest of
watching Second Dinner grow"), Vegas Blvd Slots ("real respect for how much depth", "some of the most
satisfying work I did there"), and About ("I still enjoy talking about the work", "my love for
programming"). Firefall and I Fits I Sits close on a plain concrete fact instead, and **Firefall's is
a deliberate choice** — [#139](https://github.com/ali-wallick/portfolio/issues/139) cut a
reflective closer from that page and Ali picked the flat ending. The 11 archive entries carry none,
which is also deliberate: "it's so old it's more just for fun to show cool old projects" (#92).

**The homepage carries one too, and how it got there is the useful part.** It had none, and a
proposed warmth clause in the lede ("which is what drew me to it") was **rejected** in favor of a
single exclamation on the Currently line: "building the studio's first game in Godot!" Ali's reasoning —
the current work is the thing worth being glad about, so the warmth belongs on the Currently line
rather than bolted onto #129's workshopped lede. **Prefer moving a warmth beat onto the thing that
actually warrants it over adding a clause to copy that already works.**

**So the pattern is: one warmth beat, at the end, on the pages with a closer.** That is the settled
shape. Adding a second to a page that has one, or a first to the archive tier, is drift.

### She names specific things instead of gesturing at categories

Blendoku, Carcassone, Ticket to Ride, Castles of the Mad King Ludwig, Hobbiton, the Aurora Borealis.
Not "board games" or "puzzle games." This is the same instinct as the undramatized numbers, applied
to nouns, and it is the most reliable single marker of her writing.

Also note the register: **"challenges that make our games tick"** is how she describes engineering
work to a general audience. Casual, concrete, not a single abstraction.

### One refinement to the "passionate" correction below

"Passionate" is genuinely her word — she picks it as one of three to describe herself here. What
doesn't survive is the construction _"I am a programmer passionate about making games"_ as an opening
line, which is what her most formulaic documents do. **The word is hers; the opener is a form.** Don't ban the
word, ban the throat-clearing.

## Adult Ali: how she argues

The blog shows warmth. The documents show _structure_ — and structure is what a portfolio page needs.
Four devices recur, none of which the site currently uses.

### Concede, then press

Her signature move. She gives the other side its due in full, sincerely, and then does not drop the
point. It reads as fair rather than soft, and it is what makes the documents persuasive: a full,
plain sentence clearing the other party, then "however" and the specifics, in the next breath.

The portfolio use is obvious once seen: it's how you write about a decision that was reasonable at
the time and still had to be revisited. The Snap PC-launch section is exactly that shape — a direct
port was "a reasonable one for a first release," and then Early Access exit meant redoing the UI.

### Pressing with questions

Sixteen question marks in 4,200 words, and they arrive in bursts of three or four, each one a short,
pointed "was this never checked?" about a specific thing.

Rhetorical questions are a real device of hers and the site uses none. Sparingly — one, to open the
problem a piece of work solved, is very much in voice.

### Labeled lead-ins

The longer documents are organized as a bolded label, a colon, then plain explanation — two or three
words naming the problem, never a sentence. One does the same with bolded opening sentences under
each heading.

**This validates the Marvel Snap page's structure**, which was written before this corpus existed. The
bolded-lead-in pattern is genuinely hers. It stops being hers when _every_ paragraph has one — see
SKILL.md §3 on dosage.

### Saying the feeling plainly

She states her reaction in short, unhedged sentences, then moves straight back to specifics. Six to
nine words, first person, the feeling named outright.

No throat-clearing, no "I must admit," no softening. The portfolio equivalent is "It's definitely
been one of my proudest moments as a game dev" (blog) — a flat statement of how she felt about the
work, adjacent to the facts rather than dressed over them.

## The correction: she does use the banned words — when she's on autopilot

An earlier draft of this reference claimed Ali had never used "utilize" or "passionate about." Both
appear in the documents corpus — "passionate about" as an opening line, "utilizing" in front of a
list of methodologies.

Both are from the two most formulaic documents in it, **which are by a distance the least
her-sounding.** They are the only documents with no specifics, no parentheticals, no motive stated,
and no evident interest in anything.

**So the guidance survives, with a better reason attached.** These words are not forbidden because
Ali dislikes them. They are a _symptom_: they show up precisely when she is writing to a form instead
of about a thing. Encountering one in a draft is a prompt to ask whether the whole paragraph has gone
generic — which is the exact failure mode a portfolio page is prone to.

## Her résumé register is a different voice

Do not import blog warmth into the resume, and do not import resume compression into prose.

> _UI Programming:_ Constructed and coded many of Kaneva's core menus. Architected and programmed the
> menu animation system.

> _It Fits I Sits:_ Pitched concept for a mobile cat puzzle game for the annual game jam. Created a
> prototype with a team over a week. Won "People's Choice Award" and game was selected to be
> developed and released for Facebook Instant Games.

Verb-first, subject dropped, no contractions, no exclamations, labels in italic. That's the target
for `highlights` and `highlightsExtended`, and it is already what the current resume does well.

## Habits of hers to _not_ carry forward

Being faithful to her voice is not the same as copying 2010 Ali. These are things the old writing
does that the new site should not:

- **Present tense that goes stale.** "Currently I am an engineer at Second Dinner… for our upcoming
  mobile Marvel game!" sat on the site for seven years. This is the site's founding bug.
- **"I'm a gal passionate about developing games."** The 2010 homepage. Warmth is right; this
  particular sentence has aged badly, and "passionate about" now reads as filler on every portfolio
  on the internet. Show the passion with a specific, as she does everywhere else.
- **Typos and agreement slips** — "a animation system", "In my 4 years at there", "libaries",
  "propretary". Charming in a blog, not on a portfolio.
- **Undirected list-dumping.** The old Kaneva page lists eleven menus as bullets. The information is
  good; the shape is a changelog.

---

## Extending this corpus

This file is meant to grow. It is not a one-time exercise, and the numbers in it are cheap to
recompute when new material turns up.

**What makes a good sample**, roughly in order of value:

1. Ali writing about technical work for someone else to read — a design doc, a postmortem, a
   long code-review comment, a conference proposal. **This is the gap.** Nothing in any corpus is
   her explaining a system she designed, which is exactly what the featured project pages are.
2. Anything adult, written to persuade or explain. The documents corpus was the most useful addition
   by a distance.
3. Anything recent, even informal. Chat messages confirmed the central number in 260 words.

**The NDA line, and why it costs less than it looks.** Nothing covered by a work NDA goes in this
corpus, ever — same ceiling as the site itself (`CLAUDE.md`, "craft, not product"). That rules out
most of what Ali has written since 2019, which sounds fatal for a voice reference and isn't. Her
sentence length is stable to within half a word across four genres and sixteen years, and the em dash
is absent from all of them. **Voice measurements transfer across subject matter.** A personal letter
and a design doc are written by the same person at the same sentence length. Non-work writing
is not a compromise sample; it's a perfectly good instrument for everything except vocabulary.

**How to fold in a new sample:**

1. Measure it: `node .claude/skills/write-copy/scripts/copy-stats.mjs <file>`.
2. Check whether the 17-word figure and the zero-em-dash finding hold. **If a new corpus disagrees,
   that is the finding** — say so here rather than averaging it away.
3. Add quoted sentences to the sections above only where they show something the existing quotes
   don't. More examples of the same move is not an improvement.
4. If the sample can't live in the repo (personal detail, third parties, anything NDA-adjacent),
   record its measurements here and say explicitly that it isn't committed — as the documents row
   does. Do not paraphrase it into the file to get around that.

**Never add search-engine summaries or paraphrase as voice evidence.** A 2017 MobilityWare interview
with Ali exists and would be genuinely useful, but it was unreachable from this environment and only
available as search-result summary. A summary is the search engine's sentences about her answers, not
her answers, and folding that into a voice reference would poison the instrument with exactly the
generic register it exists to detect. Left out on purpose. If Ali can get the original text, it's
worth adding.
