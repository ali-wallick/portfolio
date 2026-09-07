#!/usr/bin/env node
/**
 * Measures rendered characters per line of body prose, and diffs it against a
 * committed baseline.
 *
 * ## Why this exists
 *
 * `--measure` was discussed in `ch` for the life of this project, and `ch`
 * systematically understates real line length: `1ch` is the width of the `0`
 * glyph, while the average character in running prose is far narrower, so real
 * characters per line run about 1.38x the `ch` count. The "63ch" everyone had
 * in mind was ~87 characters. #253 found that by measuring, and settled
 * `--measure: 37.5rem` on a switcher.
 *
 * The rule that came out of it — *never reason about line length in `ch`;
 * measure the output* — sat in CLAUDE.md with nothing enforcing it, because
 * the number is not available from CSS, from the token, or from any check the
 * repo runs. As `docs/REBUILD-LOG.md` puts it: a value can be correct-looking,
 * documented, reviewed, and corrected once, and still never have been
 * measured. This is the missing instrument (#338).
 *
 * ## It is a ratchet, not a ceiling
 *
 * It deliberately does NOT assert 80 characters. That figure is WCAG 2.1
 * SC 1.4.8, which is **Level AAA** — the baselines actually required
 * (ADA, Section 508, EN 301 549) reference AA, which has no line-length
 * criterion at all. #253 was explicit that narrowing was a readability call
 * rather than a compliance fix, and even at today's 37.5rem some lines run
 * past 80. A ceiling here would be red on merge and would relitigate a
 * decision Ali settled on a preview.
 *
 * So it records what the site measures today and fails when that MOVES. Same
 * shape as `check-resume-print.mjs`: the value becomes a chosen number rather
 * than an unmeasured one, and a width or type change can no longer happen
 * silently.
 *
 * ## What is asserted, and what deliberately is not
 *
 * Only average and maximum characters per line. NOT the number of lines — that
 * is a property of how much prose a page has, and this repo's content model
 * turns on "adding a project is one Markdown file." A guard that made a new
 * write-up fail the build until someone re-baselined it would be fighting the
 * rule the whole content model is built on. Average is a property of the
 * COLUMN, not of the amount of text in it, so it stays put when prose is added
 * and moves when a width or a type size does — which is the sensitivity worth
 * having.
 *
 * For the same reason a route that is not in the baseline is reported and
 * passes. Only routes present in both are diffed.
 *
 * ## Two ways this measurement has already been got wrong
 *
 * Both from #253's own run, and both worth not repeating:
 *
 *   - A line count taken from `Range.getClientRects()` over a FLEX CONTAINER
 *     returns one rect per flex item, not per line — it reported "10 rows" for
 *     every card. This walks text nodes inside prose blocks instead, where a
 *     rect really is a line box.
 *   - A verification asserted a prose width taken from an earlier RIGHT-EDGE
 *     number and failed six times against correct code. Nothing here derives a
 *     width from an edge coordinate; characters are counted directly.
 *
 * Usage:
 *   node scripts/check-line-length.mjs           # diff against the baseline
 *   node scripts/check-line-length.mjs --update  # rewrite the baseline
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { launchChromium } from './lib/launch-chromium.mjs';
import { serveDist } from './lib/serve-dist.mjs';
import { walkFiles } from './lib/walk-files.mjs';

const DIST = path.resolve('dist');
const BASELINE = path.resolve('scripts/line-length-baseline.json');
const UPDATE = process.argv.includes('--update');

/*
 * A fixed viewport, for the same reason `resume-headroom.mjs` pins 701x960:
 * line length is a function of the column, and the column is a function of the
 * viewport until it hits `--content-max`. 1280 is the width #253 measured at
 * and the width the design was reviewed at, so it is the width the baseline
 * means. Never Playwright's default.
 */
const VIEWPORT = { width: 1280, height: 900 };

/*
 * Prose only, and getting this scope right is most of the work.
 *
 * Measured with a naive `main p, main li` first, which put the homepage at 6.4
 * average characters and `/projects` at 21.9 — both were reading CARD GRIDS,
 * where every `<li>` is a link tile holding a title. A number like that is not
 * a wrong measurement of line length, it is a measurement of something else,
 * and averaged in it dragged the site's figure from the mid-70s to 63.
 *
 * So: paragraphs and list items in the page's own reading flow, minus the
 * things that are shaped like prose and are not.
 *
 * `.lede` is excluded for a different reason than the rest — it IS prose, but
 * it is 20px type, so it clears 80 characters at the same column width (#253
 * measured it at 67 avg). Folding it in would move the average without any
 * reading surface having changed.
 */
