# Cloudflare deploys and the review loop

The point of this is not "hosting". It is the loop:

**branch → push → Cloudflare posts a preview URL → open it on a phone → react.**

That loop is what makes agentic work on a visual project actually good, and it is the thing the old
DreamHost setup could not do at all. Everything below exists to make it work.

---

## Workers, not Pages

The plan originally settled on **Cloudflare Pages**. It landed on **Workers static assets** instead,
decided at the dashboard in Phase 2 when Cloudflare routed the "connect a Git repo" flow to Workers.

That is Cloudflare's direction of travel, not a stray click: Pages is no longer getting new features
and their docs point new static projects at
[Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/).
Everything this project needs is present, and one thing is genuinely better:

| Need                             | Workers                                                                   |
| -------------------------------- | ------------------------------------------------------------------------- |
| Git integration, push to deploy  | Yes                                                                       |
| Per-branch preview URL           | Yes — `<branch>-portfolio.<subdomain>.workers.dev`, stable across commits |
| Preview link commented on the PR | Yes                                                                       |
| `.nvmrc` respected               | Yes                                                                       |
| `_redirects` / `_headers`        | Yes, natively — Phase 6's redirect map depends on this                    |
| Drafts on preview only           | Yes, and the rule lives in the repo rather than in the dashboard          |

That last row is the improvement. On Pages this would have been a `SHOW_DRAFTS` environment variable
set on the Preview environment — dashboard state, invisible from a checkout, silently wrong if
someone set it on the wrong environment. Workers Builds injects `WORKERS_CI_BRANCH` instead, so
[`scripts/build-ci.mjs`](../scripts/build-ci.mjs) makes the decision in committed, reviewable code
that behaves identically when run locally.

---

## What's in the repo

| File                   | Why                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `wrangler.jsonc`       | Static-asset-only Worker. No `main`, no server code. Sets `preview_urls`, trailing-slash handling, and the 404 page. |
| `scripts/build-ci.mjs` | The build Cloudflare runs. Production branch → no drafts. Anything else → drafts visible.                            |

Verify the split locally, without deploying anything:

```bash
WORKERS_CI_BRANCH=master     npm run build:ci   # 6 pages
WORKERS_CI_BRANCH=some-branch npm run build:ci  # 24 pages
npx wrangler deploy --dry-run                   # validates wrangler.jsonc, uploads nothing
```

---

## Dashboard settings

Workers & Pages → **Create** → **Import a repository** → `ali-wallick/Portfolio`.

| Setting                              | Value                                        |
| ------------------------------------ | -------------------------------------------- |
| Project name                         | `portfolio`                                  |
| Build command                        | `npm run build:ci`                           |
| Deploy command                       | `npx wrangler deploy`                        |
| Non-production branch deploy command | `npx wrangler versions upload` (the default) |
| Builds for non-production branches   | **enabled**                                  |
| Production branch                    | `master`                                     |

**The build command is the one that is easy to miss** — it is marked Optional and defaults to empty,
which would deploy an unbuilt `dist/`. It must be `npm run build:ci`, not `npm run build`, or preview
deploys will silently hide draft content and the review loop stops working.

Node version comes from `.nvmrc` (22) — Cloudflare reads it automatically, so don't set
`NODE_VERSION` by hand.

### Do NOT add a custom domain yet

`aliwallick.com` still serves the old PHP site from DreamHost, and it stays that way until **Phase
6**. Attaching the domain now would cut the live site over to an unstyled shell.

`*.workers.dev` URLs are all that's needed until then.

---

## Using it

```bash
git push -u origin my-branch
```

Two URLs get commented onto the pull request:

- **Commit preview**: `<version-prefix>-portfolio.<subdomain>.workers.dev` — pinned to one version,
  good for comparing two states side by side.
- **Branch preview**: `<branch-name>-portfolio.<subdomain>.workers.dev` — always the branch's latest
  build. This is the one to bookmark on a phone.

Branch names become hostnames, so keep them short and lowercase-hyphenated. Names over 63 characters
get truncated with a hash appended.

---

## Troubleshooting

| Symptom                            | Cause                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Deploy succeeds, site is empty     | Build command is blank. It must be `npm run build:ci`.                                                  |
| Preview shows only 6 pages         | Build command is `npm run build` instead of `npm run build:ci`, so the branch check never runs.         |
| Production shows draft content     | `PRODUCTION_BRANCH` in `scripts/build-ci.mjs` doesn't match the production branch set in the dashboard. |
| No preview URL on a PR             | "Builds for non-production branches" is disabled in **Settings → Build → Branch control**.              |
| Build fails, works locally         | Node version drift. Cloudflare reads `.nvmrc`; confirm it's committed.                                  |
| `npm ci` fails                     | `package-lock.json` out of sync. Run `npm install` and commit the lockfile.                             |
| `/about/` and `/about` both render | `html_handling` in `wrangler.jsonc` changed away from `drop-trailing-slash`.                            |
