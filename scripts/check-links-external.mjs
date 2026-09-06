#!/usr/bin/env node
/**
 * Outbound link liveness for `dist/`. **Manual only — never in CI.**
 *
 * `scripts/check-links.mjs` deliberately does not fetch external links, and
 * that is the right call for the check that gates every deploy: it keeps CI
 * fast, offline, and deterministic. But it leaves the other half unchecked
 * forever, on a site whose content model has a `links[].dead` field precisely
 * because the old aliwallick.com linked firefall.com, kaneva.com and
 * argamestudio.org for years after all three went dark.
 *
 * So this is the same job from the other side, run by hand:
 *
 *   npm run links:external
 *
 * ## Why this must not join `npm run verify`
 *
 * A deploy that fails because someone else's server is down or rate-limiting
 * the runner is a worse failure than a stale link — it blocks shipping a fix
 * for an unrelated problem, and it trains everyone to ignore red CI. Same
 * reasoning as the note on #203 about not build-checking a storefront rating.
 * Run this before a launch and periodically after one, not on every push.
 *
 * ## Three buckets, not two
 *
 * The naive version of this script cries wolf and gets ignored by its third
 * run. LinkedIn answers HTTP 999 to anything that isn't a browser, Instagram
 * and GitHub commonly answer 403 to a bare HEAD from a datacenter IP, and
 * universitysynagogue.org answers 406 the same way (confirmed alive and
 * rendering normally in a real browser — see #204). None of that means the
 * page is gone. So results are bucketed:
 *
 *   OK           2xx/3xx. The link resolves.
 *   UNVERIFIABLE 401/403/405/406/429/999, or a proxy/network refusal. The host
 *                is answering but won't answer *us*. Needs a human with a
 *                browser; it is not evidence of rot.
 *   DEAD         404/410, DNS failure, or 5xx that persists. Act on these.
 *
 * **Only DEAD sets a non-zero exit code.** UNVERIFIABLE is listed and
 * explained so a person can spot-check the handful that matter, which on this
 * site is a short list.
 *
 * ## YouTube gets a second, different check
 *
 * A `youtube-nocookie.com/embed/<id>` URL answers 200 for a video that has
 * been deleted or made private — the player page loads and then shows an
 * error, so a status check proves nothing. Three of the old site's nine
 * embeds are gone exactly this way (see docs/PRESERVATION.md), which is the
 * failure mode most worth catching here: a dead hero video on a featured page
 * is invisible to every other guard in the repo.
 *
 * YouTube's oEmbed endpoint answers 404 for an unavailable video, so embeds
 * are resolved through that instead of by fetching the embed URL.
 *
 * Usage: node scripts/check-links-external.mjs [dist-dir]
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { walkFiles } from './lib/walk-files.mjs';

const DIST = path.resolve(process.argv[2] ?? 'dist');
const SITE_HOST = 'aliwallick.com';
const CONCURRENCY = 6;
const TIMEOUT_MS = 20_000;

/** Statuses that mean "the host is answering, but not to a script." */
const UNVERIFIABLE_STATUS = new Set([401, 403, 405, 406, 429, 999]);

if (!existsSync(DIST)) {
  console.error(`✗ ${DIST} does not exist — run \`npm run build\` first.`);
  process.exit(1);
}

// --- Collect every outbound URL, and remember where each one came from -----
// A URL that appears on six pages is fetched once and reported once, but the
// report still has to say where to go and fix it.

/** @type {Map<string, Set<string>>} url -> pages it appears on */
const urls = new Map();

for (const file of (await walkFiles(DIST)).filter((f) => f.endsWith('.html'))) {
  const rel = path.relative(DIST, file);
  const html = await readFile(file, 'utf8');
  for (const [, raw] of html.matchAll(/(?:href|src)\s*=\s*"(https?:\/\/[^"]+)"/gi)) {
    const url = raw.replace(/&amp;/g, '&');
    let host;
    try {
      host = new URL(url).host;
    } catch {
      continue;
    }
    // The site's own absolute URLs (canonical, og:url, the resume's self-link)
    // point at a domain that does not serve this site until the cutover, so
    // checking them would report the old PHP site or a 404 either way.
    if (host === SITE_HOST || host.endsWith(`.${SITE_HOST}`)) continue;
    if (!urls.has(url)) urls.set(url, new Set());
    urls.get(url).add(rel);
  }
}

