/**
 * Open a resume route under print media, with webfonts actually loaded
 * before returning — the #306 fix, extracted so a second hand-written copy
 * can't silently drop the ordering that makes it work.
 *
 * `build-pdf.mjs` and `check-resume-print.mjs` both used to do this inline:
 * `context.newPage()` → `page.goto(url, { waitUntil: 'networkidle' })` →
 * check `response.ok()` → `page.emulateMedia({ media: 'print' })` →
 * `page.evaluate(() => document.fonts.ready)`. That order is not incidental.
 *
 * ## The emulate-before-fonts.ready order is the whole point (#306)
 *
 * `page.pdf()` emulates print internally, which makes calling
 * `emulateMedia()` here look redundant — it is not. A webfont is fetched
 * lazily, when some element actually uses it, and `--font-body` only points
 * at Public Sans inside `resume.css`'s `@media print` block. On screen the
 * resume is set in Figtree, so nothing requests Public Sans,
 * `document.fonts.ready` resolves happily without it, and a print snapshot
 * taken then is rendered before the fetch it just triggered can land.
 * Chromium falls through `--font-body`'s stack to a platform face instead.
 *
 * That shipped for months and is exactly the bug #191 believed it had
 * closed: the committed PDFs were Helvetica when rendered on Ali's Mac and
 * Liberation Sans when rendered on Linux — machine-dependent, and on macOS a
 * face not licensed for embedding in a distributed document. It hid because
 * the two guards measure different things. `check-resume-print.mjs` emulates
 * print media (as here) and so has always measured the real Public Sans
 * layout; nothing looked at the PDF's own embedded fonts, so #306 read as a
 * subsetting curiosity. `build-pdf.mjs`'s `assertPrintFace` is that missing
 * look.
 *
 * Emulating print first makes the font used, which starts the fetch, which
 * `document.fonts.ready` then genuinely waits for. Chromium will otherwise
 * happily lay out (or paginate) mid-glyph-load and hand back fallback
 * metrics.
 *
 * ## Failure is the caller's to handle
 *
 * On a non-OK response this closes the page itself (nothing else will) and
 * throws, carrying the response status on the error so each caller can keep
 * its own reporting: `build-pdf.mjs` records the problem and moves on to the
 * next route, `check-resume-print.mjs` prints and exits 1.
 */

/**
 * @param {import('playwright').BrowserContext} context
 * @param {string} url
 * @returns {Promise<import('playwright').Page>}
 */
export async function openPrintPage(context, url) {
  const page = await context.newPage();
  const response = await page.goto(url, { waitUntil: 'networkidle' });

  if (!response || !response.ok()) {
    await page.close();
    const err = new Error(`${url} returned ${response ? response.status() : 'no response'}`);
    err.status = response ? response.status() : undefined;
    throw err;
  }

  await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => document.fonts.ready);

  return page;
}
