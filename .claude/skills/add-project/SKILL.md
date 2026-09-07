---
name: add-project
description: Add a new project entry to the aliwallick.com portfolio, or fill in metadata on an existing one. Use when the user wants to add a game, project, or shipped title to the site, asks "add X to my projects", wants to record a jam entry, or needs to change a project's tier, year, engine, role, links, or media. Handles front matter and the content model only — for writing the prose body of a featured write-up, use write-project-page instead.
---

# Add a project entry

Adding a project is **one Markdown file** in `src/content/projects/`. That is the central promise of
this repo's content model: never a layout change, never a hand-maintained index, never a second
place to update.

## 1. Read the model first

Read `src/content.config.ts`. It is heavily commented and it is the contract. Do not work from
memory or from another entry's shape alone — the schema has real constraints and useful error
messages, and a few fields exist specifically to prevent bugs the old site had.

## 2. Gather what you need

Ask the user for anything missing rather than guessing. **A wrong fact is much worse than an empty
field** — empty fields degrade gracefully in the templates, wrong ones ship.

Required to create anything:

| Field       | Notes                                                                                                                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`     | As the game is actually called.                                                                                                                                                                                 |
| `tier`      | `featured` (a real write-up, ~5 total) or `archive` (one scannable line).                                                                                                                                       |
| `startYear` | Plus `endYear` for multi-year work. Omit `endYear` for single-year projects.                                                                                                                                    |
| `status`    | `shipped` / `prototype` / `jam` / `coursework` / `unannounced`. Honest framing is the point — a 48-hour jam entry should not read like a shipped title. **Required for a game; optional for any other `kind`.** |
| `kind`      | `game` (the default — leave it off for a game) / `site` / `talk` / `tool`. What the thing IS, not what it was built in. See §3a.                                                                                |

Strongly wanted, and **required before the entry can be published** (`draft: false`):

- `summary` — one line, under 220 characters, used verbatim on cards and in the archive list.
  **A featured summary is a single sentence, sitewide** — Ali's call on
  [#101](https://github.com/ali-wallick/Portfolio/issues/101): "I like these descriptions being a
  single sentence." When it's carrying more facts than fit in one, move the overflow into the body
  rather than letting the summary run to two. **And where the concept sentence lives is negotiable
  when the entry has a body**: most summaries pair a context sentence with a concept hook, but Night
  Light moved its hook into the body and left a context-only summary
  ([#96](https://github.com/ali-wallick/Portfolio/issues/96)). Ask if it isn't obvious which reads
  better.
- `role` — an array, in Ali's words. `[Lead UI Programmer]`, not `[Contributor]`. For an entry with
  more than one hat and no single job title, use a short tag list rather than a sentence —
  `[Designer, Artist]`, not `[Level design, virus character art, and modeling]`. Agent nouns
  (Designer, Artist, Programmer), not activity nouns (Design, Art, Programming) — that matches how
  every job-derived role already reads elsewhere on the site (`Software Engineer`, `UI Programmer`).
  Precedent: Dead Booty, It Will Kill You, Mini Mages
  ([#93](https://github.com/ali-wallick/Portfolio/issues/93)). It renders comma-joined, which is
  what a single-item array gives you for free — one hat needs no special case
  ([#152](https://github.com/ali-wallick/Portfolio/issues/152)).
- `hero` — an image or a YouTube video, or `{ type: art }` for the one case where no picture can
  ever exist. See §3a.

Optional but valuable: `engine`, `tech`, `platforms`, `collaborators`, `event`, `job`, `links`,
`gallery`, `shortTitle`.

## 3a. Entries that are not games ([#49](https://github.com/ali-wallick/Portfolio/issues/49), 2026-09-05)

The collection was built as if every entry were a game with a picture of it. It isn't only that any
more, and the two draft entries that opened it up are the reference for each case:

- **`kind: site` / `talk` / `tool`** — a website, a talk, a plugin. Set `kind` and the meta strip
  shows it as a chip ("Website", "Talk"), so a tile on `/projects` says what it is at a glance.
  `status` is optional for these — a talk has no shipped/jam state to be honest about — but set one
  where it is true (`aliwallick-com.md` is `kind: site` and `status: shipped`, and shows both chips).
  `engine` stays empty; `tech` carries what it was built with. A talk's venue is its `event`, its
  role is `[Speaker]`, and its deck is a link with `kind: slides`.
- **`hero: { type: art }`** — the site's own generated typographic card, at hero size, for a page
  whose subject **cannot** be pictured. Today that is exactly one page: `second-dinner-godot.md`,
  the current unannounced work, which the Second Dinner ceiling in `CLAUDE.md` fences off entirely
  (craft, not product — and a photo of that team is ruled out there by name). The completeness check
  is unchanged and still requires a hero; `art` is the honest way to satisfy it when a picture is
  not something Ali can supply later but something the page must not have. **Do not reach for it
  because sourcing a picture is inconvenient.** A jam entry with no capture is a draft, not an art
  hero.
- **A draft can stay a draft for as long as it needs to.** Drafts render in `astro dev` and on
  every branch preview, are excluded from production, the sitemap and the OG-image set, and are
  `noindex` on previews. That is the mechanism for a page Ali wants to add to over time before
  showing anyone: keep `draft: true`, push a branch to look at it, and flip the flag when it is
  ready. Nothing else has to change on the day it goes live.

## 3. Rules that are easy to get wrong

- **Filename is the URL.** `src/content/projects/vegas-blvd-slots.md` → `/projects/vegas-blvd-slots`.
  Lowercase kebab-case, always. (Seven of the old site's pages existed twice under two casings
  because of a case-insensitive-macOS rename in 2016 — that is why this rule is not negotiable.)
- **YouTube is a bare 11-character video ID**, never a URL. The component builds the embed.
  `https://www.youtube.com/watch?v=8gtbz_T4-yY` → `id: 8gtbz_T4-yY`.
