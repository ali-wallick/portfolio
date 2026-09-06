#!/usr/bin/env node
/**
 * Generate every OG/Twitter card image the site links to, into `public/og/`.
 *
 * ## Why this runs on every build, unlike the resume PDFs
 *
 * The resume PDFs are committed because Chromium can't launch on Cloudflare's
 * build image (see docs/CLOUDFLARE.md). This script only uses `sharp`, which
 * is what Astro's own `astro:assets` pipeline uses for every optimised image
 * on the site already — proven to work there on every deploy. So there's no
 * reason to freeze these as committed binaries; `public/og/` is gitignored and
 * regenerated fresh, same as `dist/`.
 *
 * ## Why this doesn't fetch anything
 *
 * Every image it composites is already a local, committed asset — a project's
 * `hero` (if it's an image) or the `poster` a video hero is required to carry.
 * A *build-time* fetch would be the wrong call for the usual reasons (offline
 * builds, a third-party request in CI, breakage the day a video goes down),
 * and the poster field means there is nothing to fetch anyway.
 *
 * ## Where "which image represents this project" comes from
 *
 * `thumbSource()` in `src/lib/content-rules.ts` — the same function
 * `projectThumb()` in src/lib/content.ts calls, so a share card and the site's
 * own tile for a project can never disagree (#328). It used to be a second
 * hand-written copy here, because `content.ts` is built on `astro:content` and
 * this script runs before `astro build` even starts (see `package.json`); the
 * rules now live in a module with no imports at all, which both sides can load.
 *
 * That copy had also silently diverged: it never read `thumbWide`, so four
 * cards were logo art cropped to a widescreen band while the same front matter
 * already named a 16:9 capture for exactly that shape.
 *
 * Front matter itself is read through `scripts/lib/frontmatter.mjs`, the same
 * helper `build-linkedin.mjs` and `build-pdf.mjs` use, rather than a third
 * hand-rolled YAML-block parser.
 */

import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { readEntries } from './lib/frontmatter.mjs';
// Relative and with the extension — see the note on the same import in
// build-linkedin.mjs.
import { thumbSource } from '../src/lib/content-rules.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'src/content/projects');
const OUT = path.join(ROOT, 'public/og');
const HEADSHOT = path.join(ROOT, 'src/assets/images/me.jpg');

const CARD_W = 1200;
const CARD_H = 630;

// Dark-theme accent throughout — every card (project or personal) ends up on
// a photo or a dark ground, never a light one, so there's no light/dark split
// to carry here the way the favicon needed one.
const MAGENTA = '#ff2d95';
const SURFACE = '#151524';
const INK = '#f0eefc';
const MUTED = '#a09ac0';

const gabarito = (
  await readFile(
    path.join(
      ROOT,
      'node_modules/@fontsource-variable/gabarito/files/gabarito-latin-wght-normal.woff2',
    ),
  )
).toString('base64');
const dmMono = (
  await readFile(
    path.join(ROOT, 'node_modules/@fontsource/dm-mono/files/dm-mono-latin-500-normal.woff2'),
  )
).toString('base64');

const FONT_FACES = `
  @font-face {
    font-family: 'Gabarito';
    src: url(data:font/woff2;base64,${gabarito}) format('woff2');
  }
  @font-face {
    font-family: 'DM Mono';
    src: url(data:font/woff2;base64,${dmMono}) format('woff2');
  }
`;

/** Four corner brackets, same shape language as public/favicon.svg, scaled up. */
function reticleFrame(width, height, { inset = 48, arm = 100, stroke = 9 } = {}) {
  const x0 = inset;
  const y0 = inset;
  const x1 = width - inset;
  const y1 = height - inset;
  const d = [
    `M${x0} ${y0 + arm}V${y0}H${x0 + arm}`,
    `M${x1 - arm} ${y0}H${x1}V${y0 + arm}`,
    `M${x1} ${y1 - arm}V${y1}H${x1 - arm}`,
    `M${x0 + arm} ${y1}H${x0}V${y1 - arm}`,
  ].join(' ');
  return `<path d="${d}" fill="none" stroke="${MAGENTA}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" />`;
}

