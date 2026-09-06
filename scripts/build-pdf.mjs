#!/usr/bin/env node
/**
 * Renders the resume pages to PDF using the site's own print stylesheet, and
 * checks that the committed PDFs are still current.
 *
 * Phase 4 chose a single source for the resume: `/resume` and `/resume/full`
 * are generated from the `jobs` and `education` collections, and these PDFs are
 * generated from those pages. Nothing is maintained twice, so the PDF a
 * recruiter opens cannot disagree with the page — which is the specific bug the
 * old site shipped for years, describing the Marvel game as "upcoming" on
 * several pages at once because each page owned its own copy of the fact.
 *
 * ## Why the PDFs are committed rather than generated on every deploy
 *
 * The gate's plan was to generate them during the Cloudflare build. That turns
 * out to be impossible, and it is worth writing down so nobody spends an
 * afternoon rediscovering it: Cloudflare's build image is Ubuntu 24.04 with a
 * fixed apt package list that has `libgbm1` but not `libatk-1.0.so.0`, so
 * Chromium downloads fine and then dies at launch with "error while loading
 * shared libraries". `playwright install-deps` cannot fix it either — the
 * builder has no root, and the attempt fails with `su: Authentication failure`.
 * GitHub Actions has no such problem; its runners ship the desktop libs.
 *
 * So the PDFs live in `public/`, committed, and Astro copies them into `dist/`.
 * Cloudflare serves them without needing a browser at all.
 *
 * That reintroduces a drift risk, which this repo does not accept on a
 * handshake — so `--check` recomputes a hash of every input that can change the
 * PDFs and fails if the committed files are stale. It needs no browser, so it
 * runs on Cloudflare too: a deploy carrying an out-of-date resume fails rather
 * than shipping.
 *
 * A second reason committing beats regenerating per-deploy, though a weaker
 * one since #191: `--font-body` used to be `system-ui`, resolving to a
 * different typeface on macOS than on Linux, so a committed PDF was the only
 * way to guarantee it was the one Ali actually looked at. It now names a
 * specific self-hosted face (Public Sans), so a Linux re-render is no longer
 * a different document — but Cloudflare still can't produce one at all, which
 * is reason enough on its own.
 *
 * That paragraph was aspirational until #306: naming the face was necessary
 * and not sufficient, because nothing here loaded it. See the print-media
 * emulation in the render loop and `assertPrintFace` below.
 *
 * ## Two implementation choices worth not undoing
 *
 *   1. **It serves `dist/` over HTTP rather than loading `file://`.** Every
 *      internal href on this site is root-relative (`/about`, `/_astro/...`),
 *      which is a rule `scripts/check-links.mjs` enforces. Under `file://`
 *      those resolve against the filesystem root and silently fetch nothing —
 *      you get a PDF that looks almost right and is missing its stylesheet.
 *
 *   2. **It fails loudly.** A skipped or stale PDF leaves the "Download PDF"
 *      link pointing at the wrong thing, and that is exactly the class of bug
 *      this repo's checks exist to catch. Degrading quietly would trade a
 *      visible build failure for an invisible site failure.
 *
 * ## Regeneration is skipped when nothing changed
 *
 * Chromium's PDF output isn't byte-deterministic — it stamps `/CreationDate`,
 * `/ModDate`, and a random `/ID` into every render — so re-running this
 * script against an *unchanged* resume used to still rewrite `public/*.pdf`
 * with new bytes every time. That turned `npm run build` (which `verify` and
 * a normal local workflow both call) into a guaranteed dirty diff on two
 * binary files, commit after commit, with no actual content change behind
 * it. So before launching a browser, this script compares the current input
 * hash against the one recorded in the lock file and exits early if they
 * match — the same hash `--check` already computes, reused here as a cache
 * gate instead of only a CI assertion. Pass `--force` to regenerate anyway
 * (e.g. after touching an input the hash doesn't cover, or to refresh the
 * committed files' internal timestamps on purpose).
 *
 * The hash has two halves (#114). Everything that renders the document —
 * components, stylesheets, config — is hashed by raw bytes. The `jobs` and
 * `education` collections are hashed by their PARSED front matter, so editing
 * a comment in a content file no longer reports the PDFs as stale. See
 * `byteHashedFiles` and `CONTENT_COLLECTIONS` below.
 *
 * Usage:
 *   node scripts/build-pdf.mjs            # regenerate if inputs changed (needs Chromium)
 *   node scripts/build-pdf.mjs --force    # regenerate unconditionally
 *   node scripts/build-pdf.mjs --check    # verify the committed PDFs are current
 */

