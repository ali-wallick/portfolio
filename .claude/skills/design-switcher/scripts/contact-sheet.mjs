#!/usr/bin/env node
/**
 * Renders several states of one element into a single labelled grid image.
 *
 * ## Why this exists
 *
 * A live switcher is SEQUENTIAL. "Which of these four is loudest" is a
 * SIMULTANEOUS question, and so is anything about a state you cannot be in
 * twice at once — a hovered tab and an unhovered one, both themes, focus and
 * rest. Several rounds of #239 collapsed into one look once every state was
 * rendered into one image with its measurement under it, and two findings came
 * out of the grid that the switcher could not have produced: the notch under a
 * hovered tab exists in exactly one of four state combinations, and a flush tab
 * supplies the panel's corner only while it is the selected one.
 *
 * ## How it works
 *
 * Each state is applied by writing `data-*` attributes onto selectors you
 * name, optionally hovering or focusing something, then clipping a screenshot
 * to one element. The tiles are then laid out by the browser itself — an HTML
 * grid of `<figure>`s screenshotted in one shot — so the labels get the same
 * typography as everything else and there is no SVG text to hand-place.
 *
 * ## Usage
 *
 *   node .claude/skills/design-switcher/scripts/contact-sheet.mjs sheet.json
 *   node .claude/skills/design-switcher/scripts/contact-sheet.mjs sheet.json --out=/tmp/x.png
 *
 * Point it at a running `astro dev` (drafts visible) or at a `dist/` you are
 * serving. It does not build anything.
 *
 * ## The spec file
 *
 * {
 *   "url": "http://localhost:4321/design/resume-actions",
 *   "clip": ".resume-actions",        // element each tile is cropped to
 *   "out": "docs/scratch/tabs.png",
 *   "columns": 3,                     // default: ceil(sqrt(n))
 *   "viewport": { "width": 1280, "height": 900 },
 *   "scale": 2,                       // deviceScaleFactor; 5 to argue about a corner
 *   "pad": 24,                        // px of page around the clip, so shadows survive
 *   "settle": 500,                    // ms waited after each state change
 *   "title": "Tab corner, both states, three treatments",
 *   "hide": [".lab-panel", ".reticle"],  // hidden in every tile
 *   "states": [
 *     {
 *       "label": "B5 · selected · rest",
 *       "theme": "dark",                              // emulates prefers-color-scheme
 *       "attrs": { ".ra-lab": { "border": "b5" } },   // selector -> data-* map
 *       "click": ".ra-tab[data-density-link='full']", // optional, before hover
 *       "hover": ".ra-tab:first-child",               // optional
 *       "focus": null,                                // optional; focus-visible
 *       "hide": [".tooltip"],                         // added to the sheet's `hide`
 *       "measure": "Math.round(document.querySelector('.ra-tab').getBoundingClientRect().height) + 'px tall'"
 *     }
 *   ]
 * }
 *
 * Everything but `label` is optional on a state. `measure` is an expression
 * evaluated in the page after the state settles; its value is printed under
 * the tile. Prefer a measurement over a description — a caption reading
 * "8.8px notch" is why the picture is worth taking.
 *
 * `attrs` writes state; `click` drives it. Where a script owns a control, the
 * attribute alone leaves everything the script also syncs — `aria-current`, a
 * href, a label — on the other state, so the tile shows a combination that
 * cannot occur. Use `click` for anything a control produces, and `attrs` only
 * for a knob nothing else reads.
 *
 * ## Traps this script already handles, and why you should care anyway
 *
 * - Playwright's virtual mouse SURVIVES page.goto, so a tile captured after an
 *   earlier hover is a picture of a hovered page. Every state parks the mouse
 *   off-canvas first, then hovers only if asked.
 * - A transition returns its OLD value if read immediately. `settle` defaults
 *   to 500ms, comfortably past the site's 320ms `--duration`. Raise it if the
 *   thing you are measuring animates longer; do not lower it below the longest
 *   transition on the element.
 * - `prefers-reduced-motion` is NOT forced. The states are judged as a visitor
 *   sees them; if you want the reduced-motion rendering, ask for it explicitly
 *   with "reducedMotion": "reduce" at the top level.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const specPath = args.find((a) => !a.startsWith('--'));
const outFlag = args.find((a) => a.startsWith('--out='))?.slice('--out='.length);

if (!specPath) {
  console.error('usage: contact-sheet.mjs <spec.json> [--out=path.png]');
  process.exit(1);
}

const spec = JSON.parse(await readFile(path.resolve(specPath), 'utf8'));
const out = path.resolve(outFlag ?? spec.out ?? 'contact-sheet.png');
const states = spec.states ?? [];

if (!spec.url) throw new Error('spec.url is required');
if (!states.length) throw new Error('spec.states must have at least one state');

const settle = spec.settle ?? 500;
const scale = spec.scale ?? 2;
const pad = spec.pad ?? 24;
const columns = spec.columns ?? Math.ceil(Math.sqrt(states.length));

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('✗ playwright is not installed. Run: npm ci && npx playwright install chromium');
  process.exit(1);
}

/* Not a bare `chromium.launch()`: in a Claude Code web session the egress
   proxy blocks `cdn.playwright.dev`, so the pinned revision was never
   downloaded and a direct launch throws (#245). `launchChromium` tries the
   normal launch first — CI and Ali's machine are untouched — and falls back to
   the session image's pre-installed binary only if that fails. `build-pdf.mjs`
   and `check-resume-print.mjs` already went through it; this script was the
   one Chromium caller that had not, which made the contact sheet unrunnable in
   exactly the environment most of this work happens in. */