/** `reticleFrame()`, wrapped as a standalone SVG so it can be used as a composite layer. */
function reticleFrameSvg(width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${reticleFrame(width, height)}</svg>`;
}

/**
 * A project card: its resolved image, cover-cropped to the OG aspect ratio,
 * with the reticle frame overlaid for brand consistency. No baked-in text —
 * `og:title` and `og:description` already carry the title and summary, and a
 * second copy of the title rendered into the pixels would drift from them the
 * moment either one is edited without the other.
 *
 * JPEG, not PNG: these are photos, and PNG's lossless compression on a
 * photograph runs 1-2MB a card for zero visible benefit over a quality-88
 * JPEG at a tenth of that. `buildBrandCard()` below is half photo now too
 * (the headshot) and gets the same treatment for the same reason, checked
 * directly: its flat half — solid ground, bold display type — showed no
 * visible compression artifacts at this quality either, so there was no
 * reason to keep it on PNG once the photo half decided the format anyway.
 * `buildFlatCard()` has no photo at all but ships JPEG too, for the same
 * measured reason rather than by default.
 */
async function buildProjectCard(sourcePath, outPath) {
  const photo = await sharp(sourcePath).resize(CARD_W, CARD_H, { fit: 'cover' }).toBuffer();
  await sharp(photo)
    .composite([{ input: Buffer.from(reticleFrameSvg(CARD_W, CARD_H)) }])
    .jpeg({ quality: 88 })
    .toFile(outPath);
}

/**
 * A personal/brand card: the headshot on the left, dark ground on the right
 * with an eyebrow label (mirrors `.eyebrow` in base.css — mono, tracked, a
 * magenta marker) and the name in Gabarito, the reticle frame around the
 * whole thing. Used for every page that isn't about one specific project.
 *
 * Split panel rather than a full-bleed photo with text over it (the way
 * project cards work): a photo behind text needs a scrim to stay legible,
 * and this direction doesn't reach for blur or gradients anywhere else — the
 * plate shadow is deliberately hard-edged (see tokens.css). A hard vertical
 * split keeps that vocabulary and needs no scrim at all.
 *
 * #70 tracked this as a follow-up for when a usable headshot existed; it
 * does now (src/assets/images/me.jpg, replaced from the old hiking-shot
 * placeholder), so this is that follow-up rather than the deferral.
 */
async function buildBrandCard(subtitle, outPath) {
  const photoW = 470;
  const textX = photoW + 60;

  const photo = await sharp(HEADSHOT).resize(photoW, CARD_H, { fit: 'cover' }).toBuffer();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}">
    <style>${FONT_FACES}</style>
    <rect width="${CARD_W}" height="${CARD_H}" fill="${SURFACE}" />
    <rect x="${textX - 10}" y="266" width="20" height="20" rx="4" fill="${MAGENTA}" />
    <text x="${textX + 24}" y="284" font-family="DM Mono" font-size="34" letter-spacing="2.5" fill="${MUTED}">${subtitle.toUpperCase()}</text>
    <text x="${textX - 10}" y="410" font-family="Gabarito" font-weight="800" font-size="104" fill="${INK}">Ali Wallick</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .composite([
      { input: photo, left: 0, top: 0 },
      { input: Buffer.from(reticleFrameSvg(CARD_W, CARD_H)) },
    ])
    .jpeg({ quality: 90 })
    .toFile(outPath);
}

/**
 * A flat card with just a title on dark ground plus the reticle frame — no
 * photo. Only used when a project has neither an image hero nor a poster
 * frame to fall back to. Deliberately not `buildBrandCard()`: that one is
 * Ali's headshot now, and captioning her photo with an unrelated project's
 * title would misrepresent both.
 */
async function buildFlatCard(title, outPath) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}">
    <style>${FONT_FACES}</style>
    <rect width="${CARD_W}" height="${CARD_H}" fill="${SURFACE}" />
    <text x="120" y="330" font-family="Gabarito" font-weight="800" font-size="88" fill="${INK}">${title}</text>
  </svg>`;
  await sharp(Buffer.from(svg))
    .composite([{ input: Buffer.from(reticleFrameSvg(CARD_W, CARD_H)) }])
    .jpeg({ quality: 90 })
    .toFile(outPath);
}

/**
 * thumb override -> image hero -> video hero's poster, mirroring projectThumb()
 * in src/lib/content.ts.
 *
 * The last step used to look for a `poster.jpg` sitting next to the project's
 * other assets, because nothing named the poster in front matter. `poster` is a
 * required field on a video hero now (#273), so it is read like every other
 * path here and the file no longer has to be found by convention.
 */
async function main() {
  await mkdir(path.join(OUT, 'projects'), { recursive: true });

  await buildBrandCard('Game Developer', path.join(OUT, 'home.jpg'));
  await buildBrandCard('Resume', path.join(OUT, 'resume.jpg'));
  await buildBrandCard('Contact', path.join(OUT, 'contact.jpg'));
  await buildBrandCard('Projects', path.join(OUT, 'projects.jpg'));

  const entries = await readEntries(CONTENT);
  let ok = 0;
  for (const { slug, data } of entries) {
    // `'wide'`: a card is 1200x630, and `buildProjectCard()` cover-crops
    // whatever it resolves to that 1.9:1 letterbox — so it wants the same
    // override the homepage's wide featured cards do, not the square one.
    // An `art` hero resolves to `undefined` (#49) and takes the flat title
    // card below, which is the share-image equivalent of the generated card
    // the page itself leads with.
    const source = thumbSource(data, 'wide');
    const sourcePath = source ? path.resolve(CONTENT, source) : undefined;
    if (sourcePath && existsSync(sourcePath)) {
      await buildProjectCard(sourcePath, path.join(OUT, 'projects', `${slug}.jpg`));
      ok++;
    } else {
      // No image to source from (a draft with neither an image hero nor a
      // poster yet) — fall back to a flat title card rather than fail the
      // build. Still .jpg: every project card lives at the same extension
      // regardless of which branch built it, so the page that links to it
      // never has to know which one happened.
      await buildFlatCard(data.title ?? slug, path.join(OUT, 'projects', `${slug}.jpg`));
      console.log(`  ${slug}: no image found, used a flat title card as a fallback`);
    }
  }

  console.log(
    `✓ ${ok}/${entries.length} project cards built from local images, 4 brand cards built`,
  );
}

await main();
