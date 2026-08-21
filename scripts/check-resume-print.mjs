#!/usr/bin/env node
/**
 * Diffs per-element print geometry for both resume routes against a
 * committed baseline. See issue #35 and CLAUDE.md's "The print block can be
 * beaten on specificity, not just on omission."
 *
 * `src/styles/resume.css`'s `@media print` block pins the paper palette by
 * redefining design tokens — and it only pins the tokens that existed when it
 * was written, so it's a denylist wearing a design system's clothes. It has
 * already been beaten twice: once by a token nobody had enumerated yet (19pt
 * of silent reflow, saved only by luck against the page-count assertion), and
 * once on pure CSS specificity (a screen selector outranked the print block's
 * bare `:root`, putting 28 elements in the wrong colour with no build signal
 * at all — colour costs no height, and the page-count assertion is the only
 * other guard that exists).
 *
 * This script is what actually found both. For every element on `/resume`
 * and `/resume/full`, under `page.emulateMedia({ media: 'print' })`, it
 * records position, size, font family/size/weight, letter-spacing, and
 * colour — then diffs that against a committed baseline. A leak that costs
 * zero pages and zero bytes still shows up as a named element with a named
 * property that moved.
 *
 * ## Why this runs in `npm run verify` and nowhere near `npm run build` or CI
 *
 * `--font-body` is `system-ui`, which resolves to a different (and smaller)
 * typeface on Linux than on the macOS machine that captures the baseline —
 * the exact reason `.github/workflows/ci.yml` already declines to
 * byte-compare the committed resume PDFs across platforms. A fine-grained
 * geometry diff would false-positive on that same font substitution, on
 * nearly every element, on every CI run. So this stays a local, macOS-authored
 * guard, like the committed PDFs themselves: wired into `verify`, never into
 * `build`, `build:pdf`, `check:pdf`, or the GitHub Actions workflow.
 *
 * Usage:
 *   node scripts/check-resume-print.mjs            # diff against the baseline
 *   node scripts/check-resume-print.mjs --update    # regenerate the baseline
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { serveDist } from './lib/serve-dist.mjs';

const UPDATE = process.argv.includes('--update');
const DIST = path.resolve('dist');
const BASELINE = path.resolve('scripts/resume-print-baseline.json');

const ROUTES = ['/resume', '/resume/full'];

/** Properties captured per element, mapped from the issue's "position, size,
 * font, weight, family, tracking and colour". `backgroundColor` is one
 * addition beyond that literal list: the Phase 5 bug that motivated this
 * script was a colour-token leak, and the print block pins several
 * background-ish tokens (--color-accent-soft, --color-plate, the
 * --chip-*-tint pairs) that `color` alone wouldn't catch a regression on.
 * `lineHeight` is deliberately not captured — a line-height regression
 * already shows up generically as a `height` change in the rect, so a
 * separate field would be redundant. */
const STYLE_PROPS = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'letterSpacing',
  'color',
  'backgroundColor',
];

if (!existsSync(DIST)) {
  console.error(`✗ ${DIST} does not exist — run \`astro build\` first.`);
  process.exit(1);
}

if (!UPDATE && !existsSync(BASELINE)) {
  console.error('✗ no committed print-geometry baseline yet.');
  console.error('  Run: node scripts/check-resume-print.mjs --update');
  console.error('  Then commit scripts/resume-print-baseline.json.');
  process.exit(1);
}

const { origin, close: closeServer } = await serveDist(DIST);

let browser;
/** @type {Record<string, Array<{path: string, rect: {x:number,y:number,width:number,height:number}} & Record<string,string>>>} */
const captured = {};

