# Rewriting history to purge the résumé address

The runbook for [#109](https://github.com/ali-wallick/Portfolio/issues/109) item 3. **Ali runs this,
not an agent** — it needs a full clone and force-push rights on every ref, and it lands a
production deploy as a side effect. Prepared 2026-09-09, commands added 2026-09-10, rehearsed
end-to-end on a mirror 2026-09-11 (which found six more blobs and four broken steps — see
"The list was declared complete at four" in [`docs/decisions/tooling.md`](decisions/tooling.md)),
and again on a mirror cloned from GitHub 2026-09-13, which corrected three expected counts (see
"The rehearsal's counts came from a mirror without pull-request refs" in the same record). Read
once more later that day against the live repo, which found the counts already two merges stale
and #200 closed — see "Read again the same day" under that heading. Reviewed once more on
2026-09-14 against the live repo, which corrected two expectations that would have stopped the run
for no reason: the enumeration check in step 1 lists 8 of the 10 (the pattern cannot see the
`.webp` captures), and the ref sweep in step 2 now prints the three tags and no branches.

Same relationship to #109 that `LAUNCH.md` has to #34: **the issue holds the decision and the
ordering, this holds the procedure.** Nothing here restates the checklist — read #109 first.

**What this does not do, on purpose.** After the force-push the old commits are still reachable
through `refs/pull/N/head` — server-side refs a push does not touch and you cannot delete. Closing
that is a GitHub Support request, and it is deliberately **not** a step here:
[#367](https://github.com/ali-wallick/Portfolio/issues/367) carries it, because it costs the diff
view on every pull request in the repo, and Support acts only after the refs are clean. It was
also gated on [#200](https://github.com/ali-wallick/Portfolio/issues/200) — which closed on
2026-09-11 with every archive.org capture gone, so that gate is open and #367 is the step after
this one. A clean run of everything below still leaves the blobs retrievable by anyone who can
read the repo and knows a SHA. While the repo is private with no forks, that is you.

Every command below is meant to be pasted as-is. **Expectations are written as invariants where
they can be** — exactly one commit pruned, `main` exactly one shorter — because every merge to
`main` moves the absolute counts, and an operator reading "270" beside a terminal saying "273" is
in exactly the guessing moment the 2026-09-13 record describes. Where an absolute number is still
quoted, it was measured on 2026-09-13 against `main` at `283d69c` — **re-measure rather than
trusting it**, since each figure has a command beside it.

---

## 0. Preflight

```bash
# Tooling. filter-repo is not bundled with git.
brew install git-filter-repo
git filter-repo --version

# Somewhere to work, outside the everyday checkout.
mkdir -p ~/portfolio-rewrite && cd ~/portfolio-rewrite
```

Five preconditions, each checkable:

```bash
# a. #360 and #45 are merged, so HEAD carries none of the denylisted blobs.
cd /path/to/your/Portfolio && npm run check:blobs
#    Expect: ✓ ... none matches a known-bad preserved blob.

# b. The repo is still private and has no forks. Once public, any clone keeps
#    the rewritten-away history forever. This is the only clean window.
gh repo view ali-wallick/Portfolio --json isPrivate,forkCount
#    Expect: {"forkCount":0,"isPrivate":true}

# c. You are on a full clone, not a shallow one.
git rev-list --count HEAD   # a few hundred (273 on 2026-09-13); a shallow clone says far fewer
test -f .git/shallow && echo "SHALLOW — run: git fetch --unshallow" || echo "full clone"

# d. release is at main. The force-push in step 6 deploys whatever release's
#    rewritten tree is, and the rewrite DELETES files from any tree still
#    carrying a bad blob. On 2026-09-11 release was 8 commits behind main and
#    still carried three — so the push would have shipped a tree no commit had
#    ever had. It was 14 behind again on 2026-09-13, and 1 behind on
#    2026-09-14 — though by then its tip was past #360 and carried nothing.
#    Run the release skill first; then the deploy is a no-op. Expect this to
#    be the check that fails.
git fetch origin main release && git rev-list --count origin/release..origin/main
#    Expect: 0

# e. No open pull request has a head among the branches step 4 deletes.
#    Deleting a PR's branch closes the PR. Merge or close them first.
gh pr list --state open --json number,headRefName
#    Expect: [] — or only PRs whose head is main.
```

---

## 1. The ten blobs

Found by hashing **every** blob reachable from every ref (2,791 of them in a mirror from GitHub,
whose `refs/pull/*` carry every squash-merged branch; about 2,000 in the everyday checkout) and
matching content against the denylist in `scripts/check-preserved-blobs.mjs` — content, not paths,
for the reason #360 settled. Ten match, one per denylist entry.

**Until 2026-09-11 this section said four, and the rewrite would have made things worse.** The
denylist was built from what had leaked into `HEAD`, which was all 2019 material, and nobody had
looked at the same two paths _before_ 2019. The 2016 résumé sat there in three revisions, with a
1700×2200 render of each, and it carries a **full street address and a phone number** — the worse
exposure, not the PO Box. `--strip-blobs-with-ids` does not delete a path; it drops that commit's
change to it, so the file reverts to whatever the parent had. Stripping only the 2019 PDF from
`b541155` therefore reverts `v1-legacy`'s résumé to the 2016 one, promoting the street address into
the very tag the rewrite was meant to clean. The rehearsal caught it in the post-rewrite tree
listing.

| Blob id                                    | What it is                          | Path it lived at                                                    |
| ------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------- |
| `140fb71f1630a57e6a376e639a6c8f96596b4f1a` | the unredacted 2019 résumé PDF      | `resources/WallickAli-Resume.pdf`                                   |
| `f485f41eae07a1e2f3f8319d267e3765a1898719` | a 1700×2200 render of it            | `snapshot/rendered/resources/images/resume.png` and two other paths |
| `f018f54e110239b01e6dd7da99c647ac123e0c08` | the desktop before/after capture    | `docs/before-after/old/resume-desktop.webp`                         |
| `f680cb1cda500fbf17caacfe9c4469a58f048dae` | the mobile before/after capture     | `docs/before-after/old/resume-mobile.webp`                          |
| `06575397a096bb39d102794e5ff7608fecfb9adb` | the January 2016 résumé PDF         | `resources/WallickAli-Resume.pdf`                                   |
| `d8b48c5fa0e2208e32f347ba64cd164db6352c1a` | the April 2016 "New job" revision   | `resources/WallickAli-Resume.pdf`                                   |
| `83c7c180fce007cd03a49dba330e8f117be5316d` | the April 2016 "typo" revision      | `resources/WallickAli-Resume.pdf`                                   |
| `7be7e40b3a93ed5c371a96b4601613deffc5262e` | a render of the January 2016 résumé | `images/resume.png`, then `resources/images/resume.png`             |
| `a63c034852d90ea3337e0a97e3365a7a8bd2d9c5` | a render of the "New job" revision  | `resources/images/resume.png`                                       |
| `2afc5aeb96c9e37ef7ff71f75b48cc54f55962e3` | a render of the "typo" revision     | `resources/images/resume.png`                                       |

**One blob, several paths — the whole argument for keying on blob id.** `f485f41` is byte-identical
wherever it appeared, so git stores it once and one entry kills every path those bytes ever landed
at, including any nobody has thought of.

**Regenerate the list rather than trusting the table.** Run this in the full clone:

```bash
git rev-list --objects --all \
  | git cat-file --batch-check='%(objecttype) %(objectname) %(rest)' \
  | awk '$1=="blob"{print $2}' | sort -u \
  | while read -r oid; do
      h=$(git cat-file blob "$oid" | sha256sum | cut -d' ' -f1)
      grep -q "$h" scripts/check-preserved-blobs.mjs && echo "$oid"
    done | tee ~/portfolio-rewrite/strip-blobs.txt

wc -l ~/portfolio-rewrite/strip-blobs.txt    # expect 10
```

Takes about a minute in the everyday checkout (it hashes every blob in history, one `git cat-file`
each). If it returns anything other than 10, **stop** — either the denylist changed or a new copy
exists, and both mean re-reading #360 before continuing.

**One more check the list cannot do for you.** The denylist is exact hashes, and the reason it was
short was a class of file nobody had enumerated. Before trusting the count, list every revision the
two résumé paths ever had and confirm each is either on the list or the redacted one:

```bash
git rev-list --all | while read -r c; do
  git ls-tree -r "$c" 2>/dev/null | grep -iE 'resume\.(pdf|png)$|WallickAli-Resume'
done | awk '{print $3, $4}' | sort -u | grep -v '^[0-9a-f]* public/'
#    Expect: 8 of the 10 above — the two .webp captures are outside this
#    pattern, by design — plus 2464090d (the redacted PDF, at two paths) and
#    a63895b4 (the redacted render). Anything else is a revision nobody checked.
```

---

## 2. What still carries them

Measured 2026-09-11, re-measured 2026-09-13. `main` is clean; everything below is not.

```bash
# Every ref whose TIP tree still carries a bad blob. The loop reads the
# checkout's remote-tracking refs, so fetch first or it misses any branch
# pushed since the last fetch.
git fetch origin
for r in $(git for-each-ref --format='%(refname)' refs/remotes/origin refs/tags); do
  while read -r oid; do
    git ls-tree -r "$r" 2>/dev/null | grep -q "$oid" && { echo "$r"; break; }
  done < ~/portfolio-rewrite/strip-blobs.txt
done | sort -u
```

Expect 3 tags — `v1-legacy`, `assets-pre-cleanup`, `launch-2026-08-27` — plus any branch whose
tip predates #360. On 2026-09-11 that was ~8 branches including `release`; on 2026-09-14 it was
none, `release` having been fast-forwarded past #360 in between. The 2016 blobs add nothing here:
they live only in 2016 commits, which every branch's ancestry reaches but no tip tree carries.

**Do not hardcode the stale-branch list.** It drifted between 2026-09-09 and 2026-09-10 (a new
Dependabot branch appeared), which is the same staleness lesson #45 taught. Compute it:

```bash
git ls-remote --heads origin | awk '{print $2}' | sed 's|refs/heads/||' \
  | grep -vE '^(main|release)$'
```

**`filter-repo` re-points tags automatically**, which is why `restore-snapshot.mjs` names the asset
commit as `assets-pre-cleanup` instead of a SHA — after this it needs no follow-up edit.

---

## 3. Consequence to accept before starting

**`v1-legacy` stops being a byte-complete capture of the old site.** Every revision of
`resources/WallickAli-Resume.pdf` and `resources/images/resume.png` is on the list, so the rewrite
removes both paths from that tag's tree outright — 185 files become 183. The 31 `.php` files, the
old `.htaccess` and the stylesheets are untouched — see `docs/PRESERVATION.md`. If that trade is not
acceptable, stop and reopen #109; it is not reversible after the force-push.

```bash
# See exactly what v1-legacy loses.
git ls-tree -r v1-legacy --name-only | wc -l                          # 185 before
git ls-tree -r v1-legacy --name-only | grep -iE 'resume\.(pdf|png)$'  # both paths; -i, the PDF is capitalised
```

`launch-2026-08-27` loses three files — the two before/after captures and the snapshot render.
`release` loses the same three if its tip is still behind #360, which is why preflight (d) requires
it to already be at `main`, where the redacted replacements are; at `main` it loses nothing.

---

## 4. Backout, then rewrite

```bash
cd ~/portfolio-rewrite

# A mirror is the backout. Keep it until the rewrite is verified AND the repo is
# public — it is the only way back.
git clone --mirror https://github.com/ali-wallick/Portfolio.git portfolio-backout.git

# Work on a copy of it, so the backout is never the thing you rewrite.
cp -a portfolio-backout.git portfolio-rewrite.git
cd portfolio-rewrite.git
```

Delete the stale branches **in the mirror** before rewriting. The pruning push in step 6 then
removes them remotely, rather than rewriting branches nobody wants:

```bash
# Review first.
git for-each-ref --format='%(refname:short)' refs/heads | grep -vE '^(main|release)$'

# Then delete each one you are done with.
git branch -D <branch>            # repeat, or:
git for-each-ref --format='%(refname:short)' refs/heads \
  | grep -vE '^(main|release)$' | xargs -n1 git branch -D
```

Neither the copy nor the deletions trip filter-repo's fresh-clone check — verified 2026-09-11. If it
does refuse, read the reason it prints before reaching for `--force`; the one time it refused during
rehearsal, the cause was a mirror made from a local path rather than from GitHub.

Now the rewrite:

```bash
git filter-repo --strip-blobs-with-ids ~/portfolio-rewrite/strip-blobs.txt
```

**`--strip-blobs-with-ids`, never `--invert-paths`.** The PDF's _path_ must survive at `HEAD`
carrying its redacted blob — #40 settled that the file is kept deliberately, and a path filter would
delete it everywhere, including now.

Sanity-check the rewrite's size against filter-repo's own report. (These are also the two numbers
[#367](https://github.com/ali-wallick/Portfolio/issues/367)'s ticket needs — write them down.)

```bash
# How many commits were rewritten at all.
awk 'NR>1 && $1 != $2' filter-repo/commit-map | wc -l

# The oldest changed commit. The map is in processing order, not date order, so
# "first line that differs" is not it — look the initial checkin up by id.
# (Old ids resolve in the backout, not here; filter-repo has repacked them away.)
grep "^$(git -C ../portfolio-backout.git rev-parse 1cdcbfc)" filter-repo/commit-map
```

Expected: **every commit but one** is rewritten, and the oldest changed commit is **`1cdcbfc`**
("Initial Checkin", 2016-01-05) — the first 2016 résumé arrived with the repo. The only untouched
commit is `0d0046a`, the `.gitattributes` root, which is the one commit with no résumé anywhere in
its history. That is why the affected-PR count in #367 is every pull request rather than a subset.
The absolute figure was 853 of 854 on 2026-09-13; it is higher now, and the gap of exactly one is
the invariant to judge by.

**The denominator is not `main`'s commit count.** A mirror from GitHub carries one `refs/pull/N/head`
per pull request, filter-repo rewrites every ref it can see, and pull requests here are
squash-merged, so each PR's original branch commits are reachable only through its pull ref. The
map therefore covers every commit reachable from any ref — `git rev-list --count --all` in the
backout, roughly three times `main`'s own count — and not `git rev-list --count main`. The
2026-09-11 rehearsal reported 266 of 267, which was `main`'s count at the time; its figures match a
copy with no pull-request refs. The rewrite is identical either way, and the rewritten pull refs
stay local: step 6's refspecs never push them, and GitHub would refuse them if it did.

**`main` comes out exactly one commit shorter, and that is expected.** `1065039` ("Fixed resume
typo", 2016-04-09) changed nothing but the two résumé files, so stripping both blobs leaves it empty
and filter-repo's default `--prune-empty auto` drops it; the commit-map records it as mapped to all
zeros. Any other pruned commit would be one whose only content was on the list, which the table
above says cannot happen — stop and look.

```bash
# Which commits were pruned outright. Expect exactly one: 1065039.
awk 'NR>1 && $2 ~ /^0+$/ {print $1}' filter-repo/commit-map \
  | xargs -n1 git -C ../portfolio-backout.git log -1 --format='%h %ad %s' --date=short
```

---

## 5. Verify three ways, before pushing

Each catches something the others miss. Still inside `portfolio-rewrite.git`.

**First, write the hashes out on their own**, from the guard, which is their one source of
truth. Do this before running (a) — it reads the file:

```bash
grep -oE "sha256: '[0-9a-f]{64}'" /path/to/your/Portfolio/scripts/check-preserved-blobs.mjs \
  | grep -oE '[0-9a-f]{64}' > ~/portfolio-rewrite/bad-hashes.txt
wc -l < ~/portfolio-rewrite/bad-hashes.txt    # expect 10
```

```bash
# a. No denylisted blob is reachable from any ref. Expect: NO OUTPUT.
git rev-list --objects --all \
  | git cat-file --batch-check='%(objecttype) %(objectname) %(rest)' \
  | awk '$1=="blob"{print $2}' | sort -u \
  | while read -r oid; do
      h=$(git cat-file blob "$oid" | sha256sum | cut -d' ' -f1)
      grep -qx "$h" ~/portfolio-rewrite/bad-hashes.txt && echo "STILL PRESENT: $oid"
    done
```

**Judge (a) by its output, not its exit code.** The pipeline exits non-zero whenever the last blob
it looks at is not a match, which is the normal case — a non-zero exit here means nothing.

**This check is known to fire**, which is the only reason to trust a silent run. Executed against
the un-rewritten repo it prints all ten blob ids, one `STILL PRESENT:` line each. So silence after
the rewrite is evidence, not a broken command. If you want to re-confirm that before trusting it,
run (a) against `portfolio-backout.git` — it should print those ten.

```bash
# b. Byte sweep for the address across all of history. Proves the TEXT copies
#    gone; says nothing about the rasters, which have no searchable string —
#    the whole reason #360 existed.
git rev-list --all | while read -r c; do
  git grep -I -l -e '<probe>' "$c" 2>/dev/null
done
#    Probe strings are deliberately not written down in this repo (#360). Read
#    them off portfolio-backout.git's copies of the PDFs — there are now two
#    addresses, the 2016 street and the 2019 box — or from memory.

# c. The rasters, by enumeration plus an eyeball. There is no text to grep.
git log --all --oneline -- 'snapshot/rendered/resources/images/resume.png' \
                           'docs/before-after/old/resume-*.webp' \
                           'resources/images/resume.png' 'images/resume.png' \
                           'resources/WallickAli-Resume.pdf'
#    Expect #196's and #360's squash commits on main — the ones that added the
#    redacted replacements — plus, in a mirror from GitHub, the same two changes
#    as their original branch commits, reached through refs/pull/N/head. Four
#    lines on 2026-09-13, all dated 2026-08-26 or later. Every commit that added
#    an unredacted revision no longer touches these paths at all, so a 2016 or
#    2020 date here means the rewrite did not take.
#    Then extract one surviving copy of each and actually look at it:
git show <commit>:snapshot/rendered/resources/images/resume.png > /tmp/check.png && open /tmp/check.png
```

---

## 6. Force-push

```bash
# filter-repo removes 'origin' on purpose, to stop exactly this being accidental.
git remote add origin https://github.com/ali-wallick/Portfolio.git

# Dry run first. --prune DELETES remote branches and tags absent locally, which
# is how the stale branches from step 4 get removed. Read the output before the
# real push.
git push --prune --force --dry-run origin 'refs/heads/*:refs/heads/*' 'refs/tags/*:refs/tags/*'

# Re-run preflight (e) here. A Dependabot branch that appeared since the mirror
# was cloned is absent from it, so --prune would delete it and close its PR.
gh pr list --state open --json number,headRefName

git push --prune --force origin 'refs/heads/*:refs/heads/*' 'refs/tags/*:refs/tags/*'
```

**Not `git push --mirror`.** A mirror clone from GitHub also fetches `refs/pull/*` — one per pull
request, a couple of hundred here — and a mirror push tries to update every one. GitHub rejects each as a hidden ref, so the push
that matters most ends in a wall of `[remote rejected]` lines and a non-zero exit, with the branch
and tag updates buried in the middle. The dry run does not show this: the rejections come from the
server, and a dry run never asks it. Explicit refspecs touch only branches and tags, and `--prune`
only prunes within those two namespaces.

**Nothing on GitHub's side can refuse this push.** Branch protection and rulesets are a paid
feature on a private repository, so `main` and `release` have none (confirmed 2026-09-13: the API
returns a 403 "upgrade to enable this feature" for both). That changes once the repo is public —
another reason the rewrite happens before the flip, not after.

**Expect a production deploy.** `release` is Workers Builds' production branch, so force-pushing it
publishes. With preflight (d) done the tree is identical to what is already live, so this is fine —
but it should not be a surprise at the moment you are also rewriting history. See
`docs/CLOUDFLARE.md`.

```bash
# Confirm the remote took it.
git ls-remote --heads --tags origin
```

---

## 7. After

```bash
# The guard should still pass on the rewritten tree. The tags moved, and a plain
# fetch refuses to move a tag — so without --force the everyday checkout keeps
# the OLD assets-pre-cleanup, and restore-snapshot.mjs silently reads
# pre-rewrite history through it.
cd /path/to/your/Portfolio
git switch main                    # reset --hard acts on whichever branch is checked out
git fetch --force --tags --prune --prune-tags origin && git reset --hard origin/main
git rev-parse assets-pre-cleanup   # must match: git ls-remote --tags origin assets-pre-cleanup
npm ci && npm run verify
```

**The everyday checkout still holds the old history, and a later push can put it back.** Every
local branch and worktree that predates the rewrite still points at pre-rewrite commits, and pushing
any one of them — a stale branch pushed out of habit is enough — re-uploads the stripped blobs to
GitHub, reachable again through that branch. Run the `cleanup-branches` skill, or delete them by
hand, before the next push; a local branch that was not created from the rewritten `main` is not to
be trusted until it is gone. Count what is there rather than trusting a figure from a doc — it was
thirteen branches on one machine and eighteen on another the same day:

```bash
git branch | grep -vcE '^\*? *(main|release)$'   # stale local branches
git worktree list                                 # every one but the first is on old history
```

Then delete the SHA fallback and its `TODO(#109)` in `scripts/restore-snapshot.mjs` — the tag is the
only name that works once history has moved:

```bash
grep -n 'ASSET_SHA_FALLBACK\|TODO(#109)' scripts/restore-snapshot.mjs
```

Two things are now open rather than done, and neither belongs in this runbook:

- **[#367](https://github.com/ali-wallick/Portfolio/issues/367)** — the Support purge, and it is
  now the next step rather than a maybe. Its one condition was #200 succeeding, and #200 closed
  on 2026-09-11 with zero captures left for any of the three files, so GitHub is now the last
  copy outside this machine. The ordering constraint stands: file it _after_ this push and
  _before_ the flip, never after. Its ticket text needs the two numbers from step 4 pasted in.
- **#109 item 4** — sanitize the issue tracker. #200's body is the exposure there, not
  archive.org's answer. Its survey also says the résumé with the home address and phone number "is
  not in git anywhere"; the 2010 one may not be, but the 2016 one was, in six blobs, until this ran.