import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { serveDist } from './lib/serve-dist.mjs';
import { readEntries } from './lib/frontmatter.mjs';
import { launchChromium } from './lib/launch-chromium.mjs';
import { openPrintPage } from './lib/print-page.mjs';

const CHECK_ONLY = process.argv.includes('--check');
const DIST = path.resolve('dist');
const PUBLIC = path.resolve('public');
const LOCK = path.resolve('scripts/resume-pdf.lock.json');

/**
 * Every file that can change what the PDFs look like, hashed by raw bytes. If
 * you add one — a new component the resume renders, a stylesheet it imports —
 * add it here, or the staleness check silently stops covering it.
 *
 * The jobs and education collections are NOT here: they are hashed
 * semantically instead, by CONTENT_COLLECTIONS below.
 */
function byteHashedFiles() {
  return [
    'src/components/ResumeDocument.astro',
    'src/components/ResumeActions.astro',
    'src/pages/resume.astro',
    'src/pages/resume/full.astro',
    'src/styles/resume.css',
    'src/styles/tokens.css',
    'src/styles/base.css',
    'src/config/site.ts',
    // Added 2026-08-26 (#32) after it shipped a stale PDF. This file has been
    // a PDF input since #39 put the Skills section in it, and was never listed
    // — so `check:pdf` passed on a resume whose Skills row had changed. #32
    // widened the gap by adding the summary, the personal projects, and the
    // header location here too, then walked straight into it: an edit that
    // touched only this file reported "nothing changed" while
    // `check:resume-print` reported 17 moved elements on /resume/full.
    //
    // Two guards on different mechanisms disagreeing is what surfaced it, and
    // it is the second time on this pass that the geometry differ caught what
    // the hash-and-count guards could not. Deliberately NOT adding
    // `src/lib/links.ts`, which ResumeDocument also imports: it contributes
    // only `target`/`rel`, which cannot change a rendered page's appearance,
    // and listing files that can't invalidate the output trains people to
    // ignore the invalidation.
    'src/config/resume.ts',
    'src/lib/content.ts',
    'src/content.config.ts',
    // The density toggle's script — the opposite call from the links.ts
    // exclusion above, and the distinction is worth stating. links.ts
    // contributes only `target`/`rel`, which cannot change a rendered page's
    // appearance. This script executes inside the exact Playwright navigation
    // that prints the PDFs, and its entire job is mutating the attribute the
    // both-media density rule in resume.css keys off. Today it is a no-op on
    // a fresh, hash-less load BY DESIGN (its init never writes to the
    // article) — but a future bug that flips density on load would change the
    // printed PDF, and that is precisely the invalidation this hash exists to
    // catch. resume.astro's inline #detailed script is covered already: the
    // page file is byte-hashed above.
    'src/scripts/resume-density.ts',
  ].sort();
}

/**
 * Hashed by their PARSED front matter rather than their bytes (#114).
 *
 * These two collections carry a lot of explanatory prose — src/content/jobs/
 * second-dinner.md opens with ~25 comment lines before its first bullet — and
 * byte-hashing meant recording a decision in a comment cost a Chromium regen
 * and a binary diff on public/*.pdf for zero visible difference. Comments and
 * formatting do not survive YAML parsing, so hashing the parsed data drops
 * exactly the noise and keeps every field that renders.
 *
 * Markdown BODIES are excluded along with the comments, because
 * ResumeDocument.astro renders no body — only front matter fields. That is not
 * a standing assumption anyone has to remember: ResumeDocument.astro is itself
 * byte-hashed above, so the commit that taught it to render a body would
 * invalidate the hash at that moment, which is when someone would come back
 * here.
 */
const CONTENT_COLLECTIONS = ['src/content/jobs', 'src/content/education'];

/**
 * Stable JSON: object keys sorted at every depth, array order preserved.
 *
 * Key order in a YAML file is authoring order, so without this a bullet moved
 * within its own group — which changes nothing about the parsed values — would
 * still read as a change. Array order is meaningful and deliberately kept:
 * `highlights` order drives the resume's grouping (see CLAUDE.md).
 */
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const body = Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
      .join(',');
    return `{${body}}`;
  }
  return JSON.stringify(value ?? null);
}

