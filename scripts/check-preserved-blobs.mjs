#!/usr/bin/env node
/**
 * Fails the build if any tracked file is one of the known-bad historical blobs
 * — the ones that picture the 2019 résumé's PO Box.
 *
 * ## The recurrence this exists for
 *
 * The old site shipped Ali's home address twice: once as
 * `resources/WallickAli-Resume.pdf`, and once as a full-page PNG render of the
 * same document embedded on `resume.html`. Both are still in git history, which
 * is fine — history is #109's problem. What is not fine is a copy sitting in
 * HEAD, where anyone browsing the repo reads it without digging.
 *
 * That has now happened twice, and the second time is the reason this file
 * exists:
 *
 *   1. `restore-snapshot.mjs`'s first run faithfully restored the *unredacted
 *      PDF* into `snapshot/rendered/`. It was committed before anyone noticed.
 *      The fix was `PREFER_WORKTREE`, a `Set` with one path in it.
 *   2. The next rebuild did the identical thing one file over, restoring
 *      `resources/images/resume.png` — and the before/after captures picked the
 *      address up a third time, off the live old site, because that page
 *      embedded the same PNG.
 *
 * **The first fix guarded a path when the risk was a class**, and
 * `docs/PRESERVATION.md`'s "A rebuild can no longer do that" was false as
 * written for exactly that reason. Naming paths in a script is necessary and
 * cannot be sufficient: the next occurrence is always the file nobody listed.
 *
 * So this checks *content*, not paths. A denylisted blob fails the build
 * wherever in the tree it lands, under whatever name, whether a script put it
 * there or a person did.
 *
 * ## What it does not catch, said plainly
 *
 * A hash match is exact. Re-encode one of these images — a different PNG
 * compressor, a WebP round-trip, one pixel changed — and the address is just as
 * legible and the hash is gone. This is **not** an address detector; there is no
 * OCR here and there should not be, because a guard that runs a recogniser over
 * every tracked byte is slow, non-deterministic, and fires on correct files.
 *
 * What it is, precisely: a guard against a script or a person reintroducing one
 * of these *specific* files, which is the failure that has actually happened,
 * twice, and both times by faithful restoration of a known blob. That is a
 * narrow guard for a narrow, demonstrated bug, which is the trade #338 asks for.
 *
 * ## Why the hashes are safe to commit
 *
 * SHA-256 is preimage-resistant: the digest of an image is not the image, and
 * nothing about the address can be recovered from it. This file names no street,
 * no box number and no ZIP — see `docs/PRESERVATION.md` for where the probe
 * strings live.
 *
 * House style follows `check-source.mjs`: zero dependencies, one `problems[]`
 * collector, no early exit, deterministic and offline. It needs no build, so it
 * runs beside `check:source` and before `build` in `verify`.
 *
 * Usage:
 *   node scripts/check-preserved-blobs.mjs         every tracked file
 *   node scripts/check-preserved-blobs.mjs <dir>   every file under <dir>
 *
 * The directory form is how the guard gets *demonstrated*: restore the pre-fix
 * blobs into a scratch directory and point it there. A guard nobody has watched
 * fail is a guard nobody has tested.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { walkFiles } from './lib/walk-files.mjs';

/**
 * The known-bad blobs, by SHA-256 of their exact bytes.
 *
 * Each entry says what the file is and what supersedes it, because the useful
 * answer to "this check failed" is never "delete it" — it is "you have the
 * unredacted version of something the repo already has a redacted version of".
 *
 * Adding an entry: `sha256sum <file>`. Record what it is and where the safe
 * replacement lives. Never record the address itself.
 */
const DENYLIST = [
  {
    sha256: '025e47a6aa90d8f5759e321127c7c7f1e9294881fce7f2d7bc5543e3c3c8b241',
    bytes: 236181,
    what: 'the old site’s resources/images/resume.png — a 1700×2200 render of the unredacted 2019 résumé',
    instead:
      'resources/resume-redacted.png, a 200-DPI render of the redacted resources/WallickAli-Resume.pdf at identical geometry',
  },
  {
    sha256: 'a95232f0ec3276bd36bf2df99aa8b4f7f7e4dae4d361afabeb7d4e8bf45aa265',
    bytes: 97766,
    what: 'the pre-redaction docs/before-after/old/resume-desktop.webp, captured from the live old résumé page',
    instead:
      'the committed capture, which carries a composited redaction bar. It cannot be re-captured — the old site went down at the 2026-08-27 cutover',
  },
  {
    sha256: '4e9daf243c13849605f4d2a762098a20bf7313aaf34b608251a67ace6c0f6358',
    bytes: 258662,
    what: 'the pre-redaction docs/before-after/old/resume-mobile.webp, same page at a mobile viewport',
    instead: 'the committed capture, which carries a composited redaction bar',
  },
  {
    sha256: '3216da67ab43b364d026ebcd4e20566720f83f17d94ab65579ee3ac87a952370',
    bytes: 98088,
    what: 'the unredacted resources/WallickAli-Resume.pdf — the 2019 résumé with its address line still in the content stream',
    instead:
      'the committed resources/WallickAli-Resume.pdf, whose address block was deleted from the content stream (not covered) on 2026-08-26',
  },
];

const seen = new Map();
for (const entry of DENYLIST) {
  if (seen.has(entry.sha256)) {
    console.error(`✗ denylist has ${entry.sha256} twice — fix this file, not the tree.`);
    process.exit(2);
  }
  seen.set(entry.sha256, entry);
}

/* Which files to read. No argument means "everything git tracks", which is the
   right set for a guard about what the repo *ships*: it excludes node_modules
   and dist without a hand-maintained ignore list, and it includes a file the
   moment it is staged. A directory argument overrides it, so the check can be
   pointed at a fixture. */
const target = process.argv[2];
let files;
let scope;

if (target) {
  if (!existsSync(target)) {
    console.error(`✗ ${target} does not exist.`);
    process.exit(2);
  }
  files = await walkFiles(target);
  scope = target;
} else {
  const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  files = execFileSync('git', ['ls-files', '-z'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
    .split('\0')
    .filter(Boolean)
    .map((f) => path.join(root, f));
  scope = 'tracked files';
}

/** A repo-relative path where that reads better than the absolute one. */
const display = (file) => {
  const rel = path.relative(process.cwd(), file);
  return rel.startsWith('..') ? file : rel;
};

/** @type {{file: string, message: string}[]} */
const problems = [];

for (const file of files) {
  /* A deleted-but-still-tracked path is a staging state, not a violation. */
  if (!existsSync(file)) continue;
  const digest = createHash('sha256')
    .update(await readFile(file))
    .digest('hex');
  const hit = seen.get(digest);
  if (!hit) continue;
  problems.push({
    file: display(file),
    message: `is ${hit.what}.\n      Use ${hit.instead}.\n      sha256 ${digest}`,
  });
}

const fileWord = files.length === 1 ? 'file' : 'files';
if (problems.length === 0) {
  console.log(
    `✓ ${files.length} ${fileWord} checked (${scope}) — none matches a known-bad preserved blob.`,
  );
  process.exit(0);
}

console.error(
  `✗ ${problems.length} known-bad preserved blob(s) in ${scope}.\n\n` +
    `  These are copies of the 2019 résumé that still show a home address. The\n` +
    `  repo keeps redacted versions of all of them; something has put an\n` +
    `  original back. See docs/PRESERVATION.md.\n`,
);
for (const { file, message } of problems) console.error(`  ${file} ${message}\n`);
process.exit(1);