try {
  const { chromium } = await import('playwright');
  browser = await chromium.launch();
  const context = await browser.newContext({ colorScheme: 'light' });

  for (const route of ROUTES) {
    const page = await context.newPage();
    const response = await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    if (!response || !response.ok()) {
      console.error(`✗ ${route} returned ${response ? response.status() : 'no response'}`);
      process.exit(1);
    }

    await page.emulateMedia({ media: 'print' });
    // Chromium will happily lay out mid-glyph-load and hand back fallback
    // metrics — same hazard scripts/build-pdf.mjs guards against.
    await page.evaluate(() => document.fonts.ready);

    captured[route] = await page.evaluate((styleProps) => {
      /** A DOM path from <body>, e.g.
       *  body > article.resume > section.resume-section:nth-of-type(1) > ...
       *  Positional, not semantic — there's no data-* id infrastructure on
       *  the resume, and adding one just for this script would be scope
       *  creep. A content edit (new job, new bullet) shifts later siblings'
       *  indices and shows up as added/removed paths, same as a content edit
       *  already invalidates scripts/resume-pdf.lock.json. */
      function elementPath(el) {
        const segments = [];
        let node = el;
        while (node && node !== document.body) {
          const tag = node.tagName.toLowerCase();
          const cls =
            node.className && typeof node.className === 'string'
              ? '.' + node.className.trim().split(/\s+/).join('.')
              : '';
          const siblings = [...node.parentElement.children].filter(
            (n) => n.tagName === node.tagName,
          );
          const index = siblings.indexOf(node) + 1;
          segments.unshift(`${tag}${cls}:nth-of-type(${index})`);
          node = node.parentElement;
        }
        return ['body', ...segments].join(' > ');
      }

      const all = [document.body, ...document.body.querySelectorAll('*')];
      const rows = [];
      for (const el of all) {
        const style = getComputedStyle(el);
        // Drops <script>/<style> and anything the print stylesheet hides
        // (.site-header, .site-footer, .skip-link, .resume-actions) — a
        // computed-style filter rather than a hardcoded class list, so it
        // stays correct if a future print rule hides something new.
        if (style.display === 'none') continue;

        const rect = el.getBoundingClientRect();
        /** @type {Record<string, string>} */
        const row = {
          path: elementPath(el),
          rect: {
            x: Math.round(rect.x * 100) / 100,
            y: Math.round(rect.y * 100) / 100,
            width: Math.round(rect.width * 100) / 100,
            height: Math.round(rect.height * 100) / 100,
          },
        };
        for (const prop of styleProps) row[prop] = style[prop];
        rows.push(row);
      }
      return rows;
    }, STYLE_PROPS);

    await page.close();
  }
} catch (error) {
  if (error?.code === 'ERR_MODULE_NOT_FOUND') {
    console.error('✗ playwright is not installed. Run: npm ci && npx playwright install chromium');
  } else {
    console.error(`✗ print-geometry capture failed: ${error?.message ?? error}`);
  }
  await browser?.close();
  closeServer();
  process.exit(1);
} finally {
  await browser?.close();
  closeServer();
}

