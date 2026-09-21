#!/usr/bin/env node
/**
 * Captures paired before/after screenshots of the old DreamHost site and the
 * new one, into `docs/before-after/`.
 *
 * ## Why this is time-boxed
 *
 * The "before" side is captured from the **live** old site, not from the
 * `snapshot/` crawl. That is deliberate: the DNS cutover (#34) is the moment
 * `aliwallick.com` stops serving the old PHP site, and after it there is no
 * way to photograph the thing as it actually renders. The crawl preserves the
 * markup (on the `snapshot-pre-retirement` tag since 2026-09-21, #45, with the
 * `restore-snapshot.mjs` script that made it browsable), but a reconstruction
 * is not the same evidence as a capture of the running site.
 *
 * So: **run this before the cutover.** Afterwards it can only regenerate the
 * `new/` half, and it says so rather than silently producing a broken pair.
 *
 * ## What "honest before" means here
 *
 * The old site is captured warts and all. Its YouTube embeds are already blank
 * (five are `http://` iframes, blocked as mixed content on an https page), its
 * html5shiv 404s (Google Code shut down in 2015), and its Unity Web Player
 * embed is permanently dead. None of that is repaired here — it is what a
 * visitor actually saw in 2026, which is the only "before" worth having.
 *
 * The same goes for mobile. Exactly **1 of the old site's 26 pages** has a
 * viewport meta tag, so the rest fall back to the ~980px layout viewport and
 * render zoomed out on a phone. That is why the mobile captures use a real
 * Playwright device descriptor (`isMobile`, device scale factor, mobile UA)
 * rather than a bare 390px viewport: a plain narrow viewport would show a
 * clipped desktop layout, which is not what a phone does. The zoomed-out
 * result is correct, not a bug to fix.
 *
 * ## Why the new side is served locally
 *
 * `workers_dev` is false, so production has no public URL before the cutover
 * (see #34). The new site is therefore served out of `dist/` by the same
 * `serveDist()` helper `build-pdf.mjs` and `check-resume-print.mjs` use — it
 * already models Cloudflare's exact URL resolution (`trailingSlash: 'never'`
 * plus `build.format: 'file'`), so `/projects` resolves the way it will in
 * production rather than the way a naive static server would guess.
 *
 * ## Why WebP
 *
 * Full-page captures of long pages are large — the 32 raw PNGs run 30-60 MB,
 * which is not a reasonable thing to commit for what is essentially reference
 * imagery. `sharp` is already an Astro dependency and already used by
 * `scripts/generate-og-images.mjs`, so the conversion costs no new package.
 *
 * Usage:
 *   node scripts/capture-comparison.mjs            # both sides
 *   node scripts/capture-comparison.mjs --only=new # after the cutover
 *   node scripts/capture-comparison.mjs --only=old
 */

import { mkdir, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { serveDist } from './lib/serve-dist.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'docs/before-after');

const OLD_ORIGIN = 'https://www.aliwallick.com';

/**
 * The eight pairs worth showing side by side.
 *
 * `old` paths are the live site's own URLs, including its mixed-case project
 * slugs (`/projects/vegasBlvd`) — the old Apache setup was effectively
 * case-insensitive, which is why `public/_redirects` carries two rules for
 * seven of these. `new` paths are the hyphenated slugs the new site uses.
 *
 * Deliberately absent: Marvel Snap. It has no old-site equivalent at all —
 * the biggest credit on the new site did not exist on the old one, which is
 * itself the most interesting single fact for a before/after write-up.
 */
const PAIRS = [
  { slug: 'home', old: '/', new: '/' },
  { slug: 'about', old: '/about', new: '/about' },
  { slug: 'resume', old: '/resume', new: '/resume' },
  { slug: 'contact', old: '/contact', new: '/contact' },
  { slug: 'projects-index', old: '/projects/', new: '/projects' },
  { slug: 'firefall', old: '/projects/firefall', new: '/projects/firefall' },
  { slug: 'kaneva', old: '/projects/kaneva', new: '/projects/kaneva' },
  { slug: 'vegas-blvd', old: '/projects/vegasBlvd', new: '/projects/vegas-blvd-slots' },
];

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1280, height: 800 }, mobile: false },
  // Matches Playwright's iPhone 13 descriptor. `isMobile` is the load-bearing
  // part: it turns on the ~980px fallback layout viewport that makes a page
  // with no viewport meta render zoomed out, exactly as a phone does.
  {
    name: 'mobile',
    viewport: { width: 390, height: 844 },
    mobile: true,
    deviceScaleFactor: 2,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 ' +
      '(KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  },
];

