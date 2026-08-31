#!/usr/bin/env node
/**
 * `npm ci`'s postinstall hook. Normally just `playwright install --only-shell
 * chromium`, wrapped so a specific known failure mode doesn't fail the
 * install. See issue #245.
 *
 * Claude Code web sessions' egress proxy blocks `cdn.playwright.dev`, so the
 * download 403s and `npm ci` exits 1 — even though `node_modules` is fully
 * populated by that point and only the browser fetch failed.
 * `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` doesn't help: it suppresses the
 * `playwright` package's own postinstall hook, not this explicit CLI call.
 *
 * Those sessions' image ships a working Chromium at
 * `$PLAYWRIGHT_BROWSERS_PATH/chromium` (a different revision/layout than
 * what's pinned, which is why `playwright install` doesn't just find it
 * itself). So: try the real install first, exactly as before, in every
 * environment. Only on failure, check for that specific fallback — if it's
 * there, warn and exit clean rather than failing the whole install; if it
 * isn't, fail exactly as before. `scripts/lib/launch-chromium.mjs` is the
 * other half: it's what actually falls back to that binary at launch time.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const result = spawnSync('playwright', ['install', '--only-shell', 'chromium'], {
  stdio: 'inherit',
  shell: true,
});

if (result.status === 0) process.exit(0);

const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH;
const fallback = browsersPath && path.join(browsersPath, 'chromium');

if (fallback && existsSync(fallback)) {
  console.warn(
    `\n⚠ playwright install failed (see above), but found a pre-installed Chromium at ${fallback}.\n` +
      '  build:pdf and check:resume-print fall back to it automatically — see issue #245.\n',
  );
  process.exit(0);
}

process.exit(result.status ?? 1);
