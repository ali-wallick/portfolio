# Cloudflare deploys and the review loop

The point of this is not "hosting". It is the loop:

**branch → push → Cloudflare posts a preview URL → open it on a phone → react.**

That loop is what makes agentic work on a visual project actually good, and it is the thing the old
DreamHost setup could not do at all. Everything below exists to make it work.

---

## Live as of 2026-08-16

| Thing                  | Value                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Worker                 | `portfolio`                                                                                   |
| Account                | `9b9fc992bf9682650c7e99ae31dfe590`                                                            |
| workers.dev subdomain  | `ali-wallick`                                                                                 |
| Branch preview URL     | `https://<branch>-portfolio.ali-wallick.workers.dev`                                          |
| Production workers.dev | **deliberately disabled** — nothing serves this site at a stable public address until Phase 6 |

---

## Preview URLs live forever unless you gate or delete them

Surfaced 2026-08-16, mid Phase 3, not tied to any phase's content. Two facts from Cloudflare's own
docs that are easy to assume away:

1. **Nothing deletes a preview URL when its branch is deleted or merged.** Preview URLs are versions
   of the Worker, not artifacts of the git branch — Cloudflare's only automatic cleanup is evicting
   the oldest alias once you pass **1,000** simultaneously live ones. This project will never get
   near that, so in practice every branch ever pushed stays reachable indefinitely.
2. **They are public by default**, per Cloudflare's docs: "When enabled, Preview URLs are available
   publicly." No login wall unless one is added.

What's actually protecting anything today is **obscurity, not access control**: the repo is private,
so branch names don't leak through GitHub, and the URL pattern
(`<branch>-portfolio.ali-wallick.workers.dev`) isn't linked from anywhere public. But it's guessable
and not secret, and the site sets `noindex` only on individual draft _project_ pages — there's no
site-wide `noindex` for preview builds as a whole.

**The fix is Cloudflare Access on the Worker's preview URLs** — free, one dashboard toggle, gates
every `*.workers.dev` preview behind a login. It's what Cloudflare's own docs recommend for exactly
this. Until it's enabled, treat every preview URL as something a determined stranger could eventually
find, not as something that expires.

**Done, 2026-08-17.** Cloudflare Access is enabled on Preview URLs (Settings → Access, "Previews
only" scope), with the built-in **Cloudflare account** policy — the dashboard's own description is
the exact scope wanted: "Only members of this Cloudflare account can reach this Worker." For a
one-person account that's Ali and no one else. Verified with a bare `curl` against a live preview
URL: an unauthenticated request now gets a `302` to `<team>.cloudflareaccess.com` before it ever
reaches the Worker, instead of the `200` it returned before.

One thing worth knowing if this ever needs revisiting: the policy is **account-wide, not
per-Worker** — Cloudflare's "reusable Access policies" change (Dec 2025) made all preview URLs on
the account share a single "Cloudflare Workers Preview URLs" policy. Editing it here affects every
Worker on the account that has previews gated, not just `portfolio`.

Lower-effort, optional habit regardless: delete a branch's Worker version from the Deployments tab
once its preview has done its job, so old work-in-progress doesn't linger even behind Access.

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

### Production builds fail until Phase 2 merges

Expected, and not a misconfiguration. The production trigger builds `master`, and until the Phase 2
branch lands, `master` is still the old PHP site — no `package.json`, so `npm run build:ci` exits
with `ENOENT` about six seconds in:

```
Executing user build command: npm run build:ci
npm error path /opt/buildhome/repo/package.json
npm error enoent Could not read package.json
```

Non-production branch builds work fine in the meantime, which is the half that matters for the
review loop. The production build goes green on the merge commit.

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

### `portfolio.<subdomain>.workers.dev` is publicly reachable

It must not be, until Phase 6. If it's serving content:

1. Confirm `wrangler.jsonc` has `"workers_dev": false` at the top level. If it's missing, this is
   why — `wrangler deploy` defaults `workers_dev` to `true` whenever the config doesn't say
   otherwise, **every time it runs**, silently re-enabling public access on each `master` deploy even
   after someone disabled it by hand. Confirmed happening on the very first post-merge production
   deploy: the dashboard-level disable from the Phase 2 setup was undone within minutes by the next
   `wrangler deploy`.
2. If the config already says `workers_dev: false` and it's still on, disable it directly and treat
   the next `master` deploy as the real fix-verification:
   ```
   POST /accounts/{account_id}/workers/scripts/portfolio/subdomain
        { "enabled": false, "previews_enabled": true }
   ```

### Preview URL shows "There is nothing here yet"

That is Cloudflare's placeholder, not this site's 404 page, and it means preview URL serving is
switched off at the Worker level — even though the build succeeded and the alias exists.

`preview_urls: true` in `wrangler.jsonc` only takes effect on a successful `wrangler deploy`, and
production deploys fail until Phase 2 merges. So on a freshly dashboard-created Worker the setting
starts off and nothing in the repo can turn it on yet. Check and fix:

```
GET  /accounts/{account_id}/workers/scripts/portfolio/subdomain
POST /accounts/{account_id}/workers/scripts/portfolio/subdomain
     { "enabled": false, "previews_enabled": true }
```

Keep `enabled` at `false` — that one is the _production_ workers.dev URL, which must not serve this
site until Phase 6. `previews_enabled` is the one the review loop needs.

### Everything else

| Symptom                            | Cause                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Deploy succeeds, site is empty     | Build command is blank. It must be `npm run build:ci`.                                                  |
| Preview shows only 6 pages         | Build command is `npm run build` instead of `npm run build:ci`, so the branch check never runs.         |
| Production shows draft content     | `PRODUCTION_BRANCH` in `scripts/build-ci.mjs` doesn't match the production branch set in the dashboard. |
| No preview URL on a PR             | "Builds for non-production branches" is disabled in **Settings → Build → Branch control**.              |
| Build fails, works locally         | Node version drift. Cloudflare reads `.nvmrc`; confirm it's committed.                                  |
| `npm ci` fails                     | `package-lock.json` out of sync. Run `npm install` and commit the lockfile.                             |
| `/about/` and `/about` both render | `html_handling` in `wrangler.jsonc` changed away from `drop-trailing-slash`.                            |