- **Professional work uses `job:`, not a company name.** It is a reference into the `jobs`
  collection (`job: mobilityware`), so a project and the resume can never disagree about who Ali
  worked for. Jam and school work uses `event:` instead.
- **Georgia Tech `event` values follow one format, standardized 2026-08-24:** `Georgia Tech` always
  leads, followed by at most one `, <short descriptor>` for the specific lab, studio, or course —
  never "at Georgia Tech", never a chained multi-level org name. `event` renders on the `/projects`
  grid cards, not just the detail page, so a long or oddly-ordered value shows up as uneven card
  heights across the archive grid, not just as an inconsistency on one page. Bare `Georgia Tech` is
  correct and complete when there's no subsection worth naming — don't force one. See
  `content.config.ts`'s `event` comment for the full rule and examples (Secret Garden, KinoClue,
  Mini Mages, Prodigal).
- **A link you know is dead gets `dead: true`, not deletion — but check the Wayback Machine first,
  on any URL, homepages included.** A working `web.archive.org` snapshot as `url`, label suffixed
  `(via Wayback Machine)`, beats `dead: true`'s inert "No longer online: X" text, because the
  snapshot _shows_ the thing existed instead of asserting it. This was originally scoped to
  citations, with a project's own dead homepage listed as the case that didn't need it — wrong: once
  kaneva.com actually rendered "No longer online: kaneva.com," Ali asked for a Wayback link
  ([#140](https://github.com/ali-wallick/Portfolio/issues/140)), and firefall.com got the same fix
  ([#139](https://github.com/ali-wallick/Portfolio/issues/139)). Both point at snapshots from Ali's
  time there. See `content.config.ts`'s `link` schema comment.
  **Prefer dropping the link outright over `dead: true` for a broken _action_.** A dead homepage is
  proof the thing existed; a dead "Play online" link (Cor Ex Machina's Unity Web Player build) is a
  broken button offering nothing once it fails, and Ali cut it on sight
  ([#90](https://github.com/ali-wallick/Portfolio/issues/90)). Ask whether the reader loses
  information or just a broken button.
  **Load a Wayback swap in a browser before shipping it — `curl` cannot tell you it works.** An
  archived App Store listing returned a full 200 with complete HTML and shipped on that evidence;
  opened for real it hung forever on Apple's client-side "Connecting to Apple Music..."
  interstitial, which archived replay can never resolve. The same page tripped the reverse: a Wix
  product page `curl`'d back as almost no text because it's entirely client-rendered, and was the
  fuller working page in a browser ([#137](https://github.com/ali-wallick/Portfolio/issues/137)).
  `curl` and the availability API only prove a URL _responds_. Use the Browser pane tools and read
  what a visitor would actually see.
- **`featured` requires `featureOrder`** (a positive integer) to place it on the projects page.
- **Leave fields empty when the source doesn't support them.** Don't infer an engine from a
  platform.
- **`draft` is required and never defaulted**, so every entry says which it is. Set `draft: true`
  until summary, role, and hero are ready, and the build refuses to publish before then.
- **A game needs a `status`; nothing else does.** The build fails on a `kind: game` (or an entry
  with no `kind`, which is the same thing) that omits it.

## 4. Media

Images live in `src/assets/images/projects/<slug>/` and are referenced relative to the Markdown
file:

```yaml
hero:
  type: image
  src: ../../assets/images/projects/vegas-blvd-slots/hero.png
  alt: A slot machine mid-spin, three sevens lined up
```

`alt` is required by the schema and the path is validated at build time, so a typo or a renamed file
fails the build rather than shipping a broken image.

**Archive-tier captions are descriptive by default** — no "I" or "Ali" — matching the tier's
lower-key framing (Dead Booty, Prodigal). It is a default to reach for, not a rule to defend against
a direct request: Night Light's ceiling-fan caption is first person because Ali asked for it, to
credit a specific contribution the caption sits next to
([#96](https://github.com/ali-wallick/Portfolio/issues/96)).

**For a live commercial title with no personal captures of your own** (a shipped, currently-running
game rather than a jam or student project), official screenshots are the right source — the game's
own Steam/App Store/press-kit assets, not a fan site. Marvel Snap's gallery
([#136](https://github.com/ali-wallick/Portfolio/issues/136), 2026-08-26) came from the Steam store
page's own screenshot carousel and a press image already cited in `links`. **Watch for fan sites
rendering their own database UI, not the actual game** — marvelsnapzone.com's card pages looked like
in-game screenshots at a glance but are that site's own layout displaying card data, not a capture of
Marvel Snap itself; the real evidence was a screenshot embedded in a press article, and separately,
Steam's own store screenshots. Verify what's actually on screen, not just where the image was linked
from. **Downloading any file needs the user's explicit go-ahead — state the filename, source, and
size before saving one**, same as any other file download.

## 5. Verify

Always run this before reporting done:

```bash
SHOW_DRAFTS=true npm run build && npm run links
```

The build validates the schema and every collection reference. If the entry is not a draft, the
build also enforces that summary, role, and hero are all present — that is what "done" means for a
project page.

**Check that every `links[].url` actually resolves — nothing in CI will.** `check-links.mjs`
deliberately does not fetch external links (for CI speed; see its header comment), and neither does
the content-pass audit script, so a dead outbound link only gets caught when a human clicks it —
which is how Tilting at Windmills shipped a 403'ing Global Game Jam link through an earlier pass
([#99](https://github.com/ali-wallick/Portfolio/issues/99)). Run `npm run links:external` — it
buckets results as ok / unverifiable (a host like LinkedIn that answers 403, 999, or 406 to a
script) / dead, and only fails on dead. **It cannot run from a Claude Code web session**, where the
egress proxy answers 403 for every YouTube URL — a web session should say so rather than reporting
the links as checked. Once you find a dead one, the `dead: true` guidance in §3 applies.

Then tell the user the page's URL path so they can look at it on the preview deploy.

## Template

```markdown
---
title: Game Name
tier: archive
startYear: 2024
status: shipped
summary: One line about what it is and what was interesting about it.
engine: [Unity]
tech: [C#]
platforms: [iOS, Android]
role: [Client Engineer]
job: second-dinner # OR: event: Global Game Jam 2024
links:
  - label: Download for iOS
    url: https://apps.apple.com/...
    kind: store
hero:
  type: youtube
  id: xxxxxxxxxxx
  title: Game Name trailer
  poster: # required since #273: what a dead video degrades to, and the tile thumbnail
    src: ./game-name/poster.jpg
    alt: What the picture shows, not what the video is
draft: true
---

Body prose goes here — but only for `featured` entries, and use the
`write-project-page` skill to write it.
```
