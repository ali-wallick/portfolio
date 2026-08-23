#!/usr/bin/env node
/**
 * The build Cloudflare runs. Picks production vs. preview behaviour from the
 * branch being built.
 *
 * Drafts must render on preview deploys and never in production — that split is
 * what makes the review loop work: push a branch, open the preview on a phone,
 * react, all before anything is fit for aliwallick.com.
 *
 * Cloudflare Pages would have done this with a dashboard environment variable.
 * Workers Builds injects `WORKERS_CI_BRANCH` instead, which is better: the rule
 * lives in the repo where it can be read and reviewed, rather than in dashboard
 * state that is invisible from a checkout — and running this locally behaves
 * exactly the way CI does.
 */

import { execFileSync } from 'node:child_process';

/**
 * `release` is the branch Cloudflare Workers Builds actually deploys to
 * production from. `main` isn't a production deploy at all any more — it's
 * a normal branch that happens to get its own always-open preview URL
 * (`main-portfolio...`) for sharing what's merged, and it needs the same
 * "no drafts" treatment as a real production build for that to be worth
 * sharing.
 */
const NO_DRAFT_BRANCHES = new Set(['main', 'release']);

const branch = process.env.WORKERS_CI_BRANCH ?? '';
const isProduction = NO_DRAFT_BRANCHES.has(branch);

console.log(
  isProduction
    ? `Branch "${branch}" is production — building without drafts.`
    : `Branch "${branch || '(unknown)'}" is not production — building WITH drafts.`,
);

/**
 * OG/Twitter card images. Unlike the resume PDFs below, these only need
 * `sharp` — the same library `astro:assets` already runs on every deploy to
 * optimise every other image on the site — so there's no Chromium-shaped wall
 * here and no reason to commit the output. See scripts/generate-og-images.mjs.
 */
execFileSync('node', ['scripts/generate-og-images.mjs'], { stdio: 'inherit' });

execFileSync('npx', ['astro', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, ...(isProduction ? {} : { SHOW_DRAFTS: 'true' }) },
});

/**
 * The resume PDFs are NOT generated here — they are committed in `public/` and
 * copied into `dist/` by the Astro build above.
 *
 * This was tried the other way first. Cloudflare's build image is Ubuntu 24.04
 * with a fixed apt package list that has `libgbm1` but not `libatk-1.0.so.0`,
 * so Chromium downloads successfully and then dies at launch with "error while
 * loading shared libraries". `playwright install-deps` can't rescue it either:
 * the builder has no root, and the attempt fails with `su: Authentication
 * failure`. GitHub Actions builds the same commit fine, because its runners
 * ship the desktop libs.
 *
 * What runs instead is the browserless staleness check, so the guarantee
 * survives the workaround: if the resume content changed and the PDFs weren't
 * regenerated, this deploy fails rather than quietly shipping a resume that
 * disagrees with the page it links from.
 */
execFileSync('node', ['scripts/build-pdf.mjs', '--check'], { stdio: 'inherit' });