async function inputHash() {
  const hash = createHash('sha256');
  for (const file of byteHashedFiles()) {
    hash.update(file);
    hash.update(await readFile(file));
  }
  for (const dir of CONTENT_COLLECTIONS) {
    hash.update(dir);
    for (const { slug, data } of await readEntries(dir)) {
      hash.update(slug);
      hash.update(stableStringify(data));
    }
  }
  return hash.digest('hex');
}

/**
 * The PostScript name prefix every font embedded in these PDFs must carry.
 *
 * It comes from the name table inside `@fontsource/public-sans`'s own file, so
 * it is the same string on every platform — the whole reason #191 self-hosted
 * the face rather than naming `system-ui`. (The file's internal name is
 * `PublicSansThin-Regular`/`-Bold`, an upstream naming quirk in Public Sans's
 * static instances. The `@font-face` rule declares weight 400/700 and that is
 * what governs rendering, so the string is cosmetic — matched by prefix here
 * so a future @fontsource metadata fix doesn't read as a substitution.)
 */
const PRINT_FACES = ['PublicSans', 'Gabarito'];
/* Gabarito joined on #235: the name is set in the site's display face on
   paper, so its subset is embedded beside Public Sans. Both self-hosted
   via @fontsource, both OFL. Anything else is a platform fallback. */
const PRINT_FACE = PRINT_FACES.join(' + ');

/**
 * Every embedded font, by PostScript name with its subset tag stripped.
 * Chromium writes `/BaseFont /AAAAAA+PublicSansThin-Regular`; the six-letter
 * tag is per-subset and carries no meaning here.
 */
