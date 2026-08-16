# aliwallick.com

Ali Wallick's portfolio — an [Astro](https://astro.build) static site deployed to Cloudflare Pages.

Rebuilt in 2026, replacing a hand-written PHP site last touched meaningfully in 2016. If you are
an agent working in this repo, read [`CLAUDE.md`](CLAUDE.md) first — it is the standing brief and
it will save you re-deriving everything below.

## Quick start

```bash
npm install
npm run dev
```

| Command                          | What it does                                                     |
| -------------------------------- | ---------------------------------------------------------------- |
| `npm run dev`                    | Dev server at `localhost:4321`. Draft content is visible.        |
| `npm run build`                  | Production build to `dist/`. Drafts excluded.                    |
| `SHOW_DRAFTS=true npm run build` | Preview build. Drafts included — what Cloudflare previews serve. |
| `npm run verify`                 | Everything CI runs: format, types, build, link check.            |
| `npm run links`                  | Post-build link / markup checks against `dist/`.                 |

## Layout

| Path                      | What it is                                                         |
| ------------------------- | ------------------------------------------------------------------ |
| `src/content.config.ts`   | **The content model.** Read this before adding anything.           |
| `src/content/`            | Projects, jobs, education — one Markdown file each.                |
| `src/pages/`              | Routes. Project pages are generated from the collection.           |
| `src/styles/tokens.css`   | Placeholder design tokens. Phase 5 replaces the values.            |
| `scripts/check-links.mjs` | Post-build checks, each one a regression guard for a real old bug. |
| `.claude/skills/`         | Repeatable workflows for this repo.                                |
| `docs/`                   | Deploy runbook and the running record of the rebuild.              |

### Historical, not live

These directories are preserved records, not part of the site build. Don't edit them.

| Path               | What it is                                                           |
| ------------------ | -------------------------------------------------------------------- |
| `content/archive/` | 20 WordPress blog posts (2010–2019), scraped in Phase 0 with images. |
| `snapshot/`        | Full crawl of the live PHP site as it stood in August 2026.          |
| `infra/`           | Phase 1 DNS migration record: baseline, zone file, runbook.          |
| `resources/`       | Legacy assets. See `resources/images/ASSET_INVENTORY.md`.            |

The tag `v1-legacy` marks the last commit of the original PHP site.