const PROSE_SELECTOR = 'main p, main li';

/* Metadata that happens to be marked up as a paragraph: the breadcrumb, the
   status/year/role strip, the section eyebrows, image captions. */
const NOT_PROSE = '.lede, .eyebrow, .breadcrumb, .meta-strip, .meta, figcaption';

/* Containers whose children are links or tiles rather than sentences. Both
   grids on `/projects` are lists of `<li>` link tiles, so every one of them
   reads as a "line" of about a dozen characters: unexcluded they put that
   route at 12.6 average, which is a fact about a card and not about prose. */
const NOT_PROSE_ANCESTOR =
  '.card-grid, .tile-grid, .page-head, .site-header, .site-footer, nav, figcaption';

/*
 * ## The tolerances, and why they are not one number
 *
 * Text rasterization differs between browser builds — CoreText on macOS,
 * FreeType on Linux, and the fallback Chromium a Claude Code web session uses
 * against the pinned one CI and Ali's machine run. Any of those can move a word
 * across a line break, and where that happens the two lines' character counts
 * both change. This is the same effect that forced the tolerances in
 * `check-resume-print.mjs`, and it is why the first CI run of this guard went
 * red on a baseline recorded elsewhere.
 *
 * The size of that noise depends entirely on how many lines a route has, which
 * is why a single tolerance cannot work. One word moving is the whole story on
 * an 8-line page and nothing on a 60-line one — the standard error of a mean
 * falls as 1/sqrt(n). Measured across the two environments here: 8 lines moved
 * 6.9 characters, 9 lines moved 4.3, and the 300-line sitewide figure moved
 * 0.7.
 *
 * So the SITEWIDE average is the real assertion — it is the statistic a width
 * or type change actually moves (37.5rem → 34rem moved it 5.2), and 300 lines
 * make it stable. Per-route checks localise a change, with a band that widens
 * as a route gets shorter.
 *
 * Maximum is recorded but NOT asserted. It is one unlucky long word either way
 * and carries no signal the average does not.
 */
const OVERALL_TOLERANCE = 1.5;
const ROUTE_TOLERANCE_BASE = 1.0;
const ROUTE_TOLERANCE_SCALED = 20;
const routeTolerance = (lines) =>
  ROUTE_TOLERANCE_BASE + ROUTE_TOLERANCE_SCALED / Math.sqrt(Math.max(lines, 1));

if (!existsSync(DIST)) {
  console.error('✗ dist/ does not exist — run `npm run build` first.');
  process.exit(1);
}

const routes = (await walkFiles(DIST))
  .filter((f) => f.endsWith('.html'))
  .map((f) => {
    const rel = '/' + path.relative(DIST, f).split(path.sep).join('/');
    return rel === '/index.html' ? '/' : rel.replace(/(?:\/index)?\.html$/, '');
  })
  .sort();

const { origin, close } = await serveDist(DIST);
const browser = await launchChromium();
const chromiumVersion = browser.version();
const page = await browser.newPage({ viewport: VIEWPORT });

/** @type {Record<string, {lines: number, avg: number, max: number}>} */
const measured = {};

for (const route of routes) {
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });

  const stats = await page.evaluate(
    ({ selector, notProse, notProseAncestor }) => {
      /*
       * Bucket characters into visual lines by the `top` of a one-character
       * Range. A Range over a text node yields one rect per line box, but a
       * single line can be shared by several text nodes (a link mid-sentence),
       * so the bucket key has to be the line's position within the block rather
       * than the node it came from.
       */
      const lines = [];
      for (const block of document.querySelectorAll(selector)) {
        if (block.matches(notProse) || block.closest(notProseAncestor)) continue;
        /** @type {Map<number, number>} */
        const byTop = new Map();
        const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
        const range = document.createRange();
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const text = node.nodeValue ?? '';
          for (let i = 0; i < text.length; i++) {
            range.setStart(node, i);
            range.setEnd(node, i + 1);
            const rect = range.getBoundingClientRect();
            // A collapsed rect is a character that renders nothing (a line's
            // trailing space); it belongs to no line box.
            if (rect.width === 0 && rect.height === 0) continue;
            const key = Math.round(rect.top);
            byTop.set(key, (byTop.get(key) ?? 0) + 1);
          }
        }
        const tops = [...byTop.keys()].sort((a, b) => a - b);
        // The last line of a block is short by definition — it ends where the
        // sentence does, not where the column does — so it says nothing about
        // the column's width. #253 measured "full lines" for the same reason.
        for (const t of tops.slice(0, -1)) lines.push(byTop.get(t));
      }
      return lines;
    },
    { selector: PROSE_SELECTOR, notProse: NOT_PROSE, notProseAncestor: NOT_PROSE_ANCESTOR },
  );

  if (stats.length === 0) continue;
  const avg = stats.reduce((a, b) => a + b, 0) / stats.length;
  measured[route] = {
    lines: stats.length,
    avg: Math.round(avg * 10) / 10,
    max: Math.max(...stats),
  };
}

