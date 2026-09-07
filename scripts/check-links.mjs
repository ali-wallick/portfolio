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
 *   6. No word welded to an element      — the 404 shipped `or head<a>home</a>`
 *                                          as one word, because Astro strips
 *                                          the whitespace a line break leaves
 *                                          between text and an element (#338).
 *   7. Headings are title case           — "Featured Work", not "Featured work"
 *                                          (#182), enforceable since #338.
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

/** The handful of entities that survive into headings. */
const decode = (s) =>
  s
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');

/*
 * The function words AP and Chicago both set lowercase inside a title:
 * articles, coordinating conjunctions, and short prepositions. Deliberately
 * short — a word missing from this list is required to be CAPITALISED, which
 * is the safe direction to be wrong in. `I` is a pronoun and is not here, so
 * "What I Built" passes.
 */
const SMALL_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'if',
  'in',
  'nor',
  'of',
  'on',
  'or',
  'per',
  'so',
  'the',
  'to',
  'up',
  'via',
  'vs',
  'yet',
]);

/**
 * A word that is spelled lowercase and stays that way wherever it appears.
 *
 * Two shapes, both of which a "first and last word must be capitalised" rule
 * would otherwise hard-fail with no way to opt out: a name carrying an interior
 * capital (`iOS`, `eBay`), and a domain or path (`aliwallick.com`). Capitalising
 * either would be wrong, so the rule declines to have an opinion rather than
 * demanding an exemption for correct copy.
 */
const intrinsicallyLowercase = (w) => /[A-Z]/.test(w.slice(1)) || /[./@]/.test(w.slice(0, -1));

/**
 * Why `text` is not title case, or `undefined` if it is.
 *
 * First and last words are capitalised, as is the word after a sentence break —
 * a colon, a full stop, a question or exclamation mark, or a dash. Both styles
 * agree on all of them, and a naive small-word rule gets every one wrong:
 * "Shipped. The Rest Is History" and "Part One — The Beginning" are correct and
 * would otherwise fail a build the whole site is gated on.
 *
 * Single-word headings have no case convention to break and are skipped, which
 * is what #182 means by "multi-word".
 *
 * Only the first character is judged, so an interior capital (`KinoClue`,
 * `B.S.`) is never the thing that fails — this asks whether a word was
 * capitalised, not how it is spelled.
 */
function miscased(text) {
  const words = text.split(' ').filter(Boolean);
  if (words.length < 2) return undefined;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const first = w[0];
    if (!/\p{L}/u.test(first)) continue;
    if (intrinsicallyLowercase(w)) continue;
    const afterBreak = i > 0 && /[:.!?—–-]$/.test(words[i - 1]);
    const mustCap = i === 0 || i === words.length - 1 || afterBreak;
    const isSmall = SMALL_WORDS.has(w.toLowerCase().replace(/[.,:;!?]+$/, ''));
    if (mustCap || !isSmall) {
      if (first !== first.toUpperCase()) return `"${w}" should be capitalised`;
    } else if (first !== first.toLowerCase()) {
      return `"${w}" is a function word and should be lowercase`;
    }
  }
  return undefined;
}

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

  // --- 7. No word welded to an inline element -------------------------------
  //
  // Astro strips the whitespace between a text node and a following element
  // when a newline separates them, so `or head` at the end of one line and
  // `<a href="/">home</a>` starting the next render as ONE WORD. The 404
  // shipped exactly that on main until 2026-08-24. The fix is `{' '}` or
  // keeping the sentence on one line; this is the guard that was missing.
  //
  // Checked on the output, like rule 6 and for the same reason — the bug is a
  // property of the render, and a source rule would have to know which of
  // .astro, Markdown or front matter the text came from.
  //
  // TWO NARROWINGS, both measured rather than guessed (#338):
  //
  // Only the OPEN side. `</a>` followed by text is the same shape in reverse,
  // but it is how correct markup looks: `</a>.` and `</a>,` appear about ten
  // times in about.astro and 404.astro alone, and Markdown run-in labels
  // render `<strong>HUD:</strong> Player…`. A close-side check is all noise.
  // The content record says the bug happens "in either direction" — that is
  // about the BUG, not about what is worth checking. Don't add the other half.
  //
  // Only inside <p> and <li>. The rule is about a line of prose wrapping, and
  // outside prose a missing space is routinely supplied by layout: the résumé's
  // download button is an `inline-flex` with a `gap`, so its `Download PDF`
  // abuts `<span class="resume-pages">` in the HTML and still renders with a
  // space. Unscoped this rule reports those two buttons and nothing else —
  // 2 hits, 0 of them bugs. Scoped to prose it reports nothing, which is the
  // rate a guard has to hit to be worth more than the sentence it replaces.
  const INLINE = 'a|em|strong|b|i|code|abbr|span|small|cite|q';
  const welded = new RegExp(`([A-Za-z0-9])<(?:${INLINE})\\b[^>]*>(?=[A-Za-z0-9])`, 'gi');
  for (const block of html.matchAll(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const inner = block[2].replace(/<(script|style|pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
    for (const m of inner.matchAll(welded)) {
      const context = inner
        .slice(Math.max(0, m.index - 40), m.index + 40)
        .replace(/\s+/g, ' ')
        .trim();
      report(rel, `word welded to an inline element (use {' '}, #338): …${context}…`);
    }
  }

  // --- 8. Multi-word headings are title case --------------------------------
  //
  // Settled #182 on Ali's call: "Featured Work", not "Featured work", by
  // AP/Chicago rules rather than capitalising every word.
  //
  // Scoped to <h2>, and that scope is the whole reason this is buildable
  // (#338). Every <h2> on the site is hand-authored — six in .astro, five in
  // the résumé, and the `##` headings in project write-ups. Every <h1> and
  // <h3> is DATA: a project title, a job title, a school. Those are proper
  // nouns, they are what #182's carve-out excludes, and they are also what
  // breaks a generic checker — `aliwallick.com` is deliberately lowercase,
  // `Critter³` has a superscript inside a word, and `Dead Booty: An Atari 2600
  // Game` is correct precisely because both styles capitalise after a colon.
  // Checking them would mean inventing exemptions for correct copy.
  //
  // So: don't extend this to <h3>. The finding that it is clean on <h2> is not
  // evidence it would be clean anywhere else — the brief's own warning is that
  // an observed regularity about this site's headings got cited back as a rule
  // twice before Ali named it an accident.
  for (const h of html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)) {
    const text = decode(h[1].replace(/<[^>]+>/g, ''))
      .replace(/\s+/g, ' ')
      .trim();
    const bad = miscased(text);
    if (bad) report(rel, `heading is not title case (#182): "${text}" — ${bad}`);
  }
}

const pageWord = htmlFiles.length === 1 ? 'page' : 'pages';
if (problems.length === 0) {
  console.log(
    `✓ ${htmlFiles.length} ${pageWord} checked — links resolve, no http://, alt text present, apostrophes curly, no welded words, headings title case.`,
  );
  process.exit(0);
}

console.error(`✗ ${problems.length} problem(s) across ${htmlFiles.length} ${pageWord}:\n`);
for (const { file, message } of problems) console.error(`  ${file}: ${message}`);
process.exit(1);
