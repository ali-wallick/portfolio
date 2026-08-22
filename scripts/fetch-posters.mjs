#!/usr/bin/env node
/**
 * Pull a poster frame for every project whose `hero` is a YouTube video.
 *
 * ## Why this exists
 *
 * Nine of the seventeen projects have a video hero and no still image at all,
 * so any surface that wants a thumbnail — the featured cards, the archive
 * tiles — has nothing to show for them. #22 listed "pull poster frames from the
 * YouTube heroes" as the mechanical route that needs nothing from Ali, and this
 * is that route.
 *
 * ## Run-once, commit the output
 *
 * This is NOT part of `npm run build`, deliberately. The images become ordinary
 * committed assets under `src/assets/`, which is what lets them go through
 * Astro's `image()` like every other image on the site — resolved and validated
 * at build time, `alt` required, optimised on output. A build-time fetch would
 * mean the site couldn't build offline, would put a third-party request in CI,
 * and would break the day a video is taken down.
 *
 * It also means Cloudflare never runs this, which matters: its build image
 * already can't run Chromium (see docs/CLOUDFLARE.md), and adding a second
 * thing the deploy environment can't do is exactly the trap the committed
 * resume PDFs exist to avoid.
 *
 * ## Quality
 *
 * `maxresdefault.jpg` is 1280x720 and is what we want. It does not exist for
 * every video — YouTube only generates it above a source-resolution threshold,
 * so older jam videos often top out lower. The fallback chain walks down
 * through `sd`, `hq` and `mq` and reports which one each project got, because
 * "this thumbnail is 320px wide" is something you want told to you rather than
 * discovered on a retina phone.
 *
 * Note that `hqdefault.jpg` is 4:3 with letterbox bars baked in for a 16:9
 * source. Anything that falls back that far is flagged loudly as a candidate
 * for a real capture (the `needs-ali` follow-up), not silently shipped.
 *
 * Usage: node scripts/fetch-posters.mjs [--force]
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const CONTENT = path.resolve('src/content/projects');
const ASSETS = path.resolve('src/assets/images/projects');
const FORCE = process.argv.includes('--force');

/**
 * Ordered best-first. Width is YouTube's, not measured — it is used only to
 * decide how loudly to complain, so an approximate figure is fine.
 */
const VARIANTS = [
  { name: 'maxresdefault', width: 1280, ok: true },
  { name: 'sddefault', width: 640, ok: true },
  { name: 'hqdefault', width: 480, ok: false },
  { name: 'mqdefault', width: 320, ok: false },
];

/**
 * Pull `hero: { type: youtube, id: ... }` out of a project's front matter.
 *
 * Hand-rolled rather than pulling in a YAML parser: this script runs by hand,
 * the shape it looks for is fixed by the content model's discriminated union,
 * and a wrong answer here fails visibly on the very next line (the fetch 404s).
 */
function heroVideoId(source) {
  const frontMatter = source.split(/^---$/m)[1] ?? '';
  const hero = frontMatter.match(/^hero:\n((?:[ \t]+.*\n)+)/m)?.[1];
  if (!hero || !/^\s+type:\s*youtube\s*$/m.test(hero)) return undefined;
  return hero.match(/^\s+id:\s*['"]?([\w-]{11})['"]?\s*$/m)?.[1];
}

const files = (await readdir(CONTENT)).filter((f) => f.endsWith('.md'));
const targets = [];

for (const file of files) {
  const slug = file.replace(/\.md$/, '');
  const id = heroVideoId(await readFile(path.join(CONTENT, file), 'utf8'));
  if (id) targets.push({ slug, id });
}

console.log(`Found ${targets.length} projects with a YouTube hero.\n`);

const results = [];

for (const { slug, id } of targets) {
  const dir = path.join(ASSETS, slug);
  const dest = path.join(dir, 'poster.jpg');
  const rel = path.relative(process.cwd(), dest);

  if (existsSync(dest) && !FORCE) {
    console.log(`· ${slug.padEnd(24)} exists, skipping (--force to refetch)`);
    results.push({ slug, variant: 'existing', ok: true });
    continue;
  }

  let got;
  for (const variant of VARIANTS) {
    const url = `https://img.youtube.com/vi/${id}/${variant.name}.jpg`;
    const response = await fetch(url);
    if (!response.ok) continue;
    const bytes = Buffer.from(await response.arrayBuffer());

    // YouTube serves a 120x90 grey placeholder with HTTP 200 rather than a 404
    // when a variant does not exist, so the status code alone does not tell you
    // whether you got a real frame. Size is the reliable tell.
    if (bytes.length < 3000) continue;

    await mkdir(dir, { recursive: true });
    await writeFile(dest, bytes);
    got = { ...variant, bytes: bytes.length };
    break;
  }

  if (!got) {
    // Every variant 404ing does not mean "this video has poor thumbnails" — it
    // means YouTube is not serving this ID at all, i.e. the video is private or
    // deleted. That is a far more serious finding than a low-resolution frame,
    // because the site is still *embedding* it, so say which one it is.
    const gone = !(
      await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}`)
    ).ok;
    console.log(
      `✗ ${slug.padEnd(24)} ${gone ? `VIDEO GONE — ${id} is private or deleted` : `no usable frame for ${id}`}`,
    );
    results.push({ slug, variant: 'none', ok: false, gone });
    continue;
  }

  const mark = got.ok ? '✓' : '!';
  console.log(
    `${mark} ${slug.padEnd(24)} ${got.name.padEnd(14)} ~${got.width}px  ${(got.bytes / 1024).toFixed(0)}K  → ${rel}`,
  );
  results.push({ slug, variant: got.name, ok: got.ok });
}

const gone = results.filter((r) => r.gone);
const poor = results.filter((r) => !r.ok && !r.gone);

if (gone.length) {
  console.log(
    `\n✗ ${gone.length} project(s) have a hero video that NO LONGER EXISTS:\n` +
      gone.map((r) => `    ${r.slug}`).join('\n') +
      `\n  These pages are embedding a dead video today. That is a content bug, not a\n` +
      `  thumbnail one — the credit is still true, the embed is not.`,
  );
}

if (poor.length) {
  console.log(
    `\n! ${poor.length} project(s) only had a low-resolution frame:\n` +
      poor.map((r) => `    ${r.slug} (${r.variant})`).join('\n') +
      `\n  These are the candidates for a real capture — see the needs-ali follow-up.`,
  );
}

console.log(`\nDone. Commit the new files under src/assets/images/projects/.`);
