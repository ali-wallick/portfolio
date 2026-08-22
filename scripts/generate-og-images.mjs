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
 * `hero` (if it's an image) or the poster frame `scripts/fetch-posters.mjs`
 * already pulled from YouTube and committed. That script's own header explains
 * why a *build-time* fetch is the wrong call (offline builds, a third-party
 * request in CI, breakage the day a video goes down); the same reasoning
 * applies here, for free, by reusing its output instead of hitting YouTube a
 * second time.
 *
 * ## Why this doesn't reuse `projectThumb()` from src/lib/content.ts
 *
 * That function is the real source of truth for "which image represents this
 * project" and this script's resolution order deliberately mirrors it
 * (`thumb` override, then an image hero, then the poster frame) — but it's
 * built on Vite's `import.meta.glob`, which only exists inside Astro's build
 * graph. This script runs before `astro build` even starts (see `package.json`),
 * so it reads the same front matter and the same `poster.jpg` convention
 * directly off disk instead. If that resolution order ever changes, change it
 * in both places.
 */

import { readdir, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'src/content/projects');
const ASSETS = path.join(ROOT, 'src/assets/images/projects');
const OUT = path.join(ROOT, 'public/og');

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

/**
 * A project card: its resolved image, cover-cropped to the OG aspect ratio,
 * with the reticle frame overlaid for brand consistency. No baked-in text —
 * `og:title` and `og:description` already carry the title and summary, and a
 * second copy of the title rendered into the pixels would drift from them the
 * moment either one is edited without the other.
 *
 * JPEG, not PNG: these are photos, and PNG's lossless compression on a
 * photograph runs 1-2MB a card for zero visible benefit over a quality-88
 * JPEG at a tenth of that. The brand cards below stay PNG because they're
 * mostly flat colour and sharp text edges, which is what PNG is actually for.
 */
async function buildProjectCard(sourcePath, outPath) {
  const photo = await sharp(sourcePath).resize(CARD_W, CARD_H, { fit: 'cover' }).toBuffer();
  const frame =
    Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}">
    ${reticleFrame(CARD_W, CARD_H)}
  </svg>`);
  await sharp(photo)
    .composite([{ input: frame }])
    .jpeg({ quality: 88 })
    .toFile(outPath);
}

/**
 * A personal/brand card: dark ground, the reticle frame, an eyebrow label
 * (mirrors `.eyebrow` in base.css — mono, tracked, a magenta marker) and the
 * name in Gabarito. Used for every page that isn't about one specific project.
 *
 * Text-only rather than a headshot because there isn't a usable one yet — see
 * #70, which is where this swaps to a photo composite once Ali has one.
 */
async function buildBrandCard(subtitle, outPath, format = 'png') {
  const labelX = 120;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}">
    <style>${FONT_FACES}</style>
    <rect width="${CARD_W}" height="${CARD_H}" fill="${SURFACE}" />
    ${reticleFrame(CARD_W, CARD_H)}
    <rect x="${labelX}" y="266" width="20" height="20" rx="4" fill="${MAGENTA}" />
    <text x="${labelX + 34}" y="284" font-family="DM Mono" font-size="34" letter-spacing="2.5" fill="${MUTED}">${subtitle.toUpperCase()}</text>
    <text x="${labelX}" y="410" font-family="Gabarito" font-weight="800" font-size="128" fill="${INK}">Ali Wallick</text>
  </svg>`;
  const image = sharp(Buffer.from(svg));
  await (format === 'jpeg' ? image.jpeg({ quality: 90 }) : image.png()).toFile(outPath);
}

/** thumb override -> image hero -> poster.jpg, mirroring projectThumb() in src/lib/content.ts. */
function resolveProjectImage(slug, data, contentDir) {
  if (data.thumb) return path.resolve(contentDir, data.thumb);
  if (data.hero?.type === 'image') return path.resolve(contentDir, data.hero.src);
  const poster = path.join(ASSETS, slug, 'poster.jpg');
  return existsSync(poster) ? poster : undefined;
}

async function main() {
  await mkdir(path.join(OUT, 'projects'), { recursive: true });

  await buildBrandCard('Game Developer', path.join(OUT, 'home.png'));
  await buildBrandCard('Resume', path.join(OUT, 'resume.png'));
  await buildBrandCard('Contact', path.join(OUT, 'contact.png'));
  await buildBrandCard('Projects', path.join(OUT, 'projects.png'));

  const files = (await readdir(CONTENT)).filter((f) => f.endsWith('.md'));
  let ok = 0;
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const raw = await readFile(path.join(CONTENT, file), 'utf8');
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    const data = parseYaml(match[1]);
    const sourcePath = resolveProjectImage(slug, data, CONTENT);
    if (sourcePath && existsSync(sourcePath)) {
      await buildProjectCard(sourcePath, path.join(OUT, 'projects', `${slug}.jpg`));
      ok++;
    } else {
      // No image to source from (a draft with neither an image hero nor a
      // poster yet) — fall back to the brand card rather than fail the build.
      // Still .jpg: every project card lives at the same extension regardless
      // of which branch built it, so the page that links to it never has to
      // know which one happened.
      await buildBrandCard(data.title ?? slug, path.join(OUT, 'projects', `${slug}.jpg`), 'jpeg');
      console.log(`  ${slug}: no image found, used the brand card as a fallback`);
    }
  }

  console.log(`✓ ${ok}/${files.length} project cards built from local images, 4 brand cards built`);
}

await main();
