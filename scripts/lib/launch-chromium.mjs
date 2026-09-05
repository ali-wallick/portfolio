/**
 * Launches Chromium for any script that needs a headless browser, with a
 * fallback for Claude Code web sessions. See issue #245. Every script under
 * `scripts/` that launches Chromium should go through this rather than
 * calling `chromium.launch()` directly — see #309, where `resume-headroom.mjs`
 * hadn't and couldn't run in a web session as a result.
 *
 * Those sessions' egress proxy blocks `cdn.playwright.dev`, so
 * `playwright install` (the package.json `postinstall`) can't fetch the
 * revision Playwright is pinned to. `scripts/postinstall-playwright.mjs`
 * tolerates that failure when it detects the session image's own
 * pre-installed Chromium at `$PLAYWRIGHT_BROWSERS_PATH/chromium` — but a
 * tolerated install still leaves `chromium.launch()` pointed at a revision
 * that was never downloaded. This is the other half: try the normal launch
 * first, so every other environment (CI, Ali's machine) is untouched, and
 * fall back to the pre-installed binary only if that fails and it exists.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';

export async function launchChromium() {
  const { chromium } = await import('playwright');
  try {
    return await chromium.launch();
  } catch (error) {
    const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH;
    const fallback = browsersPath && path.join(browsersPath, 'chromium');
    if (!fallback || !existsSync(fallback)) throw error;
    return await chromium.launch({ executablePath: fallback });
  }
}
