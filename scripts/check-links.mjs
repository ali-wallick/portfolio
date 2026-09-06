#!/usr/bin/env node
/**
 * Post-build checks on `dist/`.
 *
 * Deliberately hand-written and zero-dependency instead of pulling in a generic
 * link checker, because the rules that matter here are specific to this site's
 * history. Every one of them is a regression guard for something the old
 * aliwallick.com actually got wrong:
 *
 *   1. Internal links resolve            — the old projects index linked
 *                                          `artOfRescue`, which only worked
 *                                          because of a stale duplicate file.
 *   2. No `http://` subresources         — five YouTube embeds and the
 *                                          html5shiv were http-only, so
 *                                          browsers blocked them outright.
 *   3. Every <img> has alt text          — none of the old ones did.
 *   4. Every page has <title> + viewport — the old site had no viewport meta at
 *                                          all and rendered zoomed out on phones.
 *   5. One apostrophe, everywhere         — front matter used to render `didn't`
 *                                          next to a body paragraph's `didn’t`
 *                                          on the same page (#188).
 *
 * External links are NOT fetched. That makes the check fast, offline, and
 * deterministic in CI; genuinely dead outbound links are tracked in the content
 * model instead, via `links[].dead`.
 *
 * Usage: node scripts/check-links.mjs [dist-dir]
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { walkFiles } from './lib/walk-files.mjs';

const DIST = path.resolve(process.argv[2] ?? 'dist');

if (!existsSync(DIST)) {
  console.error(`✗ ${DIST} does not exist — run \`npm run build\` first.`);
  process.exit(1);
}

/** @type {{file: string, message: string}[]} */
const problems = [];
const report = (file, message) => problems.push({ file, message });

const allFiles = await walkFiles(DIST);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));
const distPaths = new Set(
  allFiles.map((f) => '/' + path.relative(DIST, f).split(path.sep).join('/')),
);

/**
 * Resolve an internal href the way the built site serves it.
 * astro.config.mjs uses `trailingSlash: 'never'` + `build.format: 'file'`, so
 * `/about` is served from `about.html`. Both forms are accepted here.
 */
function resolvesInDist(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const candidates =
    clean === '/'
      ? ['/index.html']
      : [clean, `${clean}.html`, `${clean}/index.html`, decodeURIComponent(`${clean}.html`)];
  return candidates.some((c) => distPaths.has(c));
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[2] ?? m[3]) : undefined;
};

