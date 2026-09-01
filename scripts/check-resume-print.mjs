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
 * ## Why this now runs in CI too (#191)
 *
 * Until #191, `--font-body` was `system-ui`, which resolved to a different
 * (and smaller) typeface on Linux than on the macOS machine that captures the
 * baseline, so a fine-grained geometry diff would false-positive on that font
 * substitution on nearly every element, on every CI run. This stayed a local,
 * macOS-only guard for that reason: wired into `verify`, kept out of `build`,
 * `build:pdf`, `check:pdf`, and the GitHub Actions workflow.
 *
 * `resume.css` now names a specific self-hosted face (Public Sans, via
 * @fontsource) instead of `system-ui`, so the baseline this script diffs
 * against is portable — the same font *file* loads on macOS and
 * ubuntu-latest, which is what actually blocked this. `.github/workflows/ci.yml`
 * runs `check:resume-print` as of #191; a real reflow or style leak still
 * fails the build, a platform font substitution no longer can.
 *
 * The same embedded font is not pixel-identical across platforms, though —
 * discovered on this guard's first real CI run. CoreText (macOS) and
 * FreeType (Linux) hint and shape glyph runs slightly differently, so a text
 * element's width/x can differ by a few percent with no font, colour,
 * weight, or reflow change behind it (every diff on that run was width/x
 * only — zero `y` or `height` diffs, so nothing actually wrapped
 * differently). See `X_TOLERANCE_ABS`/`X_TOLERANCE_REL` below: this script
 * tolerates that specific, bounded kind of drift and nothing else.
 *
 * ## Inline elements assert their advance, not their rect (#284)
 *
 * That tolerance had one blind spot, and it made this guard red on macOS
 * against a green CI on the same commit. `getBoundingClientRect()` on an *inline*
 * element returns the union of its line boxes, so it is a measurement of
 * where the lines happened to break rather than of the element. The moment
 * shaping drift in the *preceding* text lets one more word fit at the end of
 * a line, the same unchanged element reports `680 × 31.91` in one environment
 * and `468.84 × 15` in the other — a 31% width diff and a full line-height of
 * `y`, with nothing wrapped differently and the containing block byte-identical
 * at `685 × 33.81` in both.
 *
 * So inline rows record `advance`, the summed width of their line boxes, and
 * that is what is compared. It is break-invariant, and it still moves on the
 * things worth catching: a text edit, a font-size or tracking leak, a padding
 * or border leak. (It is invariant to within a space: a break collapses the
 * whitespace at it, so an advance can move by a space width when a word
 * changes lines. That is ~0.6% here, well inside the tolerance below.)
 *
 * What it gives up is positional assertion on inline boxes, and that is not a
 * loss so much as an admission: an inline's `x`/`y` is a function of where the
 * lines broke, so it was never portably assertable. Block-level elements keep
 * the strict `y`/`height` check, so a genuine reflow still fails loudly — a
 * line gained or lost changes the height of the block containing it, which is
 * where the assertion belongs.
 *
 * The trigger, worth knowing before reading a diff: the committed baseline had
 * quietly been *Linux*-recorded since #238. Every width in it is a whole
 * number, which is FreeType rounding advances; #191's macOS baseline was a
 * mix of integers and fractions. The `environment` block in the baseline and
 * the note printed above any diff exist so that is visible in one line
 * instead of being re-derived.
 *
 * Usage:
 *   node scripts/check-resume-print.mjs            # diff against the baseline
 *   node scripts/check-resume-print.mjs --update    # regenerate the baseline
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { serveDist } from './lib/serve-dist.mjs';
import { launchChromium } from './lib/launch-chromium.mjs';

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

/**
 * Cross-platform text-rasterization tolerance (#191, discovered when this
 * guard first ran in CI on ubuntu-latest against a baseline recorded on
 * macOS). Even with the *identical* embedded font file — Public Sans is
 * self-hosted via @fontsource, not `system-ui` — CoreText (macOS) and
 * FreeType (Linux) hint and shape glyph runs slightly differently, so a
 * text element's measured width/x can differ by a few percent with no font,
 * colour, weight, or reflow change behind it. Measured on the real CI run:
 * every diff was width/x only (zero `y` or `height` diffs, so no line ever
 * wrapped differently), topping out at ~4.8% of the element's width on the
 * widest text runs. `X_TOLERANCE` is set comfortably above that; `y` and
 * `height` keep a near-zero tolerance (just enough for float rounding)
 * because a real reflow — the thing this script exists to catch — shows up
 * there, not in `x`/`width` alone.
 */
const X_TOLERANCE_ABS = 2;
const X_TOLERANCE_REL = 0.06;
const Y_TOLERANCE_ABS = 0.5;

function within(delta, base, cur, absTolerance, relTolerance) {
  const tolerance = Math.max(absTolerance, relTolerance * Math.max(Math.abs(base), Math.abs(cur)));
  return delta <= tolerance;
}

/** True if two captured rects differ by more than the platform-rasterization
 * tolerance above. `x`/`width` get the generous, relative tolerance; `y`/
 * `height` stay tight, so a genuine reflow still fails loudly. */
