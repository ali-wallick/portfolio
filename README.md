# aliwallick.com

Ali Wallick's portfolio — an [Astro](https://astro.build) static site deployed to Cloudflare Workers.

Rebuilt in 2026, replacing a hand-written PHP site last touched meaningfully in 2016. If you are
an agent working in this repo, read [`CLAUDE.md`](CLAUDE.md) first — it is the standing brief and
it will save you re-deriving everything below.

## Quick start

```bash
npm install
npm run dev
```

| Command            | What it does                                                             |
| ------------------ | ------------------------------------------------------------------------ |
| `npm run dev`      | Dev server at `localhost:4321`. Draft content is visible.                |
| `npm run build`    | Production build to `dist/`. Drafts excluded.                            |
| `npm run build:ci` | What Cloudflare runs. Drafts included unless `WORKERS_CI_BRANCH=master`. |
| `npm run verify`   | Everything CI runs: format, types, build, link check.                    |
| `npm run links`    | Post-build link / markup checks against `dist/`.                         |

## Layout

| Path                      | What it is                                                         |
| ------------------------- | ------------------------------------------------------------------ |
| `src/content.config.ts`   | **The content model.** Read this before adding anything.           |
| `src/content/`            | Projects, jobs, education — one Markdown file each.                |
| `src/pages/`              | Routes. Project pages are generated from the collection.           |
| `src/styles/tokens.css`   | The shipped palette, type scale, and motion. Use the variables.    |
| `scripts/check-links.mjs` | Post-build checks, each one a regression guard for a real old bug. |
| `.claude/skills/`         | Repeatable workflows for this repo.                                |
| `docs/CLOUDFLARE.md`      | Deploy runbook and the branch → preview-URL review loop.           |
| `docs/REBUILD-LOG.md`     | How it was run, per phase, and what it cost. Phase 7's material.   |

### Historical, not live

These directories are preserved records, not part of the site build. Don't edit them.

| Path               | What it is                                                           |
| ------------------ | -------------------------------------------------------------------- |
| `content/archive/` | 20 WordPress blog posts (2010–2019), scraped in Phase 0 with images. |
| `infra/`           | The live DNS zone, its verify tooling, and Phase 1's record.         |
| `resources/`       | The old site's stylesheet and scroll handler — the only copy.        |

The tag `v1-legacy` marks the last commit of the original PHP site. **`snapshot/`, a full crawl of
that site as it rendered, was retired to the `snapshot-pre-retirement` tag on 2026-09-21** ([#45](https://github.com/ali-wallick/Portfolio/issues/45)) —
read a page with `git show snapshot-pre-retirement:snapshot/index.html`.

## What's left

Tracked as [GitHub issues](https://github.com/ali-wallick/Portfolio/issues), with labels rather than
milestones — `decision`, `needs-ali` and `blocked` are the ones that do real work. Not in any
document: a doc that tracks status goes stale silently, and this repo has been bitten by that twice.

## License

**The code is MIT** — see [`LICENSE`](LICENSE). That covers the Astro site, the build scripts, the
checks, the skills, and the configuration, which is the part of this repo anyone would actually want
to reuse.

**The content is all rights reserved.** The project write-ups, the résumé, and the site's prose.

**Some images are neither, and no license is granted over them.** They are reproduced here because a
portfolio has to show the work it is describing:

| What                                                                               | Who holds it                                                                                                                                                             |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Game screenshots, logos, key art and app icons under `src/assets/images/projects/` | Red 5 Studios, Kaneva, MobilityWare, Second Dinner and Marvel, respectively                                                                                              |
| Images from team, jam and student projects                                         | The collaborators credited on each project page                                                                                                                          |
| `projects/kinoclue/KinoClue.png`                                                   | A Georgia Tech Synaesthetic Media Lab / GVU Center research poster, credited to Russell Brooks, Ali Wallick, Susan Robinson and Ali Mazalek, carrying Georgia Tech marks |
| `projects/dead-booty/DeadBooty.jpg`                                                | An Atari 2600 box-art parody, credited to three people and carrying Atari's marks                                                                                        |
| `projects/marvel-snap/gallery-second-dinner-2019.jpg`                              | A publicly posted studio photo, used here with permission. That permission covers this site, not redistribution                                                          |
| `projects/prodigal/screenshot2.png`                                                | A stock photograph inside an otherwise solo project’s title screen; its origin is unrecorded                                                                             |
| Photographs of Ali                                                                 | The photographers who took them, used with permission                                                                                                                    |

The reasoning, and the file-by-file inventory behind it, are in
[`docs/decisions/tooling.md`](docs/decisions/tooling.md).