const { launchChromium } = await import(
  path.resolve(process.cwd(), 'scripts/lib/launch-chromium.mjs')
);
const browser = await launchChromium();
const context = await browser.newContext({
  viewport: spec.viewport ?? { width: 1280, height: 900 },
  deviceScaleFactor: scale,
  reducedMotion: spec.reducedMotion ?? 'no-preference',
});
const page = await context.newPage();

/** Park the virtual mouse where nothing can be under it. It survives goto. */
const parkMouse = () => page.mouse.move(-50, -50);

const tiles = [];

/** Names the state a failure happened in. A bare Playwright timeout on a
 *  selector that moved does not say which of twelve tiles was being drawn. */
async function capture(state) {
  await page.goto(spec.url, { waitUntil: 'networkidle' });
  await parkMouse();

  /**
   * This site selects dark on `prefers-color-scheme` ALONE — `tokens.css` has
   * no `data-theme` hook and there is no toggle. So a theme is emulated as a
   * media feature; writing an attribute renders a light tile labelled "dark",
   * which is exactly the convincing wrong answer this whole file is about.
   */
  if (state.theme) await page.emulateMedia({ colorScheme: state.theme });

  /**
   * Hide the instrument before photographing what it compares. The switcher
   * panel is fixed and lands in any tile wider than the clip; the reticle
   * parks its brackets on whatever `click` just touched, so a tile of a
   * selected tab arrives framed in magenta that is not part of the candidate.
   * Both are decoration on a picture whose whole job is to be measured.
   */
  const hidden = [...(spec.hide ?? []), ...(state.hide ?? [])];
  if (hidden.length) {
    await page.addStyleTag({ content: `${hidden.join(',')} { display: none !important; }` });
  }

  for (const [selector, data] of Object.entries(state.attrs ?? {})) {
    await page.evaluate(
      ([sel, entries]) => {
        const node = document.querySelector(sel);
        if (!node) throw new Error(`contact-sheet: no element matches ${sel}`);
        for (const [key, value] of entries) node.dataset[key] = value;
      },
      [selector, Object.entries(data)],
    );
  }

  if (state.click) await page.click(state.click);
  // Re-park after a click: the pointer is left sitting on whatever was clicked.
  await parkMouse();

  if (state.focus) await page.focus(state.focus);
  if (state.hover) await page.hover(state.hover);

  // Every transition on the element has to finish before anything is read or
  // captured — a 320ms background-color returns the old value before it does.
  await page.waitForTimeout(settle);

  const measured = state.measure ? String(await page.evaluate(state.measure)) : null;

  const target = spec.clip ? page.locator(spec.clip).first() : null;
  let clip;
  if (target) {
    const box = await target.boundingBox();
    if (!box) throw new Error(`contact-sheet: ${spec.clip} has no box in state "${state.label}"`);
    clip = {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: box.width + pad * 2,
      height: box.height + pad * 2,
    };
  }

  const shot = await page.screenshot(clip ? { clip } : { fullPage: false });
  tiles.push({
    label: state.label ?? '',
    measure: measured,
    src: `data:image/png;base64,${shot.toString('base64')}`,
    width: clip ? clip.width : (spec.viewport?.width ?? 1280),
  });
  process.stdout.write(`  ✓ ${state.label ?? '(unlabelled)'}${measured ? ` — ${measured}` : ''}\n`);
}

for (const state of states) {
  try {
    await capture(state);
  } catch (error) {
    await browser.close();
    console.error(`\n✗ state "${state.label ?? '(unlabelled)'}": ${error.message.split('\n')[0]}`);
    process.exit(1);
  }
}

/**
 * Lay the sheet out in the browser rather than compositing it. Text rendering,
 * wrapping and alignment all come free, and the sheet inherits nothing from the
 * page under test — the tiles are images by this point.
 */
const sheet = await context.newPage();
await sheet.setViewportSize({ width: Math.min(2400, columns * 560 + 96), height: 800 });
await sheet.setContent(`<!doctype html><meta charset="utf-8">
<style>
  :root { color-scheme: light; }
  body { margin: 0; padding: 32px; background: #f6f6f8; color: #1c1b22;
         font: 14px/1.4 ui-sans-serif, system-ui, sans-serif; }
  h1 { font-size: 16px; margin: 0 0 20px; font-weight: 600; }
  .grid { display: grid; grid-template-columns: repeat(${columns}, minmax(0, 1fr)); gap: 24px; }
  figure { margin: 0; }
  .frame { background: #fff; border: 1px solid #d8d6de; border-radius: 6px; overflow: hidden;
           display: flex; align-items: center; justify-content: center; }
  img { display: block; max-width: 100%; height: auto; }
  figcaption { margin-top: 8px; }
  .label { font-weight: 600; }
  .measure { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; color: #5b5866; }
</style>
${spec.title ? `<h1>${escapeHtml(spec.title)}</h1>` : ''}
<div class="grid">
${tiles
  .map(
    (t) => `<figure>
  <div class="frame"><img src="${t.src}" alt=""></div>
  <figcaption>
    <div class="label">${escapeHtml(t.label)}</div>
    ${t.measure ? `<div class="measure">${escapeHtml(t.measure)}</div>` : ''}
  </figcaption>
</figure>`,
  )
  .join('\n')}
</div>`);

await mkdir(path.dirname(out), { recursive: true });
// The body, not `fullPage`: the sheet page has a fixed viewport height and a
// full-page shot pads the grid with whatever is left of it.
const png = await sheet.locator('body').screenshot();
await writeFile(out, png);

await browser.close();

console.log(`\n✓ ${tiles.length} states → ${path.relative(process.cwd(), out)}`);

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}
