---
name: release
description: Ship the latest main to production on aliwallick.com by fast-forwarding the release branch, which is the push Cloudflare Workers Builds actually deploys. Use when the user asks to release, ship, deploy, or publish the site, says "push this live" or "release main", or wants what's merged to main to go out to production. Merging a PR to main does not deploy by itself — see docs/CLOUDFLARE.md's "release is production" section.
---

# Release

Routine production deploys, not the one-time DNS cutover. That was `docs/LAUNCH.md`, executed
2026-08-27 and kept only as a record — don't follow it for this. This skill is the repeatable half
of what it left behind: **`main` → `release` is the production deploy**, per CLAUDE.md's "Merging to
`main` does not deploy. `release` does." Nothing about DNS, mail, or the domain is touched here.

**This skill's record is `docs/CLOUDFLARE.md`, not `docs/decisions/tooling.md`** — unusually, and
worth stating so nobody re-files it. CLAUDE.md's skill table routes `release` to the tooling
record, but the reasoning a release actually needs is not there: the mechanism is CLOUDFLARE.md's
"release is production", and "Deployed state drifts from the repo, and it has now happened three
times" — the failure the preconditions below exist to catch — is a section of `CLAUDE.md`, which
every session has already read. tooling.md carries one relevant section, the Phase 6 gate that
made the cutover its own moment rather than the end of a phase.

## What actually happens

Workers Builds is configured with `release` as its production branch (`docs/CLOUDFLARE.md`, "release
is production"). A push to `release` takes the `wrangler deploy` path straight to
`aliwallick.com`; a push to `main` only takes the preview path (`wrangler versions upload`), which is
why "merged" and "deployed" are different words in this repo. Since `release` only ever needs to
be caught up to `main` — nobody commits to it directly — releasing is a **fast-forward**, not a
merge commit.

## 1. Preconditions

```bash
git fetch origin main release --prune
git log origin/release..origin/main --oneline   # what this release will ship
git merge-base --is-ancestor origin/release origin/main && echo "clean fast-forward" || echo "DIVERGED — stop"
```

- **If the second command prints nothing**, `release` is already caught up — say so and stop; there
  is nothing to ship.
- **If the ancestor check fails**, `release` carries a commit `main` doesn't (someone pushed to it
  directly, which shouldn't happen). Don't force anything — surface the divergent commit and ask
  before proceeding. A force-push to `release` is a production rollback and needs a human call.
  Since 2026-10-03 a ruleset refuses one anyway (non-fast-forward and deletion, on `main` and
  `release`), so a rollback means Ali turns the ruleset off first. A revert commit on `main`,
  released normally, needs neither.
- **Confirm CI is green on `main`'s current tip** before shipping it. `ci.yml` runs on push to
  `main` too, not just on the PR — check the workflow run for `origin/main`'s HEAD sha
  (`mcp__github__actions_list`, `method: list_workflow_runs`, `branch: main`, or
  `gh run list --branch main` if using the CLI) and wait for `conclusion: success` rather than
  shipping on `in_progress`. A commit that merged via a required-checks PR already passed CI once;
  this is a second, cheap check that nothing broke on `main` itself (e.g. a bad merge of two
  individually-fine PRs).
- Check `git status` — an unrelated dirty working tree isn't a blocker for a fast-forward push (it
  doesn't touch the working tree), but note it rather than ignoring it.

## 2. Ship it

Fast-forward `release` to `main`'s tip and push, without needing a local checkout of `release`:

```bash
git push origin origin/main:release
```

This only succeeds if it's a fast-forward — Git itself refuses otherwise, which is the real
safety net for the divergence case above. If you already have a local `release` branch checked out
or tracked, `git switch release && git merge --ff-only origin/main && git push origin release` is
equivalent; the one-liner above is preferred because it can't leave a stale local branch behind.

## 3. Confirm it shipped

**This sandbox's egress proxy denies `CONNECT` to `aliwallick.com`, `*.workers.dev`, and
`api.cloudflare.com` outright (policy denial, confirmed via `curl -sS "$HTTPS_PROXY/__agentproxy/status"`
showing `connect_rejected` for all three) — not a flaky network, a closed one.** So this skill cannot
curl the live site or Cloudflare's API to prove the deploy landed, the way `docs/LAUNCH.md` step 4
does from a machine with normal internet access. Don't burn time retrying those hosts from here or
concluding the deploy failed because a curl to them failed — that failure is this environment, not
Cloudflare.

What you _can_ confirm from here:

- **The push succeeded** — `git push` above returned the new SHA for `release` with no rejection.
  Confirm with `git log -1 origin/release` (after a fresh `git fetch origin release`) matching the
  `main` tip you shipped.
- That's the actual guarantee this skill can make in this environment: the code that will be
  deployed is now on the branch Cloudflare deploys from. Whether the build itself went green is
  Cloudflare's own build log, which needs the dashboard or a session with unblocked network.

**Hand off the rest.** Tell whoever asked for the release: the push landed, and either they check
`aliwallick.com` themselves (it should reflect the new commit within a couple minutes — Cloudflare
builds are quick for a static site) or a session with real internet access verifies it the way
`docs/LAUNCH.md` step 4 describes — confirming a new _deployment_ exists (a version with a fresh
timestamp), not just that a build log says success. Don't claim "deployed and verified live" from
inside this sandbox; claim "pushed to `release`" and say what's still unverified.

## Report

State plainly: how many commits shipped (the `git log origin/release..origin/main` count from step
1), the SHA `release` now points at, and whether live verification happened or is still owed.