/**
 * The URL actually worth fetching for a given link.
 *
 * For a YouTube embed that is the oEmbed endpoint rather than the embed URL —
 * see the header. Everything else is fetched as written.
 */
function probeFor(url) {
  const embed = url.match(/^https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})/);
  if (!embed) return { probe: url, note: undefined };
  const watch = `https://www.youtube.com/watch?v=${embed[1]}`;
  return {
    probe: `https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`,
    note: 'via oEmbed — a 200 on the embed URL would not prove the video still plays',
  };
}

async function fetchStatus(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        // Several of these hosts serve a challenge page to an obvious bot.
        // Presenting as a browser reduces false UNVERIFIABLEs; it does not
        // defeat anything that is deliberately gated.
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
      },
    });
    return { status: res.status, finalUrl: res.url };
  } finally {
    clearTimeout(timer);
  }
}

async function check(url) {
  const { probe, note } = probeFor(url);
  let status;
  let finalUrl;
  let error;

  for (const method of ['HEAD', 'GET']) {
    try {
      ({ status, finalUrl } = await fetchStatus(probe, method));
      error = undefined;
      // A HEAD rejection is a server quirk, not an answer about the resource.
      if (method === 'HEAD' && (status === 403 || status === 405 || status >= 500)) continue;
      break;
    } catch (e) {
      error = e;
    }
  }

  if (error) {
    // A refusal from the local egress proxy is a fact about this machine, not
    // about the link. Saying "DEAD" here would be the single most misleading
    // thing this script could do.
    return {
      url,
      bucket: 'UNVERIFIABLE',
      detail: `request failed (${error.name === 'AbortError' ? 'timed out' : error.message})`,
      note,
    };
  }
  if (UNVERIFIABLE_STATUS.has(status)) {
    return { url, bucket: 'UNVERIFIABLE', detail: `HTTP ${status}`, note };
  }
  if (status >= 400) {
    return { url, bucket: 'DEAD', detail: `HTTP ${status}`, note };
  }
  const redirected = finalUrl && finalUrl !== probe ? ` → ${finalUrl}` : '';
  return { url, bucket: 'OK', detail: `HTTP ${status}${redirected}`, note };
}

// --- Run, with a small concurrency cap ------------------------------------

const targets = [...urls.keys()].sort();
console.log(`Checking ${targets.length} outbound URLs from ${DIST} …\n`);

/** @type {Awaited<ReturnType<typeof check>>[]} */
const results = [];
let next = 0;
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, targets.length) }, async () => {
    while (next < targets.length) results.push(await check(targets[next++]));
  }),
);

const by = (bucket) =>
  results.filter((r) => r.bucket === bucket).sort((a, b) => a.url.localeCompare(b.url));
const ok = by('OK');
const unverifiable = by('UNVERIFIABLE');
const dead = by('DEAD');

const where = (url) => [...urls.get(url)].sort().join(', ');

for (const r of dead) {
  console.error(
    `✗ DEAD          ${r.url}\n                ${r.detail}${r.note ? ` (${r.note})` : ''}\n                on: ${where(r.url)}`,
  );
}
for (const r of unverifiable) {
  console.log(
    `? UNVERIFIABLE  ${r.url}\n                ${r.detail}${r.note ? ` (${r.note})` : ''}\n                on: ${where(r.url)}`,
  );
}
for (const r of ok) {
  console.log(`✓ OK            ${r.url}  ${r.detail}${r.note ? `  (${r.note})` : ''}`);
}

console.log(
  `\n${ok.length} ok · ${unverifiable.length} unverifiable · ${dead.length} dead  (of ${targets.length})`,
);

if (unverifiable.length > 0) {
  console.log(
    'Unverifiable means the host would not answer this script — open those in a browser.\n' +
      'It is not evidence the link is broken, and it does not fail this check.',
  );
}

if (dead.length > 0) {
  console.error(
    `\n✗ ${dead.length} outbound link(s) look genuinely gone.\n` +
      'Fix by updating the URL, swapping in a Wayback snapshot, or setting `dead: true`\n' +
      "on the link in the project's front matter — see src/content.config.ts.",
  );
  process.exit(1);
}

console.log('\n✓ no dead outbound links.');
