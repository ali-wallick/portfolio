# Ali's voice, from primary sources

Everything here is quoted or measured from Ali's own writing. Nothing is invented, and nothing is
inferred from "what a game developer sounds like."

## The corpora

| Corpus        | What                                                                                                                                                      | Size         | In the repo?       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------ |
| **Blog**      | `content/archive/`, 20 posts, 2010–2019. Unedited, first person, young.                                                                                   | ~5,100 words | yes                |
| **Old site**  | `snapshot/` — About, index, project pages. More considered, still hers.                                                                                   | ~1,800 words | yes                |
| **Résumé**    | 2019 bullets, verbatim under "Source material" in `src/content/jobs/*.md`.                                                                                | ~400 words   | yes                |
| **Documents** | Two cover letters (2016, 2019), a client email (2023), a warranty escalation letter (2023), a volunteer synthesis doc (2024). Supplied by Ali 2026-08-24. | ~4,200 words | **no — see below** |
| **Chat**      | Ali's own messages in the session that built this skill, 2026-08-24. Casual, unedited, typed quickly.                                                     | ~260 words   | no                 |

**The documents are deliberately not committed.** They contain phone numbers, third-party names, and
personal matters that have nothing to do with the portfolio, and this repo may go public
([#48](https://github.com/ali-wallick/Portfolio/issues/48)). Their measurements are recorded here
rather than being re-derivable — which is a real cost, and the right trade. `--baseline` on the
checker re-derives the blog numbers only.

**The documents corpus is the important one**, because it is adult Ali writing to persuade someone.
The blog is a 25-year-old being delighted. The site needs the register of the former with some of the
warmth of the latter.

## The measurements

`node .claude/skills/write-copy/scripts/copy-stats.mjs --baseline` reproduces the blog column.

| Metric                   | Blog (2010–19) | Documents (2016–24) | Interview (2017) | Chat (2026) | The site |
| ------------------------ | -------------- | ------------------- | ---------------- | ----------- | -------- |
| Words measured           | 5,122          | 4,229               | 323              | 263         | 5,743    |
| **Mean sentence length** | **16.9**       | **17.2**            | **14.6**         | **17.5**    | **32.2** |
| Longest sentence         | 57             | 44                  | **27**           | 36          | 49       |
| Em dashes per 1k         | **0.0**        | **0.0**             | **0.0**          | **0.0**     | 15.8     |
| Contractions per 1k      | 17.0           | 0.7                 | 18.6             | 49.4        | 21.6     |
| Exclamation points       | 96             | 9                   | 8                | 0           | 2        |
| Question marks           | 6              | 16                  | 0                | 3           | 0        |

### The two findings that matter

**1. Seventeen words.** Four corpora: a blog written in her twenties (16.9), formal adult documents
(17.2), an employer Q&A (14.6), and messages typed into a chat window in 2026 (17.5). Sixteen years,
five genres, and everything sits between 14.6 and 17.5. **That is her sentence**, not an artifact of
any one register — it holds when she is being careful and when she isn't trying at all. The site's
copy is at 32, not occasionally long but uniformly double. **This is the highest-leverage fix
available, ahead of any word choice.** A page can avoid every AI tell on this list and still not
sound like her.

The sharpest way to put it: **the longest sentence in the entire 2017 interview is 27 words, which
is shorter than the site's average.**

The chat and interview corpora are too small to take prose cues from, and chat's contraction and
first-person rates are register artifacts. They earn their rows for the one number.

**2. Zero em dashes in 9,937 words.** Across all four corpora, Ali has not used one. The site has 91
in 5,743 words of content.

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
  the blog's rate across the site. The signal is only that her natural register is warmer than the
  site currently is; one earned exclamation on a page where something genuinely great happened is
  in-voice.
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
4. **Concrete numbers, undramatised.** 61 levels, 188K DAU, four years, 48 hours. Stated and moved
   past — never "an impressive 188K."
5. **Enthusiasm about the craft, not about herself.** "the crazy amount of depth that goes into
   these machines." She is interested in things.
6. **Plain vocabulary.** No instance of: leverage, robust, seamless, delve, myriad, testament,
   landscape, elevate, unlock, cutting-edge. Her fanciest recurring word is "camaraderie."
7. **Credit lands on other people, specifically.** "Our level designers worked really hard on the
   intro levels." "A really great team formed."

## The 2017 interview: her voice when asked directly about her work

MobilityWare's "Meet Ali Wallick" Q&A. First-party — her employer publishing her answers — so it is
on the record and quotable, the same tier as the Marvel and Second Dinner videos in `CLAUDE.md`.
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

The site's copy states what she did. It almost never states that she liked it. That's the warmth gap
the exclamation-point numbers hint at, in a form that's actually usable in portfolio register — an
enthusiasm verb costs nothing and doesn't turn a page into a blog.

### She names specific things instead of gesturing at categories

Blendoku, Carcassone, Ticket to Ride, Castles of the Mad King Ludwig, Hobbiton, the Aurora Borealis.
Not "board games" or "puzzle games." This is the same instinct as the undramatised numbers, applied
to nouns, and it is the most reliable single marker of her writing.

Also note the register: **"challenges that make our games tick"** is how she describes engineering
work to a general audience. Casual, concrete, not a single abstraction.

### One refinement to the "passionate" correction below

"Passionate" is genuinely her word — she picks it as one of three to describe herself here. What
doesn't survive is the construction _"I am a programmer passionate about making games"_ as an opening
line, which is what the cover letters do. **The word is hers; the opener is a form.** Don't ban the
word, ban the throat-clearing.

## Adult Ali: how she argues

The blog shows warmth. The documents show _structure_ — and structure is what a portfolio page needs.
Four devices recur, none of which the site currently uses.

### Concede, then press

Her signature move. She gives the other side its due in full, sincerely, and then does not drop the
point. It reads as fair rather than soft, and it is why her escalation letter is persuasive.

> This is pretty clearly a problem caused by Dometic and not HC. […] I don't blame HC for this one.
> However, I did several hours of free research.

> We really really appreciate the proactive work in this area. […] But this does bring up the QC
> concerns again.

The portfolio use is obvious once seen: it's how you write about a decision that was reasonable at
the time and still had to be revisited. The Snap PC-launch section is exactly that shape — a direct
port was "a reasonable one for a first release," and then Early Access exit meant redoing the UI.

### Pressing with questions

Sixteen question marks in 4,200 words, and in the escalation letter they arrive in bursts:

> Was drainage never tested originally? How did our camper get released to us without testing city
> water at all? Was the fresh water tank capacity in the original layout never tested?

Rhetorical questions are a real device of hers and the site uses none. Sparingly — one, to open the
problem a piece of work solved, is very much in voice.

### Labelled lead-ins

Both the escalation letter and the synthesis doc are organised as a bolded label, a colon, then plain
explanation — `Plumbing Issues:`, `Window Issues:`, `Missing Stabilizer:`. The synthesis doc does the
same with bolded opening sentences under each heading.

**This validates the Marvel Snap page's structure**, which was written before this corpus existed. The
bolded-lead-in pattern is genuinely hers. It stops being hers when _every_ paragraph has one — see
SKILL.md §3 on dosage.

### Saying the feeling plainly

She states her reaction in short, unhedged sentences, then moves straight back to specifics:

> I am feeling very upset about all of this.

> Honestly this is probably the most upsetting issue we've run into.

No throat-clearing, no "I must admit," no softening. The portfolio equivalent is "It's definitely
been one of my proudest moments as a game dev" (blog) — a flat statement of how she felt about the
work, adjacent to the facts rather than dressed over them.

## The correction: she does use the banned words — when she's on autopilot

An earlier draft of this reference claimed Ali had never used "utilize" or "passionate about." Both
appear in the documents corpus:

> I am a programmer **passionate about** making games, and local to the Irvine area.

> I have worked multiple times in agile environments, **utilizing** methodologies/technologies such
> as Scrum, Jira, and Confluence.

Both are from the cover letters, and **the cover letters are by a distance the least her-sounding
things in the corpus.** They are the only documents with no specifics, no parentheticals, no motive
stated, and no evident interest in anything. The 2016 letter is 160 words that could have been sent
by any engineer in Orange County.

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
2. Anything adult, written to persuade or explain. The 2023 documents were the most useful addition
   by a distance.
3. Anything recent, even informal. Chat messages confirmed the central number in 260 words.

**The NDA line, and why it costs less than it looks.** Nothing covered by a work NDA goes in this
corpus, ever — same ceiling as the site itself (`CLAUDE.md`, "craft, not product"). That rules out
most of what Ali has written since 2019, which sounds fatal for a voice reference and isn't. Her
sentence length is stable to within half a word across four genres and sixteen years, and the em dash
is absent from all of them. **Voice measurements transfer across subject matter.** A camper warranty
letter and a design doc are written by the same person at the same sentence length. Non-work writing
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