function embeddedFonts(buffer) {
  return [
    ...new Set(
      [
        ...buffer
          .toString('latin1')
          // `/FontName` as well as `/BaseFont`: a Type 3 font — which is how
          // Chromium embeds a VARIABLE font's instance — has no BaseFont at
          // all, so a BaseFont-only scan was blind to exactly the case #235
          // hit: a name set in Gabarito Variable passed this guard while being
          // Type 3, the one kind of PDF text ATS parsers most often cannot
          // read. FontName sits in every embedded font's descriptor.
          .matchAll(/\/(?:BaseFont|FontName)\s*\/([A-Za-z0-9+#\-_,.]+)/g),
      ].map((m) => m[1].replace(/^[A-Z]{6}\+/, '')),
    ),
  ];
}

/**
 * Fails on a PDF set in anything but the chosen face — the guard #306 found
 * missing, and the one check here that reads the PDFs' actual bytes.
 *
 * Deliberately NOT a byte or content-stream comparison against a freshly
 * rendered reference, which is where that issue's options started. Glyph IDs
 * are indices into an embedded subset, so two renders of an identical document
 * subset differently and diff as thousands of meaningless changes; and
 * Chromium stamps a fresh `/CreationDate`, `/ModDate` and `/ID` into every
 * render, so the bytes never match anyway. The property that was actually
 * drifting is *which face got embedded*, and that is a fact the committed file
 * states about itself — so this needs no browser, no reference render, and no
 * tolerance, and runs identically here and under `--check` on Cloudflare.
 *
 * What it deliberately does not police is the subset count (9 on macOS, 3 on
 * Linux, per #306). Two engines subsetting the same face differently is not a
 * defect: same glyphs, same metrics, same rendering. Gating on it would fail a
 * build for the platform it ran on.
 */
function assertPrintFace(label, buffer) {
  const fonts = embeddedFonts(buffer);
  const wrong = fonts.filter((name) => !PRINT_FACES.some((f) => name.startsWith(f)));
  // Chromium names a variable instance `Gabarito-Regular_Bold` and embeds it
  // as Type 3; the static file embeds as `Gabarito-Bold`, a real face. A
  // `/Subtype /Type3` anywhere in the file is the direct test.
  if (wrong.length === 0 && /\/Subtype\s*\/Type3/.test(buffer.toString('latin1'))) {
    return (
      `${label} embeds a Type 3 font (${fonts.filter((n) => n.includes('_')).join(', ') || 'unnamed'}) — ` +
      'a variable font instance drawn as glyph procedures, which ATS parsers cannot read. Name the ' +
      'static face; see the Gabarito import in src/pages/resume.astro.'
    );
  }
  if (wrong.length === 0) return null;
  return (
    `${label} embeds ${wrong.join(', ')} instead of ${PRINT_FACE} — the print face fell back to a ` +
    'platform font. Fonts used only under @media print are fetched lazily, so the page must be ' +
    "switched to print media BEFORE awaiting document.fonts.ready (see the render loop). If you're " +
    'checking a committed PDF, regenerate it: npm run build:pdf -- --force'
  );
}

if (CHECK_ONLY) {
  const expected = await inputHash();
  const missing = ['resume.pdf', 'resume-full.pdf'].filter(
    (f) => !existsSync(path.join(PUBLIC, f)),
  );
  if (missing.length > 0) {
    console.error(`✗ missing committed resume PDFs: ${missing.join(', ')}`);
    console.error('  Run: npm run build:pdf   (then commit public/*.pdf)');
    process.exit(1);
  }
  const recorded = existsSync(LOCK) ? JSON.parse(await readFile(LOCK, 'utf8')).inputHash : null;
  if (recorded !== expected) {
    console.error('✗ the committed resume PDFs are stale.');
    console.error('  Resume content or layout changed since they were last generated.');
    console.error('  Run: npm run build:pdf   (then commit public/*.pdf and the lock file)');
    process.exit(1);
  }
  // The one assertion here that reads the PDFs rather than hashing their
  // inputs (#306). The hash above proves the committed files were built from
  // today's resume; it says nothing about HOW they were built, which is how a
  // pair of PDFs set in a platform fallback face passed CI for months. Cheap
  // and browser-free, so it runs on Cloudflare alongside the staleness check.
  const wrongFace = [];
  for (const file of ['resume.pdf', 'resume-full.pdf']) {
    const problem = assertPrintFace(file, await readFile(path.join(PUBLIC, file)));
    if (problem) wrongFace.push(problem);
  }
  if (wrongFace.length > 0) {
    console.error('✗ the committed resume PDFs are set in the wrong face.');
    for (const problem of wrongFace) console.error(`  ${problem}`);
    process.exit(1);
  }

  console.log(`✓ committed resume PDFs are current, and set in ${PRINT_FACE}.`);
  process.exit(0);
}

if (!existsSync(DIST)) {
  console.error(`✗ ${DIST} does not exist — run \`astro build\` first.`);
  process.exit(1);
}

const FORCE = process.argv.includes('--force');
const pdfsExist = ['resume.pdf', 'resume-full.pdf'].every((f) => existsSync(path.join(PUBLIC, f)));

if (!FORCE && pdfsExist && existsSync(LOCK)) {
  const recorded = JSON.parse(await readFile(LOCK, 'utf8')).inputHash;
  if (recorded === (await inputHash())) {
    console.log('✓ resume PDFs already current — nothing changed, skipping regeneration.');
    console.log('  (pass --force to regenerate anyway)');
    process.exit(0);
  }
}

/**
 * Each page, its output file, and the page count it must not exceed.
 *
 * The limits are the point of the whole two-density design: `/resume` is the
 * one-pager you attach to an application, and bullets accumulate. Without an
 * assertion, the day someone adds a sixth Second Dinner highlight is the day
 * the "one page" resume quietly becomes two — and nobody finds out until it is
 * already in front of a hiring manager.
 */
const TARGETS = [
  { route: '/resume', out: 'resume.pdf', maxPages: 1 },
  { route: '/resume/full', out: 'resume-full.pdf', maxPages: 2 },
];

const { origin, close: closeServer } = await serveDist(DIST);

/**
 * Chromium writes a page tree whose root node carries `/Count N`. Parsed rather
 * than assumed, because "the one-pager is one page" is only a useful guarantee
 * if something actually checks it.
 */
function countPages(buffer) {
  const text = buffer.toString('latin1');
  const counts = [...text.matchAll(/\/Type\s*\/Pages\b[\s\S]{0,400}?\/Count\s+(\d+)/g)].map((m) =>
    Number(m[1]),
  );
  if (counts.length > 0) return Math.max(...counts);
  const leaves = [...text.matchAll(/\/Type\s*\/Page(?![s\w])/g)].length;
  return leaves > 0 ? leaves : null;
}

/**
 * #286: a root-relative href on a printed page resolves against whatever
 * origin Chromium navigated to — the ephemeral `127.0.0.1:<port>` this script
 * serves `dist/` on — and Chromium bakes that absolute (and dead) URL into
 * the PDF's link annotation. Every internal link this document renders must
 * be written absolute (`site.url`-based) so there is nothing for the local
 * server's origin to leak into. This is the backstop: it fails loudly if a
 * future link regresses to root-relative instead of letting the ephemeral
 * port ship silently into the PDF, as it did here.
 */
function findLocalhostAnnotations(buffer) {
  const text = buffer.toString('latin1');
  return [...text.matchAll(/\/URI\s*\(([^)]*)\)/g)]
    .map((m) => m[1])
    .filter((uri) => /127\.0\.0\.1|localhost/i.test(uri));
}

let browser;
const problems = [];

try {
  browser = await launchChromium();
  // The print stylesheet forces the paper palette, but a dark-mode context
  // would still evaluate the dark tokens first — start light and let @media
  // print be a backstop rather than the only defence.
  const context = await browser.newContext({ colorScheme: 'light' });

  for (const { route, out, maxPages } of TARGETS) {
    // Navigates, waits for the print stylesheet's fonts to actually load, and
    // returns a page under print media — see scripts/lib/print-page.mjs for
    // why the ordering matters (#306) and what assertPrintFace below is for.
    let page;
    try {
      page = await openPrintPage(context, `${origin}${route}`);
    } catch (err) {
      // A non-OK response carries its status; anything else (Chromium died,
      // the server went away) keeps its real message rather than being
      // reported as "no response".
      problems.push(err.status ? `${route} returned ${err.status}` : `${route}: ${err.message}`);
      continue;
    }

    const buffer = await page.pdf({
      // `@page` in src/styles/resume.css owns size and margins, so the print
      // stylesheet stays the single place paper geometry is decided.
      preferCSSPageSize: true,
      printBackground: false,
    });
    await page.close();

    // `public/` is the committed artifact and the thing Cloudflare actually
    // serves (Astro copies it into dist/). Writing dist/ too means a fresh
    // local build has the current PDF at /resume.pdf immediately, instead of
    // serving last build's copy until the next one.
    await writeFile(path.join(PUBLIC, out), buffer);
    await copyFile(path.join(PUBLIC, out), path.join(DIST, out));

    const localhostLinks = findLocalhostAnnotations(buffer);
    if (localhostLinks.length > 0) {
      problems.push(
        `${out} carries a link annotation pointing at the local dev server: ${localhostLinks.join(', ')} — write the source href absolute (site.url-based) instead of root-relative`,
      );
    }

    const wrongFace = assertPrintFace(out, buffer);
    if (wrongFace) problems.push(wrongFace);

    const pages = countPages(buffer);
    const size = (buffer.length / 1024).toFixed(0);
    if (pages === null) {
      console.log(`  ${out} — ${size} KB (page count unreadable)`);
    } else if (pages > maxPages) {
      problems.push(
        `${out} is ${pages} pages, limit ${maxPages} — trim highlights, or move a bullet to highlightsExtended`,
      );
    } else {
      console.log(`  ${out} — ${pages}/${maxPages} page(s), ${size} KB`);
    }
  }
} catch (error) {
  if (error?.code === 'ERR_MODULE_NOT_FOUND') {
    console.error('✗ playwright is not installed. Run: npm ci && npx playwright install chromium');
  } else {
    console.error(`✗ PDF generation failed: ${error?.message ?? error}`);
  }
  problems.push('see above');
} finally {
  await browser?.close();
  closeServer();
}

if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} problem(s) generating resume PDFs:\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

// Written last, and only on success: the lock records which inputs these PDFs
// were built from, so `--check` can tell a fresh artifact from a stale one
// without a browser. Recording it after a partial failure would assert
// freshness that isn't true.
await writeFile(
  LOCK,
  JSON.stringify(
    {
      comment:
        'Generated by scripts/build-pdf.mjs. Records the inputs public/*.pdf were built from, so a stale resume fails CI instead of shipping. Do not edit by hand — run `npm run build:pdf`.',
      inputHash: await inputHash(),
    },
    null,
    2,
  ) + '\n',
);

console.log(`✓ ${TARGETS.length} resume PDFs generated from the site's own print stylesheet.`);
console.log('  Committed to public/ — remember to commit them alongside content changes.');
