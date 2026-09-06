#!/usr/bin/env node
/**
 * Reports how much room the resume actually has — per document and per bullet.
 *
 * The page-count assertion in `build-pdf.mjs` tells you whether the document
 * fits. The print-geometry differ tells you what moved. Neither answers the
 * question that actually governs a wording edit: *can this bullet take three
 * more words without costing a line?*
 *
 * That question has a precise answer, and measuring it by rebuilding the site
 * per candidate is far too slow to use while writing. Instead this mutates the
 * bullet's last text node in an already-rendered, print-emulated page and
 * appends characters until the line count breaks. The number it prints is the
 * characters of slack on that bullet's final printed line.
 *
 * It was hand-rolled four times during #32 before becoming a script, and each
 * time it decided the edit: "15 languages" went into the Localization bullet
 * for free (62 chars of headroom), "the artists' card art tool" fit where the
 * spelled-out version did not (7), and title-casing every label turned out to
 * cost zero height at all.
 *
 * ## 701px is not optional
 *
 * Letter's 8.5in less `@page`'s 0.6in side margins, times 96. Prose wraps to
 * far fewer lines at Playwright's default 1280px, which during #32 under-read
 * the document by ~200px and inverted a conclusion about type size. The height
 * budget is 960px: 11in less the 0.5in top and bottom margins.
 *
 * Usage:
 *   node scripts/resume-headroom.mjs
 *   node scripts/resume-headroom.mjs --try 'PC Launch=Shipped the PC client, …'
 *
 * `--try` measures a candidate *without editing any file* — it replaces that
 * label's text in the DOM and reports the line count and headroom it would
 * have. Repeatable; pass it more than once to compare candidates.
 */

import path from 'node:path';
import { launchChromium } from './lib/launch-chromium.mjs';
import { serveDist } from './lib/serve-dist.mjs';
import { PRINT_VIEWPORT, PAGE_HEIGHT_BUDGET, PAGE_2_HEIGHT_BUDGET } from './lib/print-geometry.mjs';

/* The browser page below opens at PRINT_VIEWPORT, the same paper geometry
   check-resume-print.mjs measures against; see scripts/lib/print-geometry.mjs
   for the derivation. Page 2 onward carries a taller top margin for the running header (#235), so
   the two-pager's budget is PAGE_HEIGHT_BUDGET + PAGE_2_HEIGHT_BUDGET, not
   PAGE_HEIGHT_BUDGET × 2. */
const ROUTES = [
  ['/resume', PAGE_HEIGHT_BUDGET],
  ['/resume/full', PAGE_HEIGHT_BUDGET + PAGE_2_HEIGHT_BUDGET],
];

const tries = [];
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === '--try' && process.argv[i + 1]) {
    const raw = process.argv[++i];
    const at = raw.indexOf('=');
    if (at < 1) {
      console.error(`--try needs Label=text, got: ${raw}`);
      process.exit(1);
    }
    tries.push({ label: raw.slice(0, at).replace(/:$/, ''), text: raw.slice(at + 1) });
  }
}

/**
 * Runs in the page. Returns a row per measurable block: its label, how many
 * printed lines it occupies, and how many more characters its last line can
 * take before it wraps.
 *
 * The walk finds the *last* non-empty text node rather than setting
 * `textContent`, because a bullet's DOM is `<b>Label:</b> text` and replacing
 * the whole thing would delete the label and measure a different element.
 */
function measure(tries) {
  const lh = parseFloat(getComputedStyle(document.body).lineHeight);
  const lines = (el) => Math.round(el.getBoundingClientRect().height / lh);
  const tailNode = (el) => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let last = null;
    let n;
    while ((n = w.nextNode())) if (n.nodeValue.trim()) last = n;
    return last;
  };

  const blocks = [
    ...document.querySelectorAll('.resume-bullets li, .resume-group-intro, .resume-job-intro'),
  ];
  const byLabel = new Map();
  const rows = [];

  for (const el of blocks) {
    const label =
      el.querySelector('.resume-bullet-label')?.textContent.trim().replace(/:$/, '') ??
      `(${el.textContent.trim().slice(0, 20)}…)`;
    byLabel.set(label, el);
    const node = tailNode(el);
    const original = node.nodeValue;
    const start = lines(el);
    let head = 0;
    for (let i = 1; i <= 400; i++) {
      node.nodeValue = `${original}${'x'.repeat(i)}`;
      if (lines(el) > start) break;
      head = i;
    }
    node.nodeValue = original;
    rows.push({ label, lines: start, head });
  }

  const candidates = [];
  for (const t of tries) {
    const el = byLabel.get(t.label);
    if (!el) continue;
    const node = tailNode(el);
    const original = node.nodeValue;
    // Preserve the single space the template puts between `<b>` and the text.
    const lead = /^\s/.test(original) ? ' ' : '';
    node.nodeValue = lead + t.text;
    const start = lines(el);
    let head = 0;
    for (let i = 1; i <= 400; i++) {
      node.nodeValue = `${lead}${t.text}${'x'.repeat(i)}`;
      if (lines(el) > start) break;
      head = i;
    }
    node.nodeValue = original;
    candidates.push({ label: t.label, lines: start, head, text: t.text });
  }

  return {
    height: document.querySelector('.resume').getBoundingClientRect().height,
    lineHeight: lh,
    rows,
    candidates,
  };
}

const { origin, close } = await serveDist(path.resolve('dist'));
const browser = await launchChromium();
try {
  const page = await browser.newPage({ viewport: PRINT_VIEWPORT });
  await page.emulateMedia({ media: 'print' });

  for (const [route, budget] of ROUTES) {
    await page.goto(origin + route, { waitUntil: 'networkidle' });
    const r = await page.evaluate(measure, tries);
    const slack = budget - r.height;
    console.log(
      `\n${route}  ${r.height.toFixed(1)} of ${budget}px  —  slack ${slack.toFixed(1)}px, ` +
        `${(slack / r.lineHeight).toFixed(1)} lines`,
    );
    for (const row of r.rows) {
      const warn = row.head <= 5 ? '  ← one word from a wrap' : '';
      console.log(`  ${row.lines}L  headroom ${String(row.head).padStart(3)}  ${row.label}${warn}`);
    }
    for (const c of r.candidates) {
      console.log(
        `  --try  ${c.lines}L  headroom ${String(c.head).padStart(3)}  ${c.label}: ${c.text}`,
      );
    }
  }
} finally {
  await browser.close();
  await close();
}
