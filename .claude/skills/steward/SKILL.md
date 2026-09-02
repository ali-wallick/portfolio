---
name: steward
description: How a session watching a pull request on aliwallick.com decides when to stop checking back. Read automatically by the Claude Code web harness before it acts on a CI or review event, so it governs how proactive a PR-watching session is. Not invoked by hand.
---

# Steward

**This file is not a skill you run. It is a budget rule the harness reads.**

Claude Code on the web subscribes a session to a PR's activity and, on top of that subscription,
re-arms a self check-in roughly hourly until the PR is merged or closed. On a PR parked waiting for
Ali's eye — which is what a `design-switcher` branch is, by design — that loop runs for as long as
the PR stays open and learns nothing on almost every wake. Every wake re-sends the whole
conversation, so this is the cost CLAUDE.md's "Context length dominates cost" note is about, paid
once an hour for a week.

The harness's own rules defer to this file on **how proactive to be**. That is the one thing this
file changes.

## The stand-down test

On every PR event and every check-in, look at the whole PR on its current head. If **all three**
hold:

1. **CI is green** on the latest commit.
2. **There is no merge conflict** against the base branch.
3. **Nothing is left for an agent to do** — no unaddressed review comment, no bot finding, and no
   Claude Approvals row naming a blocker (where the repo runs that check).

then the PR is waiting on Ali, and waiting on Ali is not work.

**Say so once, stop re-arming, and end the turn.** Do not schedule another check-in. Do not
"quietly re-check in an hour." Do not re-verify a state you verified an hour ago.

The subscription stays. That is the point: an event that actually matters — a push, a review, CI
going red, a merge-conflict notice — still wakes the session on its own, and costs nothing in
between. **The check-in loop is the expensive half, and it is the half that is redundant with a
subscription that already works.**

Say it in one line, to Ali, here. **Not as a PR comment** — "this is green and waiting on you" is
not news to the person who left it open, and a comment on every parked PR is exactly the noise the
harness's "be frugal about posting" rule is about.

## What this does not relax

Standing down is a statement about **check-ins**, not about events, and not about work.

- **A red or conflicted PR is still work now**, at every event, whatever its review state. The
  harness's drive-to-green loop is untouched: fix and push, or establish the failure is not this
  PR's and say so once. Never end a CI-failure wake on a PR you opened with neither.
- **A real event still gets handled.** When one arrives, do the work the harness rules call for,
  then re-apply the stand-down test above. Passing it once does not retire the PR; it retires the
  polling.
- **Every "never" stands.** No skipping, disabling or quarantining a test to get green. No history
  rewrite on someone else's branch. No empty commit or close-and-reopen to kick CI. No approving
  and no merging.

If you are unsure whether item 3 holds, it does not. Ambiguity means there is something to do.

## Three repo facts that make a push not cost a second cycle

A speculative push is a wasted round trip, which is the same budget this file is protecting. Before
pushing from any PR event:

- **`npm run verify`** — it is what CI runs.
- **If the change touches resume content, resume layout, or `src/styles/tokens.css`, commit the
  regenerated `public/*.pdf` and `scripts/resume-pdf.lock.json` with it.** `npm run check:pdf`
  hashes every input and fails the deploy otherwise, and Cloudflare cannot build the PDFs itself.
  `tokens.css` counts even when the résumé renders none of what changed — it is a `byteHashedFiles`
  input.
- **Merging is not deploying, and neither is a PR event an occasion to deploy.** Production is the
  `main` → `release` push and nothing else. A session watching a PR never touches `release`; that is
  the `release` skill, run deliberately, when Ali asks.