function rectsDiffer(base, cur) {
  if (!within(Math.abs(base.x - cur.x), base.x, cur.x, X_TOLERANCE_ABS, X_TOLERANCE_REL))
    return true;
  if (
    !within(
      Math.abs(base.width - cur.width),
      base.width,
      cur.width,
      X_TOLERANCE_ABS,
      X_TOLERANCE_REL,
    )
  )
    return true;
  if (Math.abs(base.y - cur.y) > Y_TOLERANCE_ABS) return true;
  if (Math.abs(base.height - cur.height) > Y_TOLERANCE_ABS) return true;
  return false;
}

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
/** @type {Record<string, Array<{path: string} & Record<string, unknown>>>} */
const captured = {};
/** Recorded into the baseline and reported on a mismatch — see `environment` below. */
let chromiumVersion = null;

try {
  browser = await launchChromium();
  chromiumVersion = browser.version();
  /**
   * Letter (8.5in) less the 0.6in side margins `@page` sets in
   * src/styles/resume.css, times 96 CSS px per inch. Paired height is the 11in
   * page less its 0.5in top and bottom margins.
   *
   * Set explicitly, 2026-08-26 (#32). This ran at Playwright's default 1280x720
   * for its whole life, which meant it rendered *print CSS at a screen width* —
   * a combination that exists on no page and no sheet of paper. Colour, font and
   * weight leaks are width-independent, so it still caught every bug it was
   * built for (#35). Reflow is not: a bullet that rewraps only at paper width is
   * invisible at 1280px, and one did. Trimming the I Fits I Sits bullet from
   * three printed lines to two moved zero elements in this differ, because at
   * 1280px both versions occupied the same two lines.
   *
   * Same trap as the density measurement earlier in #32, which read 740px of a
   * 960px budget at 1280px and inverted the conclusion. If you measure anything
   * about this document, measure it at 701px.
   */
  const PRINT_VIEWPORT = { width: 701, height: 960 };

  const context = await browser.newContext({
    colorScheme: 'light',
    viewport: PRINT_VIEWPORT,
  });

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

        const round = (n) => Math.round(n * 100) / 100;
        const rect = el.getBoundingClientRect();
        /** @type {Record<string, unknown>} */
        const row = { path: elementPath(el) };

        if (style.display === 'inline') {
          // An inline box fragments across line boxes, and
          // getBoundingClientRect() returns their *union* — which is a fact
          // about where the lines happened to break, not about the element.
          // Assert the total advance instead (#284); `unionRect` is recorded
          // for legibility when reading a failure and is deliberately not
          // compared.
          const boxes = el.getClientRects();
          let advance = 0;
          for (const box of boxes) advance += box.width;
          row.inline = true;
          row.advance = round(advance);
          row.lineBoxes = boxes.length;
          row.unionRect = {
            x: round(rect.x),
            y: round(rect.y),
            width: round(rect.width),
            height: round(rect.height),
          };
        } else {
          row.rect = {
            x: round(rect.x),
            y: round(rect.y),
            width: round(rect.width),
            height: round(rect.height),
          };
        }

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
          'the resume, resume.css, or tokens.css, and commit the result. Rows with ' +
          '"inline": true assert "advance" (the summed width of the element\'s line boxes); ' +
          'their "unionRect" and "lineBoxes" are informational only. See #284.',
        environment: { platform: process.platform, chromium: chromiumVersion },
        routes: captured,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`✓ wrote ${BASELINE}`);
  console.log(`  ${routeCounts}`);
  console.log(`  recorded on ${process.platform} / Chromium ${chromiumVersion}`);
  process.exit(0);
}

const baselineFile = JSON.parse(await readFile(BASELINE, 'utf8'));
const baseline = baselineFile.routes;

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

    if (!!base.inline !== !!cur.inline) {
      // An element changing between inline and block-level layout is a real
      // regression (and changes which geometry is even meaningful), so it is
      // reported rather than quietly switching comparison modes.
      fieldDiffs.push({
        field: 'display',
        from: base.inline ? 'inline' : 'block-level',
        to: cur.inline ? 'inline' : 'block-level',
      });
    } else if (cur.inline) {
      if (
        !within(
          Math.abs(base.advance - cur.advance),
          base.advance,
          cur.advance,
          X_TOLERANCE_ABS,
          X_TOLERANCE_REL,
        )
      ) {
        fieldDiffs.push({ field: 'advance', from: base.advance, to: cur.advance });
      }
    } else if (rectsDiffer(base.rect, cur.rect)) {
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

// The baseline is portable but not pixel-identical across platforms — CoreText
// and FreeType shape the same embedded font slightly differently — so say up
// front when the machine reading it is not the machine that wrote it. #284 was
// an hour of investigation that this one line would have started.
const recorded = baselineFile.environment;
if (recorded && (recorded.platform !== process.platform || recorded.chromium !== chromiumVersion)) {
  console.error(
    `  note: baseline recorded on ${recorded.platform} / Chromium ${recorded.chromium}; ` +
      `this run is ${process.platform} / Chromium ${chromiumVersion}.\n`,
  );
}

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