if (UPDATE) {
  const routeCounts = ROUTES.map((r) => `${r}: ${captured[r].length} elements`).join(', ');
  await writeFile(
    BASELINE,
    JSON.stringify(
      {
        comment:
          'Generated by scripts/check-resume-print.mjs --update. Committed print-geometry ' +
          'baseline for the resume routes — do not edit by hand. Regenerate with ' +
          '`node scripts/check-resume-print.mjs --update` after an intentional change to ' +
          'the resume, resume.css, or tokens.css, and commit the result.',
        routes: captured,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`✓ wrote ${BASELINE}`);
  console.log(`  ${routeCounts}`);
  process.exit(0);
}

const baseline = JSON.parse(await readFile(BASELINE, 'utf8')).routes;

let harnessBroken = false;
const changedPaths = [];
const addedPaths = [];
const removedPaths = [];

for (const route of ROUTES) {
  const baseRows = baseline[route] ?? [];
  const curRows = captured[route] ?? [];
  const baseByPath = new Map(baseRows.map((r) => [r.path, r]));
  const curByPath = new Map(curRows.map((r) => [r.path, r]));

  const matchedPaths = [...curByPath.keys()].filter((p) => baseByPath.has(p));

  // Check 1: nothing matched at all, even though both sides are non-empty —
  // the identity-path scheme itself almost certainly broke, or the wrong
  // page rendered. Report immediately and skip property diffing for this
  // route; a per-element diff against zero real matches is noise.
  if (baseRows.length > 0 && curRows.length > 0 && matchedPaths.length === 0) {
    console.error(`✗ broken harness on ${route}: zero element paths matched the baseline.`);
    console.error('  Check that dist/ is current and the route actually renders the resume.');
    harnessBroken = true;
    continue;
  }

  // Check 2: a swing in element count past ~50% reads as a render failure
  // (blank page, 404, stale dist/), not a content edit — a new job or
  // bullet moves a handful of elements, not half the document.
  const countSwing =
    baseRows.length > 0 ? Math.abs(curRows.length - baseRows.length) / baseRows.length : 0;
  if (countSwing > 0.5) {
    console.error(
      `✗ broken harness on ${route}: element count went from ${baseRows.length} to ${curRows.length}.`,
    );
    console.error(
      '  Check that dist/ is current, the route returns 200, and it renders the resume.',
    );
    harnessBroken = true;
    continue;
  }

  let elementsWithDiff = 0;
  let differingFields = 0;
  const totalFields = matchedPaths.length * (STYLE_PROPS.length + 1); // +1 for rect

  for (const p of matchedPaths) {
    const base = baseByPath.get(p);
    const cur = curByPath.get(p);
    const fieldDiffs = [];

    if (JSON.stringify(base.rect) !== JSON.stringify(cur.rect)) {
      fieldDiffs.push({ field: 'rect', from: base.rect, to: cur.rect });
    }
    for (const prop of STYLE_PROPS) {
      if (base[prop] !== cur[prop]) {
        fieldDiffs.push({ field: prop, from: base[prop], to: cur[prop] });
      }
    }

    if (fieldDiffs.length > 0) {
      elementsWithDiff++;
      differingFields += fieldDiffs.length;
      changedPaths.push({ route, path: p, diffs: fieldDiffs });
    }
  }

  // Check 3: near-universal, near-total property churn among matched
  // elements is the signature of "the page didn't render the resume at
  // all" — wrong route served, print media not actually applied, fonts not
  // settled — as opposed to a narrow-but-real regression (e.g. one leaked
  // colour token changing `color` on every element, which is a legitimate,
  // single-property diff). Requiring both thresholds is what keeps that
  // distinction intact.
  const changedElementFraction =
    matchedPaths.length > 0 ? elementsWithDiff / matchedPaths.length : 0;
  const changedFieldFraction = totalFields > 0 ? differingFields / totalFields : 0;
  if (changedElementFraction > 0.9 && changedFieldFraction > 0.5) {
    console.error(
      `✗ broken harness on ${route}: ${elementsWithDiff}/${matchedPaths.length} elements differ ` +
        `across ${Math.round(changedFieldFraction * 100)}% of captured fields.`,
    );
    console.error('  This looks like the page never rendered the resume, not a design regression.');
    console.error(
      '  Check: is dist/ current, does the route 200 and show the resume, is print emulation ' +
        'applied before capture, did document.fonts.ready resolve first.',
    );
    harnessBroken = true;
    // Remove the per-element diffs just pushed for this route — they're not
    // useful once the whole route is flagged as a harness failure.
    for (let i = changedPaths.length - 1; i >= 0 && changedPaths[i].route === route; i--) {
      changedPaths.pop();
    }
    continue;
  }

  for (const p of [...curByPath.keys()].filter((p) => !baseByPath.has(p))) {
    addedPaths.push({ route, path: p });
  }
  for (const p of [...baseByPath.keys()].filter((p) => !curByPath.has(p))) {
    removedPaths.push({ route, path: p });
  }
}

if (harnessBroken) {
  process.exit(1);
}

if (changedPaths.length === 0 && addedPaths.length === 0 && removedPaths.length === 0) {
  console.log('✓ resume print geometry matches the committed baseline.');
  process.exit(0);
}

console.error(`✗ resume print geometry differs from the committed baseline:\n`);
for (const { route, path: p, diffs } of changedPaths) {
  console.error(`  [${route}] ${p}`);
  for (const d of diffs) {
    console.error(`    ${d.field}: ${JSON.stringify(d.from)} → ${JSON.stringify(d.to)}`);
  }
}
for (const { route, path: p } of addedPaths) {
  console.error(`  [${route}] + ${p}`);
}
for (const { route, path: p } of removedPaths) {
  console.error(`  [${route}] - ${p}`);
}
console.error(
  '\n  If this is an intentional content or style change, run ' +
    '`node scripts/check-resume-print.mjs --update` and commit the new baseline.',
);
process.exit(1);
