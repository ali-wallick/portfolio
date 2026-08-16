# Cloudflare Pages — setup and the review loop

The point of this is not "hosting". It is the loop:

**branch → push → Cloudflare posts a preview URL → open it on a phone → react.**

That loop is what makes agentic work on a visual project actually good, and it is the thing the old
DreamHost setup could not do at all. Everything below exists to make it work.

---

## Status

- Cloudflare account: `Ali.wallick@gmail.com's Account` (`9b9fc992bf9682650c7e99ae31dfe590`)
- Pages projects: **none yet**
- GitHub ↔ Cloudflare connection: **not established**
- Repo: `ali-wallick/Portfolio` (private), default branch `master`

The first-time GitHub App installation has no API — it must be done once through the dashboard.
After that, everything else can be scripted.

---

## One-time setup

### 1. Create the project

Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.

Authorize the Cloudflare GitHub App and grant it access to `ali-wallick/Portfolio`. Grant access to
that repository only, not to all repositories.

### 2. Build settings

| Setting                | Value           |
| ---------------------- | --------------- |
| Project name           | `aliwallick`    |
| Production branch      | `master`        |
| Framework preset       | Astro           |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

Node version comes from `.nvmrc` (22) — Cloudflare reads it automatically, so don't set
`NODE_VERSION` by hand.

### 3. Environment variables — this part matters

Cloudflare has two environments, **Production** and **Preview**, and they can differ. That
difference is what makes the review loop work.

| Environment | Variable      | Value  |
| ----------- | ------------- | ------ |
| Production  | _(none)_      |        |
| **Preview** | `SHOW_DRAFTS` | `true` |

Preview and production run the identical `astro build`, so an environment variable is the only thing
that can distinguish them. With `SHOW_DRAFTS=true`, preview deploys render draft content — all 23
pages — while production renders only the 6 finished ones. Unfinished work is reviewable on a phone
without ever being reachable from `aliwallick.com`.

Verify it took: a preview deploy should build **23 pages**, production **6**.

### 4. Do NOT add a custom domain yet

`aliwallick.com` still serves the old PHP site from DreamHost, and it stays that way until **Phase
6**. Attaching the domain to this Pages project now would cut the live site over to an empty,
unstyled shell.

Preview and `*.pages.dev` URLs are all that's needed until then.

---

## Using it

Push a branch and Cloudflare builds it automatically:

```bash
git push -u origin my-branch
```

Two URLs appear:

- **Per-deploy:** `https://<commit-hash>.aliwallick.pages.dev` — pinned to one commit, good for
  comparing two versions side by side.
- **Per-branch alias:** `https://<branch-name>.aliwallick.pages.dev` — always the branch's latest
  build. This is the one to bookmark on a phone.

Branch names are slugified into the hostname, so keep them short and lowercase-hyphenated.

### Checking a deploy from the terminal

```bash
gh pr checks                       # Cloudflare reports back on the PR
```

Or via the API, once the project exists:

```
GET /accounts/9b9fc992bf9682650c7e99ae31dfe590/pages/projects/aliwallick/deployments
```

---

## Troubleshooting

| Symptom                        | Cause                                                                                                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build fails, works locally     | Node version drift. Cloudflare reads `.nvmrc`; confirm it's committed.                                                                                                     |
| Preview shows only 6 pages     | `SHOW_DRAFTS` isn't set on the **Preview** environment (easy to set it on Production by mistake).                                                                          |
| Production shows draft content | `SHOW_DRAFTS` got set on Production. Remove it.                                                                                                                            |
| `npm ci` fails                 | `package-lock.json` out of sync. Run `npm install` and commit the lockfile.                                                                                                |
| Pages 404s on `/about`         | Astro is configured `trailingSlash: 'never'` + `build.format: 'file'`, which emits `about.html`. Pages resolves that automatically; if it doesn't, the config was changed. |
| No preview built for a branch  | Preview deployments are restricted to specific branches in project settings. Default is all non-production branches.                                                       |

---

## A note on Pages vs. Workers

Cloudflare now steers new static projects toward **Workers static assets** rather than Pages, and
publishes a [migration guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/).
Pages still works, is still supported, and gives us exactly what this project needs — Git
integration, per-branch preview URLs, zero configuration for a pure static site, free.

Sticking with Pages, per the plan. Worth revisiting only if this site ever needs something Pages
can't do (Durable Objects, cron triggers, richer observability) — none of which is on the roadmap
through Phase 7. Migration is a rename-and-reconfigure, not a rewrite, so deferring costs little.
