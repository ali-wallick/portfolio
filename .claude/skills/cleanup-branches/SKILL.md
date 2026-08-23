---
name: cleanup-branches
description: Clean up stale local git branches and worktrees on aliwallick.com. Use when the user asks to clean up branches, tidy worktrees, "clean up local branches / worktrees that are stale", or prune merged/dead branches from the repo.
---

# Cleanup branches and worktrees

A sweep over local git state only — never touches `origin`, GitHub, or DNS. Work through every
section and report what you found before deleting anything irreversible.

## 1. Survey

```bash
git worktree list
git branch -vv
git branch --show-current
```

Note which branch is currently checked out (never delete it — git will refuse anyway, but call it
out rather than silently skipping) and which branches have a worktree attached.

## 2. Sync remote-tracking state

```bash
git fetch --prune origin
git branch -vv
```

`--prune` clears remote-tracking refs for branches deleted on GitHub (merged PRs routinely delete
their branch). After this, `git branch -vv` marks branches whose upstream is gone as `: gone`.

## 3. Classify every non-main branch

For each local branch other than `main`:

- **`git branch --merged main`** — cleanly merged by ancestry. Safe to delete with `git branch -d`.
- **Upstream shows `: gone` but not in `--merged`** — likely squash-merged (GitHub's default PR
  merge strategy breaks ancestry, so git can't see it). **Verify before deleting**: diff the branch
  against the main commit that looks like its merge —

  ```bash
  git diff <branch> <suspected-merge-commit> -- .
  ```

  An empty diff confirms the content is fully in `main`. Only then force-delete with `git branch -D`.
  Never force-delete on the strength of `: gone` alone — a branch can lose its upstream without its
  work having landed anywhere.

- **Not merged, upstream still live, or diff is non-empty** — leave it. Report it as active/unclear
  rather than guessing.

## 4. Worktrees

For each worktree besides the main one:

```bash
git -C <worktree-path> status
```

A worktree is safe to remove with `git worktree remove <path>` only if its status is clean (no
uncommitted or untracked changes) and its branch/commit is one already classified as safe to delete
in step 3, or the worktree is in detached HEAD at a commit that's already an ancestor of `main`.
**A dirty worktree is in-progress work — leave it and tell the user**, don't stash or discard it
yourself.

Removing a worktree does not delete its branch and vice versa; do both if both are stale.

## 5. Deleting

- `git branch -d` for ancestry-merged branches — git itself refuses if it isn't actually merged, so
  this is low-risk.
- `git branch -D` for confirmed-by-diff squash-merged branches — this is a force-delete and the auto
  mode classifier may block it even after verification; if so, surface the exact command and the
  diff evidence to the user and ask them to approve it rather than working around the block.
- Never delete `main`, the currently checked-out branch, or anything that didn't clear step 3's
  verification.

## Report

List what was removed (worktrees and branches, with the evidence for each squash-merged one) and
what was left alone and why. End with `git worktree list` and `git branch -vv` so the user can see
the final state in one glance.
