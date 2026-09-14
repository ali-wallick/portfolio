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

This is a shared working directory — another session or Ali herself can commit, push, or check out
a different branch while you're mid-sweep. If a later command shows something the survey didn't (a
branch with commits you didn't expect, a "clean" worktree that's now dirty), re-check rather than
trusting the first snapshot for the rest of the sweep. Nothing in this skill needs the repo to hold
still; it just needs you to notice when it hasn't.

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
  merge strategy breaks ancestry, so git can't see it). **Verify before deleting** — but do it
  per-file, not as one whole-tree diff. Two failure modes were found running this skill for real,
  in opposite directions, and both are avoided by the same fix:

  ```bash
  base=$(git merge-base <branch> main)
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    n=$(git diff <merge-commit> <branch> -- "$f" | wc -l)
    [ "$n" != "0" ] && echo "DIFFERS: $f"
  done < <(git diff --name-only "$base" <branch>)
  ```

  - **A whole-tree `git diff <branch> <merge-commit> -- .` gives false positives for "not merged."**
    If other commits landed in `main` between when the branch was cut and when it merged, the merge
    commit's tree is bigger than the branch's for reasons that have nothing to do with this PR —
    `CLAUDE.md` and `docs/REBUILD-LOG.md` grow constantly, resume PDFs and
    `scripts/resume-pdf.lock.json` regenerate on unrelated changes, `package-lock.json` picks up
    dependency bumps. A diff over the whole tree lights up all of it and reads like the PR never
    landed when it did. **Diff only the files the branch itself touched** (the loop above), and
    treat a differing shared file as a false alarm if the branch's own feature files (components,
    scripts, content) come back clean — check those first.
  - **Passing multiple filenames to one `git diff ... -- $files` call gives false negatives.** If
    `$files` is a multi-line command-substitution result used unquoted, shell word-splitting does
    not reliably break it into separate pathspecs — it can collapse to one argument containing
    embedded newlines, which git treats as a pathspec that matches nothing and returns an empty,
    zero-exit-status diff. That reads as "identical," silently, for every file in the batch. This
    produced a confident wrong answer for every single branch in one pass before it was caught.
    **Loop one file at a time** (as above); never build a multi-path `--` argument from an unquoted
    variable.
  - **A branch's PR title and its merge commit's title can differ completely** — worded during
    review, not just reformatted. Don't rule out a candidate merge commit on title mismatch; find it
    by issue number (`git log main --oneline | grep '#NNN'`) and confirm by content, not by title.
  - If the merge commit is a pure superset of the branch (every differing line is an addition, none
    removed or changed), that still counts as landed — it usually means more commits were pushed to
    the remote branch after your local copy was last fetched, before it merged.

  Only once the branch's own files check out clean should you force-delete with `git branch -D`.
  Never force-delete on the strength of `: gone` alone — a branch can lose its upstream without its
  work having landed anywhere (an abandoned/rejected PR looks identical to a merged one at the
  `: gone` stage; only the diff tells them apart).

- **Not merged, upstream still live, or the branch's own files still differ** — leave it. Report it
  as active/unclear rather than guessing. "Still live" is a timing fact, not a permanent one — a
  branch can merge and get pruned between one sweep and the next, so re-check rather than assuming
  an earlier "leave it" still holds.

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
