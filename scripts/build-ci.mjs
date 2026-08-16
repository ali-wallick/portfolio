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

const PRODUCTION_BRANCH = 'master';

const branch = process.env.WORKERS_CI_BRANCH ?? '';
const isProduction = branch === PRODUCTION_BRANCH;

console.log(
  isProduction
    ? `Branch "${branch}" is production — building without drafts.`
    : `Branch "${branch || '(unknown)'}" is not production — building WITH drafts.`,
);

execFileSync('npx', ['astro', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, ...(isProduction ? {} : { SHOW_DRAFTS: 'true' }) },
});
