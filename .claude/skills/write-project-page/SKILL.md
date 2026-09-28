---
name: write-project-page
description: Write or rewrite the prose body of a featured project write-up on aliwallick.com, in Ali's voice, from source material. Use when the user wants to write up a project, flesh out a draft project page, turn notes or an old page or a blog post into a real write-up, or fix stale tense and wrong facts in existing project copy. For front matter and metadata only, use add-project instead.
---

# Write a project page

Featured projects get a real write-up: the problem, what was built, what was learned.

**Archive entries may carry a short body too, and a `gallery`, where there is material worth
having** — settled 2026-08-24 on [#97](https://github.com/ali-wallick/portfolio/issues/97), which
overturned the summary-only rule this file used to state. Three things scope it:

- **Permission, not a quota.** An entry with nothing more to say stays summary-only, and that is a
  correct outcome rather than an unfinished one.
- **No featured-tier section headings.** `## What I Built` / `## What I Learned` are what preserve
  the tier distinction; length is a guideline, not a hard cap, and not a one-paragraph rule either
  (Night Light shipped two — a concept sentence, then the contribution detail).
- **The guideline is calibrated to what the tier mostly is** — early student and jam work that
  doesn't need much — **not a ceiling on a richer entry demoted into it later.** Ali expects to move
  Kaneva into this tier eventually and doesn't want that to mean cutting it down to match a 2009
  class project. Deliberately unsolved until that move actually happens.

For front matter only, with no body, use `add-project`.

## 1. Gather source material before writing a word

Almost everything needed already exists in this repo. Look, in this order:

| Source                      | What's in it                                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `snapshot-pre-retirement`   | The old live page, via `git show snapshot-pre-retirement:snapshot/projects/<Name>.html`. Often the only description that exists. |
| `content/archive/`          | 20 blog posts, 2010–2019. **First-person detail the project pages never had.**                                                   |
| The Wayback Machine         | Not just a dead-link fix — archived pages carry credits and descriptions the site's own old page compressed away.                |
| `src/content/jobs/<job>.md` | The 2019 resume bullets, preserved verbatim under "Source material".                                                             |
| `src/assets/images/`        | Screenshots and banners.                                                                                                         |
| The user                    | Anything from after 2019, and anything the old site got wrong.                                                                   |

`content/archive/` is read-only — `.claude/hooks/guard-preserved.sh` refuses a Write or Edit to it —
so read it and write the project page elsewhere. The old site's pages are not in the tree at all any
more; they are on the `snapshot-pre-retirement` tag (#45).

The blog archive is the highest-value and most-overlooked source. The GGJ 2013, GDC 2013, "My First
2 Panels", MobilityWare, and It Fits I Sits posts contain material that can't be templated. Fold it
in as a pull-quote or a "what I wrote at the time" aside where it earns the space. **Run
`grep -ril <project-or-theme-keyword> content/archive/` every time a project has a plausible
publication-year match**, not only when the current copy already reads thin — Tilting at Windmills'
flat first draft was missing the whole story (a locked-down network at the jam site, and they pulled
it off anyway) that Ali's own post about that exact jam already told
([#99](https://github.com/ali-wallick/portfolio/issues/99)).

**Fetch the archived page even when a project's `url` still resolves.** Checking Critter³'s broken
Global Game Jam link surfaced the game's own credits page — full names for all seven team members,
split by discipline — which confirmed `teamSize` and populated `collaborators` with real names
neither the old page nor the blog had ([#91](https://github.com/ali-wallick/portfolio/issues/91)).

**Read a source for the limit it puts on her own contribution, not just what she did.** A `role` or a
summary compressed from a longer sentence can end up a broader claim than the source actually
supported.

**Ask the user before inventing anything.** If the sources don't say what an engine was or what the
team size was, the answer is to ask or to leave it out — not to produce a plausible sentence.

**And sometimes the interview comes first, not last.** When the ask itself says "rethink this," the
page's whole premise has aged out of its sources, and mining old pages for a round is spending time
on something that isn't there. `/about` was rewritten from a direct interview
([#141](https://github.com/ali-wallick/portfolio/issues/141)) and its richest material — speaking to
a college class and a Girl Scout troop, a synagogue board seat — had no trace anywhere in the repo.

## 2. Voice

Read the "Voice and content conventions" section of `CLAUDE.md` — it is the authority and it may
have moved on since this file was written, and `docs/decisions/content.md` for the reasoning
behind it. The short version:

- **First person, past tense.** The single biggest factual problem with the old site was present
  tense that stopped being true in 2019 and sat on the page for seven years. Anything that finished
  is past tense, including "I currently work at…" for a job that ended.
- **Specific over impressive.** "Architected the menu animation system, adopted by both the UI and
  game teams" beats "contributed to UI development". Ali's own old pages are full of the specific
  kind — that instinct is the thing to preserve.
- **Say what was hard.** A write-up that is only accomplishments reads like a press release. The
  constraint, the thing that didn't work, the thing learned — that's the interesting half.
- **Credit the team honestly.** Say "we" for team work and "I" for the specific parts that were
  Ali's. Collaborators go in the `collaborators` front matter field, not in a paragraph — a team's
  name or composition sitting in prose duplicates what the rendered "Team" section already says, and
  no other entry on the site does it. Flag one proactively rather than waiting for Ali to cut it
  ([#89](https://github.com/ali-wallick/portfolio/issues/89)).
- **Modern, a bit irreverent.** It should be obvious a game developer wrote this.

## 3. Shape

There is no rigid template — a good write-up is a real piece of writing, not a filled-in form.
Roughly 300–600 words, and it usually wants to cover:

1. **What it is** — enough that a reader who's never heard of it can follow.
2. **The interesting problem** — the constraint, the technical or design challenge.
3. **What Ali built** — specifically. This is the part a hiring manager reads.
4. **What came of it** — shipped, won something, taught something, died on the vine. All fine, as
   long as it's true.

Markdown headings start at `##` — the page renders `<h1>` from the `title` front matter. Title-case
multi-word headings ("What I Built", "What I Learned") — see `CLAUDE.md`'s "Voice and content
conventions" for the rule.

## 4. Things that must not come back

The old pages had these; the new ones must not.

- **Present tense about past work.** Grep the draft for "currently", "upcoming", "unannounced",
  "planned for", "I am". Marvel Snap shipped in October 2022.
- **Raw YouTube URLs or `<iframe>` in the body.** Media goes in front matter as a bare video ID.
- **Live links to dead sites.** firefall.com, kaneva.com, argamestudio.org, and the MySpace music
  page are all gone. Mark them `dead: true` in `links` rather than linking or silently dropping the
  credit.
- **Unity Web Player anything.** The plugin API has been unsupported by every browser for a decade.

## 5. Finish the entry

A write-up is only publishable when its front matter is complete. Once the prose is done:

1. Fill in `summary`, `role`, and `hero` if they aren't already there.
2. Flip `draft: true` → `draft: false`. The build enforces those three fields on publish, so this
   step will fail loudly if something is missing.
3. Delete any `TODO(#n)` comment whose question you actually resolved; a marker with no issue
   number needs one.

```bash
SHOW_DRAFTS=true npm run build && npm run links
```

Then give the user the page's path and let them read it on the preview URL. **Do not skip this** —
prose is exactly the kind of work that needs a human read before it counts as done.
