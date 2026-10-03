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
| Account                | In the dashboard URL — deliberately not committed (#109 item 6)                               |
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

**Access is the only protection now, not one of two.** The repo went public on 2026-10-03
([#378](https://github.com/ali-wallick/portfolio/issues/378)), so the obscurity above is gone:
branch names, and the preview URL every PR description computes from one, are visible to anyone.
Re-checked the same day with a bare `curl`: every branch alias, including one that has never
existed, still `302`s to Access. The one exception is `main-portfolio`, opened on purpose (next
section).

One thing worth knowing if this ever needs revisiting: the policy is **account-wide, not
per-Worker** — Cloudflare's "reusable Access policies" change (Dec 2025) made all preview URLs on
the account share a single "Cloudflare Workers Preview URLs" policy. Editing it here affects every
Worker on the account that has previews gated, not just `portfolio`.

Lower-effort, optional habit regardless: delete a branch's Worker version from the Deployments tab
once its preview has done its job, so old work-in-progress doesn't linger even behind Access.

---

## `release` is production; `master`/`main` gets its own open preview (2026-08-22, branch renamed 2026-08-23)

The default branch was renamed `master` → `main` on 2026-08-23, for no reason beyond muscle memory
on Ali's daily-work repo. Everything below that describes the Aug 22 fix is written as it happened,
against `master` — the mechanism is unchanged, only the branch name is. The Access Application's
hostname (`main-portfolio.ali-wallick.workers.dev` now) had to be updated by hand in the dashboard,
since Workers Builds' branch-to-alias mapping is automatic but the Access Application's destination
hostname is not.

Ali wanted to send friends a link to what's actually merged, without opening every branch preview to
them. The obvious-looking fix — flip on the account-only-gated `master-portfolio...` preview — doesn't
work: `master` was Workers Builds' configured **production** branch, so pushes to it went through the
`production_settings` deploy path (`wrangler deploy`, straight to production) rather than the
`previews_base_config` path (`wrangler versions upload`) that actually creates a branch alias.
`master-portfolio.ali-wallick.workers.dev` never existed — confirmed by curling it and getting
Cloudflare's own `x-preview-user-error` placeholder, not the site's real 404.

**Fix: swap which branch Workers Builds treats as production.**

- `git_repository.branch` is now `release`, not `master` — changed via
  `PATCH /accounts/{account_id}/builds/workers/{script_tag}`, same effect as the dashboard's Settings
  → Build → Branch control. Nothing is publicly routable either way yet — `workers_dev` stays `false`
  until Phase 6 — this only changes which deploy path a branch's push takes.
- `master` is now an ordinary branch as far as Workers Builds is concerned, so it gets its own
  `master-portfolio.ali-wallick.workers.dev` preview alias like every other branch, updating on every
  merge. `release` sits empty until Phase 6 — nothing has been pushed to it beyond the one commit that
  created it.
- A second Access Application, `portfolio — master preview (open)`, carries a single `public`-type
  destination for exactly `master-portfolio.ali-wallick.workers.dev` with a `bypass` policy — no
  login, open to anyone with the link. Cloudflare evaluates `public` destinations ahead of the
  account-wide `preview_worker` one, so this overrides the gate for that one hostname without loosening
  it for anything else, `release` included once it has a preview of its own.
- `scripts/build-ci.mjs`'s draft check had to move with it: `PRODUCTION_BRANCH === 'master'` became a
  `NO_DRAFT_BRANCHES` set containing both `master` and `release`. Master's preview is now something
  people actually look at, so it needs the same "no drafts" treatment a real production build gets —
  otherwise the day someone adds a sixth draft project, friends see it before Ali does.

**At launch:** merge `main` → `release`. That push is the one Workers Builds actually deploys to
production — it is step 4 of [`docs/LAUNCH.md`](LAUNCH.md). Nothing else about the launch checklist
changes.

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
WORKERS_CI_BRANCH=main       npm run build:ci   # 6 pages
WORKERS_CI_BRANCH=some-branch npm run build:ci  # 24 pages
npx wrangler deploy --dry-run                   # validates wrangler.jsonc, uploads nothing
```

---

## Dashboard settings

Workers & Pages → **Create** → **Import a repository** → `ali-wallick/portfolio`.

| Setting                              | Value                                                |
| ------------------------------------ | ---------------------------------------------------- |
| Project name                         | `portfolio`                                          |
| Build command                        | `npm run build:ci`                                   |
| Deploy command                       | `npx wrangler deploy`                                |
| Non-production branch deploy command | `npx wrangler versions upload` (the default)         |
| Builds for non-production branches   | **enabled**                                          |
| Production branch                    | ~~`master`~~ → `release` since 2026-08-22, see below |

**The build command is the one that is easy to miss** — it is marked Optional and defaults to empty,
which would deploy an unbuilt `dist/`. It must be `npm run build:ci`, not `npm run build`, or preview
deploys will silently hide draft content and the review loop stops working.

Node version comes from `.nvmrc` (22) — Cloudflare reads it automatically, so don't set
`NODE_VERSION` by hand.

### You cannot run a headless browser in a Cloudflare build

Phase 4 tried to generate the resume PDFs during the build and hit a hard wall. Recording it so
nobody spends an afternoon rediscovering it:

- The build image is **Ubuntu 24.04 with a fixed apt package list**. It has `libgbm1` but **not**
  `libatk-1.0.so.0` and the rest of Chromium's desktop dependencies. So `npx playwright install
chromium` succeeds — the download is fine — and the browser then dies at launch with
  `error while loading shared libraries: libatk-1.0.so.0`.
- **`playwright install-deps` cannot rescue it.** It's an apt install, so it needs root, and the
  builder doesn't grant any: the attempt fails with `Switching to root user to install
dependencies... Password: su: Authentication failure`.
- **GitHub Actions builds the identical commit without trouble**, because its runners ship the
  desktop libs. A green Actions run tells you nothing about whether Cloudflare can do the same
  thing.

**So the PDFs are committed in `public/`**, which Astro copies into `dist/`, and Cloudflare serves
them without a browser. `npm run build:pdf` regenerates them (locally or in Actions); `npm run
check:pdf` verifies the committed ones are current by hashing every input that can change them, and
runs in `build:ci` — so a deploy carrying a stale resume **fails instead of shipping**.

The build command stays `npm run build:ci`, and `postinstall` still installs the headless shell for
everywhere that _can_ run it. That placement is the same lesson Phase 2 learned with
`workers_dev: true` — dashboard or API state that isn't also asserted in a committed file isn't a
fix, it's a fact that happens to be true right now.

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

### The custom domain is attached — the cutover happened 2026-08-27

`aliwallick.com` is a Custom Domain on the `portfolio` Worker, and the apex is the canonical address.
This section used to say _"Do NOT add a custom domain yet"_, which was correct right up until it
wasn't; the procedure that replaced it is [`docs/LAUNCH.md`](LAUNCH.md), where attaching the domain
is step 5 of ten and the steps around it are what made it safe.

**It is declared in `wrangler.jsonc` as a route, not just in the dashboard.** Same durability
argument as `workers_dev: false` directly above it there: `wrangler deploy` reconciles the config
against deployed state, so a Custom Domain living only as dashboard state can be dropped by a later
deploy. If you are adding another hostname, add it there rather than only in the UI.

**`www` is not a Custom Domain and must not become one.** A Custom Domain matches its hostname
exactly and serves the site at it — which is the duplicate-content bug
[#193](https://github.com/ali-wallick/portfolio/issues/193) was filed about. `www` is instead a
proxied placeholder `A` record (`192.0.2.0`) plus a zone-level Single Redirect rule 301ing to the
apex with path and query preserved. `public/_redirects` cannot express it, because it matches paths
and not hosts.

---

## Managed robots.txt is kept, on purpose (2026-08-31, closes #215)

`aliwallick.com/robots.txt` is not exactly `src/pages/robots.txt.ts`'s output. Cloudflare's zone-level
**AI Crawl Control** prepends a Managed block ahead of the generated file, `Disallow`-ing nine
AI-training crawlers (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `Bytespider`,
`CCBot`, `Amazonbot`, `meta-externalagent`, `CloudflareBrowserRenderingCrawler`) and asserting a
`Content-Signal` / EU Directive 2019/790 preamble.

**Ali's call: keep it, unchanged.** These are training-data crawlers, not the ones involved when
someone asks an AI assistant about her today — that goes through ordinary search indexing
(`Googlebot`, `Bingbot`) or a live fetch, neither of which this block touches. `Allow: /` and the
sitemap line survive intact, so search discoverability is unaffected either way; what the block
actually decides is whether her writing gets ingested into a future model's training data, which she'd
rather it not.

**Not changed to git-sourced.** The more consistent-with-this-repo option — disable Cloudflare's
injection and hand-write the same crawler list into `robots.txt.ts` — was considered and declined:
it would mean maintaining a crawler list Cloudflare already maintains, for a policy that costs nothing
to leave as a zone-level default. If the crawler list or the licensing posture ever needs to be
authored in git instead of inherited from Cloudflare, that's the fallback.

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

Branch names become hostnames, so keep them short and lowercase-hyphenated. The construction is
mechanical enough to predict before Cloudflare's bot comments it onto the PR: lowercase the branch
name, replace every `/` with `-` (confirmed empirically — `claude/content-pass-92-0b6879` became
`claude-content-pass-92-0b6879-portfolio.ali-wallick.workers.dev`), then append
`-portfolio.ali-wallick.workers.dev`. Names over 63 characters get truncated with a hash appended,
and that part isn't worth predicting by hand — Cloudflare's exact truncation isn't documented, so
past that length, quote the branch name and point at the bot's own comment instead of stating a
guessed URL as fact.

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

| Symptom                            | Cause                                                                                                                 |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Deploy succeeds, site is empty     | Build command is blank. It must be `npm run build:ci`.                                                                |
| Preview shows only 6 pages         | Build command is `npm run build` instead of `npm run build:ci`, so the branch check never runs.                       |
| Production shows draft content     | `NO_DRAFT_BRANCHES` in `scripts/build-ci.mjs` doesn't include the production branch set in the dashboard (`release`). |
| No preview URL on a PR             | "Builds for non-production branches" is disabled in **Settings → Build → Branch control**.                            |
| Build fails, works locally         | Node version drift. Cloudflare reads `.nvmrc`; confirm it's committed.                                                |
| `npm ci` fails                     | `package-lock.json` out of sync. Run `npm install` and commit the lockfile.                                           |
| `/about/` and `/about` both render | `html_handling` in `wrangler.jsonc` changed away from `drop-trailing-slash`.                                          |
