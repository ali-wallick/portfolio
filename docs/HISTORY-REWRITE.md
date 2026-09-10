# Rewriting history to purge the résumé address

The runbook for [#109](https://github.com/ali-wallick/Portfolio/issues/109) item 3. **Ali runs this,
not an agent** — it needs a full clone, force-push rights on every ref, and a GitHub Support request,
and it lands a production deploy as a side effect. Prepared 2026-09-09, commands added 2026-09-10.

Same relationship to #109 that `LAUNCH.md` has to #34: **the issue holds the decision and the
ordering, this holds the procedure.** Nothing here restates the checklist — read #109 first.

Every command below is meant to be pasted as-is. Where a number is quoted, it was measured on
2026-09-10 against `main` at `fd3b9fe` — **re-measure rather than trusting it**, since each figure
has a command beside it.

---

## 0. Preflight

```bash
# Tooling. filter-repo is not bundled with git.
brew install git-filter-repo
git filter-repo --version

# Somewhere to work, outside the everyday checkout.
mkdir -p ~/portfolio-rewrite && cd ~/portfolio-rewrite
```

Three preconditions, each checkable:

```bash
# a. #360 and #45 are merged, so HEAD carries none of the four blobs.
cd /path/to/your/Portfolio && npm run check:blobs
#    Expect: ✓ ... none matches a known-bad preserved blob.

# b. The repo is still private and has no forks. Once public, any clone keeps
#    the rewritten-away history forever. This is the only clean window.
gh repo view ali-wallick/Portfolio --json isPrivate,forkCount
#    Expect: {"forkCount":0,"isPrivate":true}

# c. You are on a full clone, not a shallow one.
git rev-list --count HEAD   # ~263
test -f .git/shallow && echo "SHALLOW — run: git fetch --unshallow" || echo "full clone"
```

---

## 1. The four blobs

Found by hashing **every** blob reachable from every ref (1,868 of them) and matching content against
the denylist in `scripts/check-preserved-blobs.mjs` — content, not paths, for the reason #360
settled. Exactly four matched, one per denylist entry.

| Blob id                                    | What it is                       | Commits | Path it lived at                                |
| ------------------------------------------ | -------------------------------- | ------- | ----------------------------------------------- |
| `140fb71f1630a57e6a376e639a6c8f96596b4f1a` | the unredacted 2019 résumé PDF   | 2       | `resources/WallickAli-Resume.pdf`               |
| `f485f41eae07a1e2f3f8319d267e3765a1898719` | a 1700×2200 render of it         | 6       | `snapshot/rendered/resources/images/resume.png` |
| `f018f54e110239b01e6dd7da99c647ac123e0c08` | the desktop before/after capture | 3       | `docs/before-after/old/resume-desktop.webp`     |
| `f680cb1cda500fbf17caacfe9c4469a58f048dae` | the mobile before/after capture  | 3       | `docs/before-after/old/resume-mobile.webp`      |

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

wc -l ~/portfolio-rewrite/strip-blobs.txt    # expect 4
```

Takes about 10 seconds. If it returns anything other than 4, **stop** — either the denylist changed or a
new copy exists, and both mean re-reading #360 before continuing.

---

## 2. What still carries them

Measured 2026-09-10. `main` is clean; everything below is not.

```bash
# Every ref still carrying a bad blob.
for r in $(git for-each-ref --format='%(refname)' refs/remotes/origin refs/tags); do
  while read -r oid; do
    git ls-tree -r "$r" 2>/dev/null | grep -q "$oid" && { echo "$r"; break; }
  done < ~/portfolio-rewrite/strip-blobs.txt
done | sort -u
```

Expect ~8 branches (including `release`) and 3 tags — `v1-legacy`, `assets-pre-cleanup`,
`launch-2026-08-27`.

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

**`v1-legacy` stops being a byte-complete capture of the old site.** It carries two of the four
blobs, so the rewrite removes `resources/WallickAli-Resume.pdf` and `resources/images/resume.png`
from that tag's tree. The 31 `.php` files, the old `.htaccess` and the stylesheets are untouched —
see `docs/PRESERVATION.md`. If that trade is not acceptable, stop and reopen #109; it is not
reversible after the force-push.

```bash
# See exactly what v1-legacy loses.
git ls-tree -r v1-legacy --name-only | wc -l          # 185 before
git ls-tree -r v1-legacy --name-only | grep -E 'resume\.(pdf|png)$'
```

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

Delete the stale branches **in the mirror** before rewriting. The `--mirror` push in step 6 then
removes them remotely, rather than rewriting branches nobody wants:

```bash
# Review first.
git for-each-ref --format='%(refname:short)' refs/heads | grep -vE '^(main|release)$'

# Then delete each one you are done with.
git branch -D <branch>            # repeat, or:
git for-each-ref --format='%(refname:short)' refs/heads \
  | grep -vE '^(main|release)$' | xargs -n1 git branch -D
```

Now the rewrite:

```bash
git filter-repo --strip-blobs-with-ids ~/portfolio-rewrite/strip-blobs.txt
```

**`--strip-blobs-with-ids`, never `--invert-paths`.** The PDF's _path_ must survive at `HEAD`
carrying its redacted blob — #40 settled that the file is kept deliberately, and a path filter would
delete it everywhere, including now.

Grab the numbers the support ticket needs, straight from filter-repo's own report:

```bash
# First changed commit: the first line where the old SHA maps to a different new one.
awk 'NR>1 && $1 != $2 {print "first changed commit: "$1" -> "$2; exit}' \
  filter-repo/commit-map

# How many commits were rewritten at all.
awk 'NR>1 && $1 != $2' filter-repo/commit-map | wc -l
```

Expected, measured beforehand: the first changed commit is **`b541155`** ("Accidentally forgot to
commit changes from 2019", 2020-09-01) and **240 of 263** commits are rewritten. `b541155` predates
every pull request in the repo, which is why the affected-PR count in step 7 is _all_ of them.

---

## 5. Verify three ways, before pushing

Each catches something the others miss. Still inside `portfolio-rewrite.git`.

**First, write the four hashes out on their own**, from the guard, which is their one source of
truth. Do this before running (a) — it consumes the file:

```bash
grep -oE "sha256: '[0-9a-f]{64}'" /path/to/your/Portfolio/scripts/check-preserved-blobs.mjs \
  | grep -oE '[0-9a-f]{64}' > ~/portfolio-rewrite/bad-hashes.txt
wc -l < ~/portfolio-rewrite/bad-hashes.txt    # expect 4
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
the un-rewritten repo on 2026-09-10 it printed all four:

```
STILL PRESENT: 140fb71f1630a57e6a376e639a6c8f96596b4f1a
STILL PRESENT: f018f54e110239b01e6dd7da99c647ac123e0c08
STILL PRESENT: f485f41eae07a1e2f3f8319d267e3765a1898719
STILL PRESENT: f680cb1cda500fbf17caacfe9c4469a58f048dae
```

So silence after the rewrite is evidence, not a broken command. If you want to re-confirm that
before trusting it, run (a) against `portfolio-backout.git` — it should print those four.

```bash
# b. Byte sweep for the address across all of history. Proves the TEXT copies
#    gone; says nothing about the rasters, which have no searchable string —
#    the whole reason #360 existed.
git rev-list --all | while read -r c; do
  git grep -I -l -e '<probe>' "$c" 2>/dev/null
done
#    Probe strings are deliberately not written down in this repo (#360). Read
#    them off portfolio-backout.git's copy of the PDF, or from memory.

# c. The rasters, by enumeration plus an eyeball. There is no text to grep.
git log --all --oneline -- 'snapshot/rendered/resources/images/resume.png' \
                           'docs/before-after/old/resume-*.webp' \
                           'resources/images/resume.png'
#    Then extract one surviving copy of each and actually look at it:
git show <commit>:snapshot/rendered/resources/images/resume.png > /tmp/check.png && open /tmp/check.png
```

---

## 6. Force-push

```bash
# filter-repo removes 'origin' on purpose, to stop exactly this being accidental.
git remote add origin https://github.com/ali-wallick/Portfolio.git

# Dry run first. --mirror DELETES remote refs absent locally, which is how the
# stale branches from step 4 get removed. Read the output before the real push.
git push --mirror --dry-run origin

git push --mirror --force origin
```

**Expect a production deploy.** `release` is Workers Builds' production branch, so force-pushing it
publishes. The content is identical, so this is fine — but it should not be a surprise at the moment
you are also rewriting history. See `docs/CLOUDFLARE.md`.

```bash
# Confirm the remote took it.
git ls-remote --heads --tags origin
```

---

## 7. The GitHub Support request

**This is the step that actually removes the bytes from GitHub, and the one most likely to be
skipped** because everything already looks right by then. Force-pushed commits stay fetchable by SHA
through `refs/pull/N/head` — server-side refs your push does not touch and you cannot delete
yourself. Without this, the old blobs are _retrievable by anyone who knows the SHA_. That is not the
same as still-published, but it is not gone either.

It is GitHub's own documented step, at the end of
[Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).
On the ticket they dereference or delete affected PRs, run a server-side `gc`, and drop cached views.

File at **<https://support.github.com/contact>**, category _Account or Repository_ → _Sensitive
Data Removal_.

Numbers to fill in first:

```bash
# Affected pull requests. All of them, because the first changed commit
# (2020-09-01) predates every PR in this repo.
curl -sSI -H "Authorization: Bearer $(gh auth token)" \
  "https://api.github.com/repos/ali-wallick/Portfolio/pulls?state=all&per_page=1" \
  | grep -i '^link:'
#    Read the rel="last" page number — that is the PR count. Was 202 on 2026-09-10.
```

### Paste-ready ticket

> **Subject:** Sensitive data removal after history rewrite — ali-wallick/Portfolio
>
> Hello,
>
> I have rewritten the history of my private repository `ali-wallick/Portfolio` to remove four blobs
> containing personal information (a home mailing address on an old résumé, in one PDF and three
> images). The rewrite is done and force-pushed. I would like the cached views and the references in
> pull requests removed so the blobs are no longer retrievable by SHA.
>
> - **Repository:** ali-wallick/Portfolio (private, 0 forks)
> - **Affected pull requests:** 202 — all pull requests in the repository. I understand every one of
>   them will be dereferenced or deleted.
> - **First changed commit:** `<paste from filter-repo/commit-map>` (old) → `<new>`
> - **Commits rewritten:** 240 of 263
> - **Method:** `git filter-repo --strip-blobs-with-ids`, stripping these four blob ids:
>   - `140fb71f1630a57e6a376e639a6c8f96596b4f1a`
>   - `f485f41eae07a1e2f3f8319d267e3765a1898719`
>   - `f018f54e110239b01e6dd7da99c647ac123e0c08`
>   - `f680cb1cda500fbf17caacfe9c4469a58f048dae`
> - **LFS objects orphaned:** none — this repository does not use Git LFS.
>
> I have confirmed no remaining reference to these blobs on any branch or tag, and there are no
> forks. Please dereference or delete the affected pull requests, run garbage collection, and remove
> the cached views.
>
> Thank you.

**Do not paste the address itself into the ticket.** The blob ids identify the content precisely and
support can act on them; writing the address into a support system makes another copy of the thing
you are removing.

**It does not always take on the first pass** — there is a standing
[community thread](https://github.com/orgs/community/discussions/47294) from people whose PR
references survived. Re-check afterwards:

```bash
# Pick a stripped commit SHA from portfolio-backout.git, then try to fetch it.
# Before the purge this succeeds; after it, it should 404.
git -C portfolio-backout.git rev-list --all | head -1
curl -sS -o /dev/null -w '%{http_code}\n' \
  -H "Authorization: Bearer $(gh auth token)" \
  "https://api.github.com/repos/ali-wallick/Portfolio/commits/<old-sha>"
```

---

## 8. After

```bash
# The guard should still pass on the rewritten tree.
cd /path/to/your/Portfolio
git fetch origin && git reset --hard origin/main
npm ci && npm run verify
```

Then delete the SHA fallback and its `TODO(#109)` in `scripts/restore-snapshot.mjs` — the tag is the
only name that works once history has moved:

```bash
grep -n 'ASSET_SHA_FALLBACK\|TODO(#109)' scripts/restore-snapshot.mjs
```

Continue at **#109 item 4** — sanitize the issue tracker. #200's body is the exposure there, not
archive.org's answer.
