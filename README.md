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
| `snapshot/`        | Full crawl of the live PHP site as it stood in August 2026.          |
| `infra/`           | The live DNS zone, its verify tooling, and Phase 1's record.         |
| `resources/`       | The old site's stylesheet and scroll handler — the only copy.        |

The tag `v1-legacy` marks the last commit of the original PHP site.

## What's left

Tracked as [GitHub issues](https://github.com/ali-wallick/Portfolio/issues), milestoned per phase —
[Phase 6 — Launch](https://github.com/ali-wallick/Portfolio/milestone/1) and
[Phase 7 — Keep it alive](https://github.com/ali-wallick/Portfolio/milestone/2). Not in any document:
a doc that tracks status goes stale silently, and this repo has been bitten by that twice.
