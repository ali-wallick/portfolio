#!/usr/bin/env node
/**
 * Remove the Cloudflare Web Analytics beacon `<script>` tag from every built
 * HTML page, in place, before handing `dist/` to Lighthouse CI.
 *
 * Exists because the beacon's CORS preflight can never succeed against lhci's
 * local static server: `cloudflareinsights.com` always echoes back
 * `http://localhost` with no port on its `Access-Control-Allow-Origin`
 * header, no matter what origin (or port) actually asked — confirmed by
 * probing the endpoint directly, including with a bare `http://localhost`
 * origin (matches) and a ported one (doesn't). lhci's `staticDistDir` always
 * binds a random port and cannot be pinned to 80, the one port that would
 * make the origin header portless and thus matching, so the request fails
 * preflight and `errors-in-console` scores 0 on every page, real or not. On
 * `aliwallick.com` the origin matches the beacon's own and this never
 * happens — it's purely an artifact of measuring `dist/` from a local
 * server. See #221.
 *
 * This only touches the copy of `dist/` the Lighthouse job downloads for
 * measurement; the artifact the `build` job uploads (and everything Cloudflare
 * actually deploys) is untouched.
 *
 * Usage: node scripts/strip-lighthouse-beacon.mjs [dist-dir]
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';

const DIR = path.resolve(process.argv[2] ?? 'dist');
const BEACON_TAG =
  /<script[^>]*\bsrc="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js"[^>]*><\/script>/g;

/** @param {string} dir @return {string[]} */
function findHtmlFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...findHtmlFiles(full));
    } else if (entry.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

const htmlFiles = findHtmlFiles(DIR);
let stripped = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  if (!BEACON_TAG.test(html)) continue;
  BEACON_TAG.lastIndex = 0;
  writeFileSync(file, html.replace(BEACON_TAG, ''));
  stripped++;
}

console.log(
  `Stripped the Cloudflare Insights beacon from ${stripped}/${htmlFiles.length} page(s).`,
);