await browser.close();
close();

const totalLines = Object.values(measured).reduce((a, r) => a + r.lines, 0);
const overallAvg =
  Object.values(measured).reduce((a, r) => a + r.avg * r.lines, 0) / (totalLines || 1);

if (UPDATE) {
  await writeFile(
    BASELINE,
    JSON.stringify(
      {
        note: 'Rendered characters per full line of body prose. Regenerate with `npm run update:line-length`. See scripts/check-line-length.mjs — this is a ratchet, not an 80-character ceiling.',
        viewport: VIEWPORT,
        selector: PROSE_SELECTOR,
        excluded: { self: NOT_PROSE, ancestor: NOT_PROSE_ANCESTOR },
        measure: 'src/styles/tokens.css --measure',
        overallAvg: Math.round(overallAvg * 10) / 10,
        environment: { platform: process.platform, chromium: chromiumVersion },
        routes: measured,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    `✓ line-length baseline written — ${totalLines} full lines across ${Object.keys(measured).length} routes, ${overallAvg.toFixed(1)} avg chars.`,
  );
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.error('✗ no line-length baseline — run `npm run update:line-length` first.');
  process.exit(1);
}

const baseline = JSON.parse(await readFile(BASELINE, 'utf8'));
const problems = [];
const unmeasured = [];

/* The sitewide figure first: it is the assertion that matters, and a per-route
   list is far easier to read once you know whether the whole site moved. */
if (Math.abs((baseline.overallAvg ?? 0) - overallAvg) > OVERALL_TOLERANCE) {
  problems.push(
    `sitewide: average ${baseline.overallAvg} → ${overallAvg.toFixed(1)} chars/line across ${totalLines} lines`,
  );
}

for (const [route, cur] of Object.entries(measured)) {
  const base = baseline.routes?.[route];
  if (!base) {
    unmeasured.push(route);
    continue;
  }
  const tolerance = routeTolerance(Math.min(base.lines, cur.lines));
  if (Math.abs(base.avg - cur.avg) > tolerance) {
    problems.push(
      `${route}: average ${base.avg} → ${cur.avg} chars/line (±${tolerance.toFixed(1)} allowed on ${cur.lines} lines)`,
    );
  }
}

/*
 * A route the baseline covers and this run did not measure is a silent loss of
 * coverage, not a pass: its prose moved under an excluded ancestor, or its
 * blocks collapsed to a single line box, or the page is gone. Iterating only
 * over what was measured would print ✓ in all three cases.
 *
 * This is the opposite call from a route that is NEW, which passes on purpose —
 * see the header. Adding a page must stay free; losing one quietly must not.
 */
for (const route of Object.keys(baseline.routes ?? {})) {
  if (!(route in measured)) {
    problems.push(
      `${route}: in the baseline but measured no prose this run (page gone, or its prose is no longer selected)`,
    );
  }
}

if (problems.length === 0) {
  const extra = unmeasured.length ? ` (${unmeasured.length} new route(s) not yet in baseline)` : '';
  console.log(
    `✓ prose line length matches the baseline — ${overallAvg.toFixed(1)} avg chars across ${totalLines} lines${extra}.`,
  );
  process.exit(0);
}

console.error('✗ prose line length moved from the committed baseline:\n');

/* Say up front when the machine reading the baseline is not the machine that
   wrote it. `check-resume-print.mjs` added the same line after #284, where its
   absence cost an hour of investigation into a difference that was never a
   regression. */
const recorded = baseline.environment;
if (recorded && (recorded.platform !== process.platform || recorded.chromium !== chromiumVersion)) {
  console.error(
    `  note: baseline recorded on ${recorded.platform} / Chromium ${recorded.chromium}; ` +
      `this run is ${process.platform} / Chromium ${chromiumVersion}.\n`,
  );
}

for (const p of problems) console.error(`  ${p}`);
console.error(
  `\n  Overall: ${baseline.overallAvg} → ${overallAvg.toFixed(1)} avg chars per line.\n` +
    '  A width or type change is the usual cause — `--measure` in src/styles/tokens.css.\n' +
    '  If it is intended, run `npm run update:line-length` and commit the new baseline.',
);
process.exit(1);