for (const file of htmlFiles) {
  const rel = path.relative(DIST, file);
  const html = await readFile(file, 'utf8');
  const isDraft = /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html);

  // --- 4. Structural floor -------------------------------------------------
  if (!/<title>[^<]+<\/title>/i.test(html)) report(rel, 'missing a non-empty <title>');
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) report(rel, 'missing the viewport meta tag');
  if (!/<html[^>]+lang=/i.test(html)) report(rel, 'missing lang on <html>');

  // --- 1. Internal links resolve ------------------------------------------
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref\s*=\s*"([^"]*)"/gi)) {
    if (!href || /^(https?:|mailto:|tel:|#|data:)/i.test(href)) continue;
    if (!href.startsWith('/')) {
      report(rel, `relative link "${href}" — use root-relative hrefs so pages can move`);
      continue;
    }
    const pathname = href.split('#')[0].split('?')[0];
    if (!resolvesInDist(pathname)) report(rel, `broken internal link: ${href}`);
  }

  // --- 2. No http:// subresources -----------------------------------------
  for (const [tag] of html.matchAll(/<(?:img|script|iframe|source|link|video|audio)\b[^>]*>/gi)) {
    for (const name of ['src', 'href', 'srcset']) {
      const value = attr(tag, name);
      if (value && /^http:\/\//i.test(value)) {
        report(rel, `insecure http:// subresource: ${value}`);
      }
    }
  }

  // --- 3. Images have alt text --------------------------------------------
  //
  // The bug this guards is *missing* alt, which the old site had on every image
  // it ever served. An explicitly EMPTY alt is the opposite of that bug: it is
  // the correct markup for a decorative image, and it tells a screen reader to
  // skip an image that would otherwise be announced redundantly.
  //
  // Both spellings count as present. `alt=""` survives as written, but the
  // build minifier collapses it to a valueless `alt` — which HTML5 defines as
  // identical and which `attr()` cannot see, since it only matches `name="…"`.
  // Without the second test every decorative image on the site fails this
  // check for being correct.
  for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
    const hasAlt = attr(tag, 'alt') !== undefined || /\balt(?=[\s/>=])/i.test(tag);
    if (!hasAlt) report(rel, `<img> with no alt attribute: ${attr(tag, 'src') ?? tag}`);
  }

  // --- 5. No HTML comments in published markup -----------------------------
  // Caught for real: a `<!-- TODO(phase-6): ... -->` note in BaseLayout was
  // being emitted into all 23 pages. In .astro files `<!-- -->` ships and
  // `{/* */}` does not, which is easy to forget; in Markdown bodies, HTML
  // comments always render through.
  //
  // Draft pages are exempt. Working notes are the whole point of a draft, and
  // drafts only exist on preview deploys. The exemption disappears the moment
  // the page is published — same discipline the content schema uses, where
  // `draft: false` starts enforcing completeness.
  if (!isDraft) {
    for (const [comment] of html.matchAll(/<!--[\s\S]*?-->/g)) {
      const preview = comment.replace(/\s+/g, ' ').slice(0, 60);
      report(rel, `HTML comment in published output (use {/* */} in .astro): ${preview}…`);
    }
  }

  // --- 6. One apostrophe, everywhere ---------------------------------------
  //
  // Settled #188: the site uses the typographic apostrophe (’). The bug is not
  // that a straight one is wrong on its own — it is that only SOME of the site
  // got them. Markdown bodies go through Astro's smartypants and come out curly;
  // YAML front matter and .astro prose do not, so a `caption` rendered `didn't`
  // directly beside a paragraph's `didn’t`. Both were on the same page.
  //
  // Checked on the OUTPUT rather than the source on purpose: that is the only
  // place the three sources meet, so it catches the seam wherever it opens
  // without caring which file the text came from.
  //
  // Code is exempt — `{' '}` in a write-up about .astro whitespace is quoting
  // source, not writing prose, and curling it would make it wrong.
  const prose = html
    .replace(/<(script|style|pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, ' ');
  const straight = /&#0*39;|&apos;|&#x0*27;|'/i;
  if (straight.test(prose)) {
    const at = prose.search(straight);
    const context = prose
      .slice(Math.max(0, at - 40), at + 20)
      .replace(/\s+/g, ' ')
      .trim();
    report(rel, `straight apostrophe in rendered prose (use ’, #188): …${context}…`);
  }

  // Alt text and meta descriptions are prose too, and they live in attributes
  // where the tag-stripping above cannot see them.
  for (const [tag] of html.matchAll(/<(?:img|meta)\b[^>]*>/gi)) {
    for (const name of ['alt', 'content']) {
      const value = attr(tag, name);
      if (value && straight.test(value)) {
        report(rel, `straight apostrophe in ${name}="…" (use ’, #188): ${value.slice(0, 60)}…`);
      }
    }
  }
}

const pageWord = htmlFiles.length === 1 ? 'page' : 'pages';
if (problems.length === 0) {
  console.log(
    `✓ ${htmlFiles.length} ${pageWord} checked — links resolve, no http://, alt text present, apostrophes curly.`,
  );
  process.exit(0);
}

console.error(`✗ ${problems.length} problem(s) across ${htmlFiles.length} ${pageWord}:\n`);
for (const { file, message } of problems) console.error(`  ${file}: ${message}`);
process.exit(1);
