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

| Field       | Notes                                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`     | As the game is actually called.                                                                                                                         |
| `tier`      | `featured` (a real write-up, ~5 total) or `archive` (one scannable line).                                                                               |
| `startYear` | Plus `endYear` for multi-year work. Omit `endYear` for single-year projects.                                                                            |
| `status`    | `shipped` / `prototype` / `jam` / `coursework` / `unannounced`. Honest framing is the point — a 48-hour jam entry should not read like a shipped title. |

Strongly wanted, and **required before the entry can be published** (`draft: false`):

- `summary` — one line, under 220 characters, used verbatim on cards and in the archive list.
- `role` — an array, in Ali's words. `[Lead UI Programmer]`, not `[Contributor]`. For an entry with
  more than one hat and no single job title, use a short tag list rather than a sentence —
  `[Designer, Artist]`, not `[Level design, virus character art, and modeling]`. Agent nouns
  (Designer, Artist, Programmer), not activity nouns (Design, Art, Programming) — that matches how
  every job-derived role already reads elsewhere on the site (`Software Engineer`, `UI Programmer`).
  Precedent: Dead Booty, It Will Kill You, Mini Mages
  ([#93](https://github.com/ali-wallick/Portfolio/issues/93)). It renders comma-joined, which is
  what a single-item array gives you for free — one hat needs no special case
  ([#152](https://github.com/ali-wallick/Portfolio/issues/152)).
- `hero` — an image or a YouTube video.

Optional but valuable: `engine`, `tech`, `platforms`, `collaborators`, `event`, `job`, `links`,
`gallery`, `shortTitle`.

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
- **A link you know is dead gets `dead: true`, not deletion** — but check the Wayback Machine first
  if it's a citation worth keeping clickable (a press writeup that corroborates a credit, especially).
  A working `web.archive.org` snapshot as `url`, label suffixed `(via Wayback Machine)`, beats
  `dead: true`'s "No longer online: X" plain text — it keeps the citation live instead of just
  inert. Reserve `dead: true` for links where the fact of having existed isn't really the point (a
  store listing, a project's own dead homepage). See `content.config.ts`'s `link` schema comment.
- **`featured` requires `featureOrder`** (a positive integer) to place it on the projects page.
- **Leave fields empty when the source doesn't support them.** Don't infer an engine from a
  platform.
- **Start new entries at `draft: true`** unless summary, role, and hero are all genuinely ready.

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
draft: true
---

Body prose goes here — but only for `featured` entries, and use the
`write-project-page` skill to write it.
```
