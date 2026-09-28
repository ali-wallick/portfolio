# aliwallick.com

Ali Wallick's portfolio: [aliwallick.com](https://aliwallick.com). An [Astro](https://astro.build)
static site with a Markdown content model, deployed to Cloudflare Workers.

It replaced a hand-written PHP site from college, last touched meaningfully in 2016. The rebuild
had two goals, and the second is why this repo is public: ship an accurate, modern portfolio, and use
the rebuild as a hands-on study of agentic workflows at small scale. The site is the small part. The
brief, the skills, the guards, the decision records and the running log are the study, and the
failures are left in. The short version is the site's own write-up:
[aliwallick.com/projects/aliwallick-com](https://aliwallick.com/projects/aliwallick-com).

**If you are an agent working here, read [`CLAUDE.md`](CLAUDE.md) first.** It is the standing brief
and it will save you re-deriving everything below.

## Quick start

```bash
npm install
npm run dev
```

Node 22 (`.nvmrc`). `npm install` also fetches a headless Chromium for the résumé PDFs; `npm run dev`
never needs it.

| Command                  | What it does                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| `npm run dev`            | Dev server at `localhost:4321`. Draft content is visible.                                      |
| `npm run build`          | Production build to `dist/`, then regenerates the résumé PDFs into `public/`. Drafts excluded. |
| `npm run build:ci`       | What Cloudflare runs. Drafts included except on `main` and `release`.                          |
| `npm run verify`         | Everything CI runs: format, types, source checks, build, the PDF and print guards, links.      |
| `npm run links:external` | Outbound link liveness. Deliberately not part of `verify`; it also runs monthly in Actions.    |

Every check under `verify` is a regression guard for a real bug the old site had, and each script's
header says which one.

## Where things are

| Path                    | What it is                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `src/content.config.ts` | **The content model.** Adding a project or a job is one Markdown file, and every fact lives once. |
| `src/content/`          | Projects, jobs, education.                                                                        |
| `src/pages/`            | Routes. Project pages are generated from the collection.                                          |
| `src/styles/tokens.css` | The palette, type scale, and motion. Use the variables.                                           |
| `scripts/`              | The build and the guards. `check-links.mjs` is the post-build sweep over `dist/`.                 |
| `.claude/skills/`       | Repeatable workflows: add a project, write in Ali's voice, run a design comparison, release.      |
| `.claude/hooks/`        | Refuses edits to the preserved old site; formats every file a session writes.                     |
| `CLAUDE.md`             | The brief: what was decided, so a session starts informed.                                        |
| `docs/decisions/`       | Why each decision was made, in four records by domain.                                            |
| `docs/REBUILD-LOG.md`   | How each pass was run, what it cost, and what went wrong. The write-up's source material.         |
| `docs/CLOUDFLARE.md`    | Deploy runbook and the branch → preview-URL review loop.                                          |
| `docs/before-after/`    | Paired screenshots of the old site and the new one.                                               |

### Historical, not live

Preserved records of the old site and of Phase 1's infrastructure work. They are not part of the
build, and a hook refuses edits to them.

| Path                              | What it is                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| `content/archive/`                | 20 blog posts (2010–2019) scraped to Markdown with their images. The only copy.    |
| `infra/`                          | The DNS zone as captured, the verify tooling, and Phase 1's record.                |
| `resources/css/`, `resources/js/` | The old site's stylesheet and scroll handler. The only copy; its motion was mined. |
| `resources/WallickAli-Resume.pdf` | The 2019 résumé, kept deliberately, with its mailing address removed.              |

Some of the record lives on tags rather than in the tree:

| Tag                       | What it holds                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `v1-legacy`               | The last commit of the original PHP site.                                                                                     |
| `assets-pre-cleanup`      | The old site's images, before the unused ones were deleted. `git show assets-pre-cleanup:resources/images/ASSET_INVENTORY.md` |
| `launch-2026-08-27`       | The commit that was live when the domain moved.                                                                               |
| `snapshot-pre-retirement` | A full crawl of the old site as it rendered, plus a browsable copy. `git show snapshot-pre-retirement:snapshot/index.html`    |

The history was rewritten on 2026-09-18 to remove old résumé files carrying a home address;
[`docs/HISTORY-REWRITE.md`](docs/HISTORY-REWRITE.md) is the record.

## What's left

Tracked as [issues](https://github.com/ali-wallick/portfolio/issues), with labels rather than
milestones: `decision`, `needs-ali` and `blocked` are the ones that do real work. Nothing is tracked
in a document, because a document that tracks status goes stale silently, and this repo was bitten
by that twice.

This is a personal site, so it is not taking contributions. Issues are open for anything that is
wrong, and the tooling is MIT if any of it is useful to you.

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
