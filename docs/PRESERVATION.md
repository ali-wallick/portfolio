# Preserving the old site

What survives of the pre-2026 `aliwallick.com`, where each piece lives, and how to look at it.

Written 2026-08-26, while the old DreamHost site was **still live**. Some of what follows was only
possible in that window; where that matters, it says so.

---

## The pieces

| Where                             | What                                                                | Faithful?                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `snapshot-pre-retirement` (tag)   | 26 rendered HTML pages, crawled 2026-08-15, plus the browsable copy | **Retired from the tree 2026-09-21 (#45).** Read with `git show`; see the section at the end.               |
| `content/archive/`                | 20 blog posts as Markdown + 14 images                               | **Yes — do not edit.** Same hook.                                                                           |
| `resources/css`, `resources/js`   | The old stylesheet and `nav.js`                                     | The **only** copy. Mined in Phase 5.                                                                        |
| `resources/WallickAli-Resume.pdf` | The 2019 resume                                                     | Carries a PO Box. See #109, #197.                                                                           |
| `v1-legacy` tag                   | The complete PHP source, 31 files, **and the old `.htaccess`**      | Pushed to origin. Confirmed. 183 files in all — 185 until the 2026-09-18 rewrite took the two résumé files. |
| `docs/before-after/`              | 32 paired screenshots, old vs new                                   | Old side captured from the live server.                                                                     |
| Ali's cold storage                | Source video for the 6 hero YouTube embeds                          | Outside this repo. See `docs/VIDEO-ARCHIVE.md`.                                                             |

## Looking at it

The archive is plain static HTML with relative paths, so it browses fine once restored from the tag:

```bash
git restore --source=snapshot-pre-retirement -- snapshot/
open snapshot/rendered/index.html
```

Or serve it, which is closer to how it was actually delivered. The script that does that left the
tree with its inputs (2026-09-21, the public-repo cleanup) and is on the same tag:

```bash
git restore --source=snapshot-pre-retirement -- snapshot/ scripts/restore-snapshot.mjs
node scripts/restore-snapshot.mjs --serve
```

Both of those read the archive and neither writes to it. That has been true since
[#344](https://github.com/ali-wallick/portfolio/issues/344) and was not true before it — see
"Rebuilding" below.

**The old server config went the same way on 2026-09-09** ([#45](https://github.com/ali-wallick/portfolio/issues/45)).
The root `.htaccess` — mod_rewrite rules for extensionless URLs and the `/blog/` passthrough — was
#25's source material, and #25 closed on 2026-08-23. It is cited in five places as a description of
how the old site behaved (`CLAUDE.md`, `astro.config.mjs`, `public/_redirects`, `wrangler.jsonc`,
`scripts/restore-snapshot.mjs`), and **none of them reads the file** — it sat at the repo root, not
in `public/`, so it was never served either. Deleting it was lossless: `v1-legacy`'s copy is
byte-identical, verified by sha256 before removal. Read it there.

For the original PHP source, which no longer exists in the working tree:

```bash
git worktree add /tmp/old-site v1-legacy
```

## Rebuilding `snapshot/rendered/`

**Retired 2026-09-21 (#45), so this needs its inputs restored first** —
`git restore --source=snapshot-pre-retirement -- snapshot/ scripts/restore-snapshot.mjs`. The script
went with them the same day: it had no inputs and no output left in the tree, and the derivation it
documents is only auditable beside the artifact, which is on the tag. The rest of this section
describes the tree as it stood while `snapshot/` was in it.

```bash
node scripts/restore-snapshot.mjs --check-selfcontained  # verify; writes nothing
node scripts/restore-snapshot.mjs --serve                # browse; writes nothing
node scripts/restore-snapshot.mjs --rebuild              # regenerate; destructive
node scripts/restore-snapshot.mjs --rebuild --check-selfcontained
```

**The rebuild is the only destructive mode, and as of
[#344](https://github.com/ali-wallick/portfolio/issues/344) the flag says so.** It used to be what
every invocation did, `--check-selfcontained` and `--serve` included, because the build ran at
module top level and the flag check sat 245 lines below it. So the command this page gave for
verifying the archive rebuilt it instead — and in a shallow clone, which is what a Claude Code web
session gets, that rebuild cannot resolve the asset commit. It died partway through writing pages and
left the archive at **27 of its 102 files**. `git checkout -- snapshot/rendered` restored all 102
cleanly, which is the committed-artifact argument holding up under exactly the failure it was
written against.

**"The asset commit" is named by a tag, not a SHA** (2026-09-09,
[#360](https://github.com/ali-wallick/portfolio/issues/360)). It is the commit before Phase 3
deleted `resources/images/`, and `scripts/restore-snapshot.mjs` resolves it as
**`assets-pre-cleanup`**, which Ali pushed the same day. It points at `b07bc9b` (`090f1ce` before
the 2026-09-18 rewrite), whose tree still carries all 144 files under `resources/images/` including
`ASSET_INVENTORY.md`. This is the fix for
a trap [#109](https://github.com/ali-wallick/portfolio/issues/109) names: a history rewrite
invalidates every SHA, and the replacement SHA does not exist until the rewrite has already run — so
a SHA in the source can only ever be fixed afterwards, which is the follow-up nobody remembers.
`git filter-repo` re-points tags automatically, and when the rewrite ran on 2026-09-18 it did
exactly that. No code change was needed to follow it.

**The tag is the only name now.** Until the rewrite, the script also fell back to the literal
`ce4533e~1`, for a shallow clone fetched without tags. That SHA no longer exists, so the fallback
was deleted with the rewrite. A shallow clone can still lack the tag — that is what a Claude Code
web session gets — and `git fetch origin tag assets-pre-cleanup` is the one-line fix there.

**A rebuild now proves it can reach every source before it deletes anything.** Only 28 of those 102
files are derived from `snapshot/`; the other 74 are the 54 blobs at the asset commit, the 14 blog images
below, and 6 poster frames from i.ytimg.com. The preflight resolves the commit and HEADs every
committed remote-sourced file, and refuses to start if any of them cannot be fetched back.
`--allow-missing-remote` overrides that for the remote half only, because the blog going dark is
permanent and a shallow clone is one `git fetch --unshallow` away.

The script restores 54 assets from git at the asset commit, relativizes the old site's root-absolute and
extensionless mod_rewrite URLs, and removes four dead external dependencies. See its header for why
each one goes rather than gets vendored.

**One step needs the old host to still be up:** the blog's 14 images are referenced by absolute URL
against `aliwallick.com`, so they exist in neither `snapshot/` nor git and are fetched live. They
are committed. Until #344 this section said that made a post-cutover rebuild safe — it would
"report them as failures but still produce a correct archive from what is on disk". **That was
wrong, for the same reason everything above was wrong:** the rebuild's first act deletes
`snapshot/rendered/`, and those 14 files live inside it. Do not delete them expecting a rebuild to
bring them back — and note that a rebuild without the old host is itself that deletion, which is
what the preflight now refuses.

## What is verified, and what that cost

Checked on 2026-08-26 against the live server, which is the last chance to check any of it:

- **All 54 restored assets are byte-for-byte identical to what the live site serves**, by sha256.
- **All 14 blog images are byte-for-byte identical to `content/archive/images/`**, confirming Phase
  0's scrape — which is the spot-check #51 wants before retiring WordPress.
- **The archive makes zero external network requests and has zero broken references**, asserted
  across all 26 pages by `--check-selfcontained`, which reads `snapshot/rendered/` as it stands.

That last one is the property worth protecting. The original decayed precisely because it depended
on other people's servers: html5shiv went down with Google Code in 2015 and nobody noticed for a
decade. An archive that loads nothing from anywhere cannot rot that way.

## What could not be preserved

**Three of the nine embedded videos are gone from YouTube** — `7JIMwZnURI4`, `I4FHmsjQyGI`, and
`MAN8Luc5emM` all return 403, meaning deleted or made private. The pages that referenced them now
say so explicitly rather than showing a broken frame. These bytes were never Ali's to keep, and no
copy exists anywhere in this repo.

**`nightLight.unity3d`** (6.3 MB) was deleted at the cleanup commit as an unplayable artifact of a plugin
discontinued in 2017. It is in git history if it is ever wanted; the Unity Web Player is not.

## The hero videos are archived, outside this repo

The three dead embeds above are the argument for [#272](https://github.com/ali-wallick/portfolio/issues/272):
`yt-dlp` cannot fetch a video after it has been made private, so the six YouTube videos the _current_
site uses as project heroes were captured while they are all still up. 291 MB, with the uploader,
channel and upload date recorded alongside each file.

**The files are in Ali's own cold storage and the location is deliberately not recorded anywhere in
this repo** — a public repo is the wrong place for the path to someone's personal storage. What is
committed is `docs/VIDEO-ARCHIVE.md`: what was captured, the sha256 of every file, how to verify a
copy, and the two `yt-dlp` traps that made the first run silently drop two videos.

The four Marvel Snap `press` videos are **not** archived. That was a scoping call, not an oversight,
and `docs/VIDEO-ARCHIVE.md` says which one has the strongest case for revisiting.

## The resume PDF is redacted in the working tree

`resources/WallickAli-Resume.pdf` carried a PO Box on its header line. The working-tree copy no
longer does, as of 2026-08-26.

**The line was removed, not covered.** A filled rectangle drawn over text leaves the text extractable
underneath, which is the classic redaction failure. Instead the whole `BT…ET` text-showing block was
deleted from the page's content stream, so the glyphs are not in the file at all. Verified four ways:

| Check                           | Result                                                        |
| ------------------------------- | ------------------------------------------------------------- |
| Text extraction (pdfjs)         | 102 items to 101 — exactly one removed, and it is the address |
| Probes for each address token   | all absent                                                    |
| Raw byte grep                   | not found                                                     |
| Pixel diff against the original | 0.126% of pixels, all inside the address bounding box         |

**The probe strings are not written down here, and that is deliberate** (2026-09-09,
[#360](https://github.com/ali-wallick/portfolio/issues/360)). This table used to name all four,
which meant a public reader could reassemble the address from the very document explaining that it
had been removed. The probes are the address's own words, and the blob that held them was stripped
from history (#109), so ask Ali. A public repo
([#378](https://github.com/ali-wallick/portfolio/issues/378)) is the wrong place to keep a
reassemblable copy of the thing it is redacting.

Everything else is untouched and still selectable: name, email, website, and the other 101 text
items. 100.5 KB against the original's 98 KB.

**The original is not lost.** Four historical blobs remain across four commits, and `v1-legacy` holds
one. (Six older ones — the 2016 résumé in three revisions, and a render of each — sit further back
at the same two paths and carry a street address and phone number; found 2026-09-11, and on the
guard's denylist since. Until they are rewritten away, "the original" is a class, not a file.) Nothing here is a substitute for #109's question about history — this only improves the copy a
reader would actually open.

**`scripts/restore-snapshot.mjs` reads this file from the working tree rather than from the asset
commit** — see its `SUPERSEDE` map. This matters: the script's first run faithfully restored the
_unredacted_ PDF into `snapshot/rendered/`, manufacturing a second copy of the very exposure the
repo is trying to reduce, and it was committed before anyone noticed.

**This paragraph used to end "A rebuild can no longer do that", and that was false as written**
(corrected 2026-09-09, [#360](https://github.com/ali-wallick/portfolio/issues/360)). The fix it was
describing was `PREFER_WORKTREE`, a `Set` with one path in it — so the very next rebuild did the
identical thing one file over, restoring `resources/images/resume.png`, a full-page render of the
same résumé. **The fix guarded a path when the risk was a class.** What can now honestly be said:
the map names both files, and `scripts/check-preserved-blobs.mjs` fails the build on the _content_
of the known-bad blobs wherever they land, which is the part that does not depend on someone having
listed the right path.

The redaction was produced with `pdfjs-dist`, `pdf-lib` and `@napi-rs/canvas` installed **outside the
repo**, deliberately — three dependencies is a poor trade for something that runs once.
`package.json` is untouched. To redo it, locate the text block by its computed device position
rather than by byte offset.

## The résumé's _pictures_ were redacted too — 2026-09-09, #360

Redacting the PDF in 2026-08-26 closed one copy of the address. **Three others were legible in HEAD
the whole time**, because every prior pass looked at git history and none looked at the working
tree ([#360](https://github.com/ali-wallick/portfolio/issues/360)):

| File                                            | How it got there                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| `snapshot/rendered/resources/images/resume.png` | A rebuild restored the historical blob — a 1700×2200 render of the unredacted résumé |
| `docs/before-after/old/resume-desktop.webp`     | Captured from the live old résumé page, which embedded that PNG                      |
| `docs/before-after/old/resume-mobile.webp`      | Same                                                                                 |

All three are closed now, by two different techniques, because they are two different problems.

**The PNG was replaced, not patched.** `resources/resume-redacted.png` is a fresh 200-DPI render of
the already-redacted PDF — 612 × 200/72 = 1700 and 792 × 200/72 = 2200, matching the original's
geometry exactly — and `snapshot/rendered/` now carries that instead of the historical blob. A
downsampled pixel diff against the original shows the address line as the only substantive
difference; everything else lines up, which is what proves it is the same document rather than a
different-looking one. It lives at `resources/resume-redacted.png` rather than under
`resources/images/`, because nothing should ever exist there again (CLAUDE.md).

Rendered with `pdfjs-dist` and `@napi-rs/canvas` installed **outside the repo**, on the same
reasoning as the PDF redaction above: `package.json` is untouched for something that runs once.

**The two captures got a composited bar**, and that is a real redaction here rather than the failure
mode warned about above. The warning is specific to PDFs, which keep a text layer beneath their
appearance. A raster has nothing under the pixels — the bar was composited before encoding, so the
covered pixels are not in the file. They could not be re-captured in any case: the "before" side
comes from the _live_ old site, which stopped serving at the 2026-08-27 cutover.
`docs/before-after/README.md` records the measured geometry and says the captures are modified,
which is the part that matters — a modified capture that does not say so is worse than either
alternative.

**And the class is guarded now, not just the paths.** `scripts/check-preserved-blobs.mjs` hashes
every tracked file and fails the build on any match against a committed denylist of the pre-fix
blobs. It runs in `npm run verify` beside `check:source`, before the build, since it needs no build.
Hashes are not the address, so the denylist is safe to commit. It is deliberately not an address
detector: re-encode one of these images and the hash is gone. It fires on exactly the recurrence
that has now happened twice — a script faithfully restoring a known historical blob — which is a
narrow guard for a demonstrated bug rather than a heuristic that fires on correct files.

**Four entries, and the fourth arrived with the tag.** Three are the images above. The fourth is the
unredacted PDF itself, which shipped absent from the first version of the guard because its blob is
unreachable from a shallow clone — the guard said so rather than carrying a guessed hash. Pushing
`assets-pre-cleanup` made it reachable in one fetch, and it was verified before being listed: all
four address probes present in the tagged blob, zero in the committed one. That file is the one
occurrence a path rule already covers (`SUPERSEDE`), so it is now covered twice, which is the right
number for the copy that started all of this.

None of this touches history. Stripping the blobs from history is
[#109](https://github.com/ali-wallick/portfolio/issues/109), and it was blocked on this: purging
history while HEAD ships the same image is theatre.

## What archive.org has

173 URLs, spanning **four generations** of this domain:

| Era  | Shape                                                          |
| ---- | -------------------------------------------------------------- |
| 2010 | `index.php`, `about.php`, `lcc2730/` and `lcc3710/` coursework |
| 2011 | a `site/` layout, `game/` project pages                        |
| 2015 | `professional/`, `art/`, `ggj2015`                             |
| 2016 | the `projects/` structure this repo replaced                   |

**archive.org already holds the site's final form**, so no fresh capture was needed. Verified
2026-08-27: homepage 2025-11-10, `/about` 2025-08-30, `/contact` 2025-08-23, and the Vegas Blvd page
added in 2020 on 2025-09-17. The About capture contains the final Second Dinner and
"From 2016 to 2019" MobilityWare text, so these are captures of the last version of the site rather
than of an older one.

**Beware `collapse=urlkey` on the CDX API.** It returns the _first_ capture per URL, not the latest.
An earlier version of this file claimed the newest capture was 2019-07-19 on exactly that mistake,
reading first-seen dates as last-seen ones. Sort or filter explicitly when the question is "when was
this last archived?"

**archive.org's holdings of the old résumés were wider than the PDF**, including rendered images
where no content-stream redaction is possible. Removal there was a manual request rather than a
re-crawl, and [#200](https://github.com/ali-wallick/portfolio/issues/200) closed on 2026-09-11 with
none left.

## `snapshot/` was retired on 2026-09-21 (#45)

Done, and this section is the record rather than a plan. The archive is on the annotated tag
**`snapshot-pre-retirement`**, pushed to origin before anything was deleted, and the working tree no
longer carries it.

```bash
git show snapshot-pre-retirement:snapshot/index.html          # a faithful capture
git show snapshot-pre-retirement:snapshot/rendered/index.html # the browsable copy
git ls-tree -r --name-only snapshot-pre-retirement -- snapshot/
```

Both preconditions were met. **The tag was pushed first** — a local-only tag dies with the laptop —
and **#109's rewrite had already run**, which mattered because a rewrite silently orphans tags and
doing this first would have meant doing it twice.

**`v1-legacy` could not serve, and that was checkable in one command.** #45 wondered whether it might
already cover the deletion. `git ls-tree -r v1-legacy` returns zero files under `snapshot/`:
`v1-legacy` is the old PHP _source_, and `snapshot/` was a crawl of the _rendered_ site captured
2026-08-15, after that commit. Different artifacts, and one never contained the other.

**The whole directory went, including the derived `snapshot/rendered/`.** Keeping the rendered copy
was considered and rejected: it is 7.7 MB of the 8.0, it is the deliberately _unfaithful_ copy
(html5shiv and the Unity Web Player are stripped out of it), and it carries six YouTube poster frames
— the class of third-party artwork #109 item 7 had just removed from `src/assets/images/`. Nothing in
it is uniquely preserved by keeping it: 54 of its files are at `assets-pre-cleanup`, its 14 blog
images are byte-identical to `content/archive/`'s, and the other 28 derive from the captures on the
tag.

**An archive tag is not a new convention here.** `assets-pre-cleanup` already is one — it exists so
`git show assets-pre-cleanup:resources/images/ASSET_INVENTORY.md` resolves after a deletion. This tag
follows its `<what>-pre-<action>` shape, and is annotated rather than lightweight so the reason
travels with it.

## If this is ever published

Only relevant if the archive goes up at a URL, which is a separate decision. Three things would need
handling first:

- **`snapshot/misc/wp-login.html` must not be served.** It is on the tag now, but it returns with any
  restore. It is a captured WordPress login page;
  hosting something phishing-shaped on the real domain invites bot traffic and reputation flags for
  no benefit.
- **`contact.html` carries the old form**, whose action target will not exist. Neuter it rather than
  shipping a form that posts into the void.
- **Expired outbound domains.** firefall.com, kaneva.com and argamestudio.org have all lapsed, and
  lapsed domains get re-registered. That is exactly the bug `links[].dead: true` exists to prevent on
  the new site, and publishing the old one verbatim reintroduces it.
