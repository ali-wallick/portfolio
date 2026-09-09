# Rewriting history to purge the résumé address

The runbook for [#109](https://github.com/ali-wallick/Portfolio/issues/109) item 3. **Ali runs this,
not an agent** — it needs a full clone, force-push rights on every ref, and a GitHub support request,
and it lands a production deploy as a side effect. Prepared 2026-09-09 from a full clone, immediately
after [#362](https://github.com/ali-wallick/Portfolio/pull/362) closed the working-tree copies.

Same relationship to #109 that `LAUNCH.md` has to #34: **the issue holds the decision and the
ordering, this holds the procedure.** Nothing here restates the checklist — read #109 first.

## Preconditions

- **#362 is merged.** Verified: `origin/main` at `adf8ef1` carries none of the four blobs below.
  Purging history while `HEAD` shipped the same image was the thing #360 called theatre.
- **The repo is still private and has no forks.** Once public, any clone keeps the rewritten-away
  history forever. This is the only clean window.
- `git filter-repo` installed (`brew install git-filter-repo`).
- A full clone. `git rev-list --count HEAD` should be ~262, and `.git/shallow` must not exist.

## The four blobs

Enumerated by hashing **every** blob reachable from every ref (1,868 of them) and matching content
against the denylist in `scripts/check-preserved-blobs.mjs` — content, not paths, for the reason
#360 settled. Exactly four matched, one per denylist entry.

| Blob id                                    | What it is                       | Commits | Path it lived at                                |
| ------------------------------------------ | -------------------------------- | ------- | ----------------------------------------------- |
| `140fb71f1630a57e6a376e639a6c8f96596b4f1a` | the unredacted 2019 résumé PDF   | 2       | `resources/WallickAli-Resume.pdf`               |
| `f485f41eae07a1e2f3f8319d267e3765a1898719` | a 1700×2200 render of it         | 6       | `snapshot/rendered/resources/images/resume.png` |
| `f018f54e110239b01e6dd7da99c647ac123e0c08` | the desktop before/after capture | 3       | `docs/before-after/old/resume-desktop.webp`     |
| `f680cb1cda500fbf17caacfe9c4469a58f048dae` | the mobile before/after capture  | 3       | `docs/before-after/old/resume-mobile.webp`      |

**One blob, several paths — which is the whole argument for keying on blob id.** `f485f41` is
byte-identical wherever it appeared, so git stores it once and one entry kills every path those bytes
ever landed at, including any nobody has thought of. That is #360's class-not-path lesson applied to
the rewrite.

Regenerate the list rather than trusting this table if any time has passed:

```bash
git rev-list --objects --all \
  | git cat-file --batch-check='%(objecttype) %(objectname) %(rest)' \
  | awk '$1=="blob"{print $2}' | sort -u \
  | while read -r oid; do
      h=$(git cat-file blob "$oid" | sha256sum | cut -d' ' -f1)
      grep -q "$h" scripts/check-preserved-blobs.mjs && echo "$oid"
    done
```

## What still carries them

Checked 2026-09-09. `origin/main` is clean; everything below is not.

- **8 branches** — `release`, plus seven stale ones:
  `claude/issue-328-plan-17apqa-p9tm3o`, `claude/issue-340-cleanup-byxpg3`,
  `claude/issue-355-text-adjustments-ka60sn`, `claude/portfolio-content-pass-upyqua`,
  `claude/portfolio-issue-275-plan-fh52a9`, `design/resume-print-235`,
  `fix/reticle-unplaced-flyin`, and `dependabot/npm_and_yarn/svgo-4.1.0`.
- **3 tags** — `v1-legacy`, `assets-pre-cleanup`, `launch-2026-08-27`.

**Delete the stale branches before the rewrite rather than rewriting them** (#109's own call). Seven
of the eight are merged or abandoned; `release` and the dependabot branch are the exceptions —
`release` is production and must be rewritten, and the dependabot PR ([#363](https://github.com/ali-wallick/Portfolio/pull/363))
should be closed and left for Dependabot to reopen against the new history.

**`filter-repo` re-points tags automatically**, which is why `restore-snapshot.mjs` names the asset
commit as `assets-pre-cleanup` instead of a SHA — after this it needs no follow-up edit. Delete its
`ce4533e~1` fallback and the `TODO(#109)` beside it once this has run.

## Consequence to accept before starting

**`v1-legacy` stops being a byte-complete capture of the old site.** It carries two of the four blobs,
so the rewrite removes `resources/WallickAli-Resume.pdf` and `resources/images/resume.png` from that
tag's tree. The 31 `.php` files, the old `.htaccess` and the stylesheets are untouched — see
`docs/PRESERVATION.md`. If that trade is not acceptable, stop here and reopen #109; it is not
reversible after the force-push.

## Procedure

**1. Backout clone, kept aside.**

```bash
git clone --mirror git@github.com:ali-wallick/Portfolio.git ~/portfolio-backout.git
```

Do not delete this until the rewrite is verified _and_ the repo is public. It is the only way back.

**2. Delete the seven stale branches**, on the remote and locally.

**3. Rewrite.** In a fresh clone, not your working one:

```bash
printf '%s\n' \
  140fb71f1630a57e6a376e639a6c8f96596b4f1a \
  f485f41eae07a1e2f3f8319d267e3765a1898719 \
  f018f54e110239b01e6dd7da99c647ac123e0c08 \
  f680cb1cda500fbf17caacfe9c4469a58f048dae > /tmp/strip-blobs.txt

git filter-repo --strip-blobs-with-ids /tmp/strip-blobs.txt
```

**`--strip-blobs-with-ids`, never `--invert-paths`.** The PDF's _path_ must survive at `HEAD` carrying
its redacted blob — #40 settled that the file is kept deliberately, and a path filter would delete it
everywhere including now.

**4. Verify three ways, before pushing.** Each catches something the others miss.

```bash
# a. No denylisted blob is reachable from any ref. The enumeration above, re-run.
#    Expect: no output.

# b. Byte sweep for the address across all of history. Proves the *text* copies gone.
#    Says nothing about the rasters — they have no searchable string, which is
#    the whole reason this issue existed.
git rev-list --all | while read -r c; do
  git grep -I -l -e '<probe>' "$c" 2>/dev/null
done
#    Probe strings are not written down in this repo (#360). Read them off the
#    backout clone's copy of the PDF, or ask Ali.

# c. The rasters, by enumeration plus an eyeball. There is no text to grep.
git log --all --oneline -- 'snapshot/rendered/resources/images/resume.png' \
                           'docs/before-after/old/resume-*.webp' \
                           'resources/images/resume.png'
#    Then open one surviving copy of each and look at it.
```

**5. Force-push every ref**, then re-point tags (filter-repo has already done this locally).

**Expect a production deploy.** `release` is Workers Builds' production branch, so force-pushing it
publishes. That is fine — the content is identical — but it is not a surprise you want at the moment
you are also rewriting history. See `docs/CLOUDFLARE.md`.

**6. Ask GitHub support to purge the old objects.** Force-pushed commits stay fetchable by SHA
through PR refs indefinitely. **A rewrite without this request is theatre** — it is the step that
actually removes the bytes from GitHub, and it is the one most likely to be skipped because
everything already looks right.

**7. Re-run `npm run verify`** on the rewritten clone. `check:blobs` should pass; if it fails, the
rewrite removed something it should not have.

## After

Delete the `ASSET_SHA_FALLBACK` and its `TODO(#109)` in `scripts/restore-snapshot.mjs`, then
continue at #109 item 4 (sanitize the issue tracker — #200's body is the exposure there, not
archive.org's answer).
