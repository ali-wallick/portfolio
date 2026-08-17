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
- `role` — in Ali's words. "Lead UI Programmer", not "Contributor".
- `hero` — an image or a YouTube video.

Optional but valuable: `engine`, `tech`, `platforms`, `teamSize`, `collaborators`, `event`, `job`,
`links`, `gallery`, `shortTitle`.

## 3. Rules that are easy to get wrong

- **Filename is the URL.** `src/content/projects/vegas-blvd-slots.md` → `/projects/vegas-blvd-slots`.
  Lowercase kebab-case, always. (Seven of the old site's pages existed twice under two casings
  because of a case-insensitive-macOS rename in 2016 — that is why this rule is not negotiable.)
- **YouTube is a bare 11-character video ID**, never a URL. The component builds the embed.
  `https://www.youtube.com/watch?v=8gtbz_T4-yY` → `id: 8gtbz_T4-yY`.
- **Professional work uses `job:`, not a company name.** It is a reference into the `jobs`
  collection (`job: mobilityware`), so a project and the resume can never disagree about who Ali
  worked for. Jam and school work uses `event:` instead.
- **A link you know is dead gets `dead: true`, not deletion.** It renders as plain text instead of an
  anchor. The credit is still true even when the site is gone.
- **`featured` requires `featureOrder`** (a positive integer) to place it on the projects page.
- **Leave fields empty when the source doesn't support them.** Don't infer an engine from a
  platform.
- **Start new entries at `draft: true`** unless summary, role, and hero are all genuinely ready.

## 4. Media

Images live in `src/assets/projects/<slug>/` and are referenced relative to the Markdown file:

```yaml
hero:
  type: image
  src: ../../assets/projects/vegas-blvd-slots/hero.png
  alt: A slot machine mid-spin, three sevens lined up
```

`alt` is required by the schema and the path is validated at build time, so a typo or a renamed file
fails the build rather than shipping a broken image.

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
role: Client Engineer
job: second-dinner # OR: event: Global Game Jam 2024
teamSize: 6
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