const args = new Set(process.argv.slice(2));
const only = [...args].find((a) => a.startsWith('--only='))?.split('=')[1];
const doOld = !only || only === 'old';
const doNew = !only || only === 'new';

/** Capture one page at one viewport and write it as WebP. */
async function capture(browser, spec, url, outFile, { tolerateErrors = false } = {}) {
  const context = await browser.newContext({
    viewport: spec.viewport,
    isMobile: spec.mobile,
    hasTouch: spec.mobile,
    deviceScaleFactor: spec.deviceScaleFactor ?? 1,
    ...(spec.userAgent ? { userAgent: spec.userAgent } : {}),
  });
  const page = await context.newPage();

  try {
    // `domcontentloaded`, not `load`. The old site references a dead
    // html5shiv, a dead Unity player script and six WordPress polyfills off a
    // domain that is about to move; waiting for `load` means waiting for all
    // of those to time out. The page is fully laid out well before then.
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    // Give webfonts, images and any surviving embed a moment to settle, but
    // never block on the dead ones.
    await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
    const png = await page.screenshot({ fullPage: true, type: 'png' });
    await sharp(png).webp({ quality: 82 }).toFile(outFile);
    return { ok: true, bytes: (await stat(outFile)).size };
  } catch (error) {
    if (!tolerateErrors) throw error;
    return { ok: false, error: String(error).split('\n')[0] };
  } finally {
    await context.close();
  }
}

const { launchChromium } = await import('./lib/launch-chromium.mjs');
const browser = await launchChromium();
const results = [];

try {
  if (doOld) {
    await rm(path.join(OUT, 'old'), { recursive: true, force: true });
    await mkdir(path.join(OUT, 'old'), { recursive: true });
    console.log(`\nCapturing the live old site at ${OLD_ORIGIN} ...`);
    for (const pair of PAIRS) {
      for (const spec of VIEWPORTS) {
        const file = path.join(OUT, 'old', `${pair.slug}-${spec.name}.webp`);
        const r = await capture(browser, spec, `${OLD_ORIGIN}${pair.old}`, file, {
          tolerateErrors: true,
        });
        results.push({ side: 'old', ...pair, spec: spec.name, ...r });
        console.log(
          r.ok
            ? `  ok   old/${pair.slug}-${spec.name}.webp`
            : `  FAIL old/${pair.slug}-${spec.name}  ${r.error}`,
        );
      }
    }
  }

  if (doNew) {
    if (!existsSync(DIST)) {
      console.error('\n✗ dist/ not found. Run `npm run build` first.');
      process.exit(1);
    }
    await rm(path.join(OUT, 'new'), { recursive: true, force: true });
    await mkdir(path.join(OUT, 'new'), { recursive: true });
    const { origin, close } = await serveDist(DIST);
    console.log(`\nCapturing the new site from dist/ at ${origin} ...`);
    try {
      for (const pair of PAIRS) {
        for (const spec of VIEWPORTS) {
          const file = path.join(OUT, 'new', `${pair.slug}-${spec.name}.webp`);
          const r = await capture(browser, spec, `${origin}${pair.new}`, file);
          results.push({ side: 'new', ...pair, spec: spec.name, ...r });
          console.log(`  ok   new/${pair.slug}-${spec.name}.webp`);
        }
      }
    } finally {
      close();
    }
  }
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
const total = results.filter((r) => r.ok).reduce((s, r) => s + (r.bytes ?? 0), 0);
console.log(
  `\n${results.length - failed.length}/${results.length} captured, ` +
    `${(total / 1048576).toFixed(2)} MB total.`,
);
if (failed.length) {
  console.log('\nFailed:');
  for (const f of failed) console.log(`  ${f.side}/${f.slug}-${f.spec}: ${f.error}`);
  console.log(
    '\nIf the old side failed wholesale, the DNS cutover may already have happened —\n' +
      'in that case the old captures cannot be regenerated. See snapshot/rendered/.',
  );
  process.exit(1);
}
