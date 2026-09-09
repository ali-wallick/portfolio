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
 *   8. One canonical, naming its own URL — Search Console dropped a page as a
 *                                          duplicate with no canonical
 *                                          detected, on a site where every
 *                                          page emits one (#345).
 *   9. Sitemap entries canonicalise to   — the same report, filtered to URLs
 *      themselves                          the site actively submits. An entry
 *                                          that points elsewhere asks Google
 *                                          to index a page and then tells it
 *                                          not to (#345).
 *  12. One spelling variant, everywhere  — a published page said "the colours".
 *                                          Nothing had ever stated which
 *                                          variant the site uses, so agents
 *                                          picked one per sentence (#357).
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
import { site, live } from '../src/config/site.ts';

const ORIGIN = new URL(site.url).origin;

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

/**
 * The built HTML file a clean route is served from, or `undefined`.
 *
 * The sibling of `resolvesInDist` and deliberately not folded into it: that
 * one answers "does this href go anywhere", including at non-HTML assets like
 * `/resume.pdf`, and returns a boolean. This one has to hand back the file so
 * its canonical can be read, and only ever matches HTML.
 */
function htmlFileFor(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const candidates = clean === '/' ? ['/index.html'] : [`${clean}.html`, `${clean}/index.html`];
  const hit = candidates.find((c) => distPaths.has(c));
  return hit ? path.join(DIST, hit.slice(1)) : undefined;
}

/**
 * The clean, extensionless route a built file is served at.
 *
 * The two replaces are copied verbatim from `BaseLayout.astro`'s `cleanPath`,
 * which derives the canonical from `Astro.url.pathname` — same transform, one
 * applied to the route Astro knows and one to the path the file actually
 * landed at. That is the whole point: this cannot catch a bug *in* the
 * transform, because it shares it. What it catches is the two drifting, which
 * is what a page canonicalising at a URL it is not served from means.
 */
function servedRoute(file) {
  return ('/' + path.relative(DIST, file).split(path.sep).join('/'))
    .replace(/(^|\/)index\.html$/, '$1')
    .replace(/\.html$/, '');
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
 * British spellings that rule 12 fails the build on. Specific forms only — see
 * the rationale at the check itself for why this is not an `-our`/`-ise`
 * pattern, and which forms are deliberately absent.
 *
 * Word-boundary anchored on purpose: `aria-labelledby` is a real HTML attribute
 * and appears five times in the built résumé, so a substring match would fail
 * the build on correct markup.
 */
const BRITISH = new RegExp(
  '\\b(' +
    [
      // -our
      'colours?|colour(?:ed|ing|ful)|recolouring',
      'behaviours?|behavioural',
      'favourite|favours?|favoured|flavours?|humour|labour|rumour|armour|endeavour|harbour',
      'honours?|honoured|honouring|neighbours?|neighbouring',
      'odour|parlour|saviour|splendour|vapour',
      // -ise / -isation. Stem + `is` + suffix, so `emphasis`, `analysis`,
      // `capitalism` and `specialist` never match — only the inflected verb
      // forms do, which is the whole difference between a variant and a word.
      '(?:normal|optim|organ|recogn|unrecogn|real|priorit|minim|maxim|summar|categor|custom|visual)' +
        'is(?:e|es|ed|ing|ation)',
      '(?:initial|serial|util|apolog|emphas|standard|character|special|memor|familiar|sanit|synthes)' +
        'is(?:e|es|ed|ing|ation)',
      '(?:item|capital|central|general|final|stabil|local|global|social|author|canonical|equal)' +
        'is(?:e|es|ed|ing|ation)',
      '(?:human|hypothes|literal|moral|parallel|token|econom|reorgan|undramat)' +
        'is(?:e|es|ed|ing|ation)',
      '(?:recogn|custom|general)isable|organisational|(?:sanit|token)iser',
      // -lled / -lling
      'labelled|labelling|unlabelled|relabelled|cancelled|cancelling|modelled|modelling',
      'travelled|travelling|traveller|fuelled|signalled|totalled|totalling',
      'levelled|marvelled|counsellor|jeweller',
      // -re
      'centres?|centred|centring|metres?|theatres?|fibres?|litres?|calibre|sombre|lustre',
      // -ce and the one-offs
      'greys?|greyed|greyish|greyscale|defence|offences?|pretence|licence',
      'practise|practised|practising|programmes?|storeys?|judgement|acknowledgements?',
      'aluminium|aeroplane|draught|plough|moulded|moulding|smoulder|mould',
      'sceptical|scepticism|sceptic|specialit(?:y|ies)|cheques?|kerb|tyres?',
      'enrolment|fulfilment|instalment|skilful|wilful|manoeuvre|foetus|paediatric|mediaeval',
      'anaesthetic',
    ].join('|') +
    ')\\b',
  'i',
);

/**
 * The wordlist above has one failure mode that matters, and it is silent in the
 * dangerous direction: a form that also matches the AMERICAN spelling fails the
 * build on correct copy, everywhere, at once. Two drafts of it did exactly that
 * — `colou?rs?` matched "color" and `honou?red` matched "honored" — and the
 * only reason it was caught is that the site already says "color" on two pages.
 * A wordlist edit that broke a word the site does not happen to use yet would
 * have shipped.
 *
 * So the list is asserted against a sample of correct forms before it is used:
 * the same-stem American spellings, plus the words that merely look like
 * variants (`analysis` and `emphasis` are not `-ise` verbs, `dialog`/`catalog`
 * are standard, `aria-labelledby` is markup). Extending the list above without
 * extending this is the mistake this is here to make loud.
 */
for (const word of [
  'color colors colored coloring favorite honored neighbors odor vapor',
  'normalized optimize organization recognizable authorization canonicalizes',
  'labeled unlabeled traveling totaling centered meter theater gray grayscale',
  'defense license practicing program judgment molding skeptical specialty',
  'analysis emphasis synthesis hypothesis capitalism socialism specialist generalist',
  'dialog dialogue catalog catalogue analogue aria-labelledby scroll-behavior',
].flatMap((line) => line.split(' '))) {
  if (BRITISH.test(word)) {
    console.error(
      `✗ check-links.mjs bug: the rule 12 wordlist matches "${word}", which is correct ` +
        `American English. Fix the pattern — as written it would fail the build on valid copy.`,
    );
    process.exit(1);
  }
}

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

/** Dist path (`/about.html`) -> what rule 9 found there, for rule 10 to read. */
const pages = new Map();

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

  // --- 12. One spelling variant, everywhere ---------------------------------
  //
  // Settled #357: the site is American, and until that issue nothing had ever
  // said so. Ali's own writing is American throughout — zero British spellings
  // in 42,000 words across `snapshot/` and `content/archive/` — but the docs,
  // skills and code comments an agent reads before its first tool call had
  // accumulated 452 British ones, and prose written under that priming matched
  // it. "The colours" reached a published page that way.
  //
  // The sweep deliberately stopped at reader-facing prose, so this guard is
  // what makes that scope safe: the leak upstream is allowed to continue, and
  // is caught here at the only boundary with a reader behind it.
  //
  // Numbered 12 (the next free number) but placed beside rule 6 rather than in
  // numeric order, because it reuses that rule's `prose` and its alt/meta pass
  // and is the same shape of rule — one variant everywhere, checked on the
  // OUTPUT because that is the only place the three prose sources meet. Rules
  // 9–11 are cross-referenced by number from `docs/decisions/`, so renumbering
  // to put this in sequence would invalidate them.
  //
  // A wordlist of specific forms, never an `-our`/`-ise` pattern: `analyse`
  // and `analysis` are different words, `precise` and `otherwise` are not
  // variants of anything, and `--color-*` token names are American already.
  // `dialogue` and `catalogue` are left out on purpose — both are standard in
  // American English, and `dialog` means the UI element rather than the
  // conversation. Code is exempt for free, since `prose` already strips
  // <code>/<pre>: a write-up quoting a British source is quoting, not writing.
  // The residual false positive is a proper noun — a game actually titled
  // *Centre*. Exempt that form here when it happens rather than loosening the
  // list; no such title exists today, so the hook for it is deliberately not
  // built (the call #338 made about its own candidates).
  for (const [text, where] of [
    [prose, 'rendered prose'],
    ...[...html.matchAll(/<(?:img|meta)\b[^>]*>/gi)].flatMap(([tag]) =>
      ['alt', 'content']
        .map((name) => [attr(tag, name), `${name}="…"`])
        .filter(([value]) => Boolean(value)),
    ),
  ]) {
    const found = text.match(BRITISH);
    if (found) {
      report(rel, `British spelling "${found[0]}" in ${where} — the site is American (#357)`);
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

  // --- 9. One canonical, and it names the URL the page is served at ---------
  //
  // Search Console reported pages on this site as "Duplicate without
  // user-selected canonical" — i.e. it crawled them and found no canonical at
  // all — while `BaseLayout.astro` emits one on every page it builds (#345).
  // Nothing asserted the two agreed, which is what put the canonical rule on
  // the brief's list of rules with no guard behind them.
  //
  // Three separate failures, because they fail differently. A MISSING one
  // leaves Google to pick a URL; a SECOND one is ignored wholesale, so a page
  // with two has effectively none; and a RELATIVE one resolves against
  // whatever host served the page, which on this site means every branch
  // preview canonicalising to itself instead of to the apex — the one thing
  // `cleanPath` exists to prevent.
  /** Left undefined unless exactly one usable tag was found — rule 10 skips those. */
  let canonical;
  const canonicals = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => (attr(tag, 'rel') ?? '').trim().toLowerCase() === 'canonical');

  if (canonicals.length === 0) {
    report(rel, 'no <link rel="canonical"> (#345)');
  } else if (canonicals.length > 1) {
    report(
      rel,
      `${canonicals.length} <link rel="canonical"> tags — a page with two has none (#345)`,
    );
  } else {
    const href = attr(canonicals[0], 'href');
    const expected = `${ORIGIN}${servedRoute(file)}`;
    if (!href) {
      report(rel, '<link rel="canonical"> with no href (#345)');
    } else if (!href.startsWith(`${ORIGIN}/`) && href !== ORIGIN) {
      report(rel, `canonical is not an absolute ${ORIGIN} URL: ${href} (#345)`);
    } else if (href !== expected) {
      report(rel, `canonical says ${href} but the file is served at ${expected} (#345)`);
    }
    canonical = href;
  }

  pages.set('/' + rel.split(path.sep).join('/'), { canonical, isDraft, route: servedRoute(file) });
}

// --- 10. Every sitemap entry canonicalises to itself ------------------------
//
// The second half of #345, and the one that matches the email Google actually
// sent about pages *in a sitemap*: a submitted URL that points its canonical
// somewhere else asks Google to index a page and then tells it not to. Same
// contradiction if the page carries `noindex`.
//
// `sitemap.xml.ts` generates its entries from the collections, so a project
// can't drift out of it — but `STATIC_ROUTES` in that file is hand-maintained,
// which is the one place this site still has the kind of hand-kept index the
// content model exists to forbid. This is what watches it.
const sitemapFile = path.join(DIST, 'sitemap.xml');
if (!existsSync(sitemapFile)) {
  report('sitemap.xml', 'not generated — every page on the site is unsubmitted (#345)');
} else {
  const xml = await readFile(sitemapFile, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
  if (locs.length === 0) report('sitemap.xml', 'contains no <loc> entries (#345)');

  /** The routes the sitemap actually submits, for rule 11. */
  const submitted = new Set();

  for (const loc of locs) {
    if (!loc.startsWith(`${ORIGIN}/`) && loc !== ORIGIN) {
      report('sitemap.xml', `entry is not on ${ORIGIN}: ${loc} (#345)`);
      continue;
    }
    const pathname = new URL(loc).pathname;
    submitted.add(pathname);
    const file = htmlFileFor(pathname);
    if (!file) {
      report('sitemap.xml', `entry has no page in dist: ${loc} (#345)`);
      continue;
    }
    const page = pages.get('/' + path.relative(DIST, file).split(path.sep).join('/'));
    if (!page?.canonical) continue; // rule 9 already reported why it has none

    if (page.canonical !== loc) {
      report('sitemap.xml', `entry ${loc} canonicalises to ${page.canonical} (#345)`);
    }

    // Only meaningful once the site is live. Before the cutover `live` is
    // false and BaseLayout noindexes EVERY page sitewide, so this would fail
    // on all of them for being correct — and robots.txt says Disallow in that
    // state anyway, so nothing is being submitted to contradict.
    if (live && page.isDraft) {
      report('sitemap.xml', `entry ${loc} is in the sitemap but carries noindex (#345)`);
    }
  }

  // --- 11. Every indexable page is in the sitemap ---------------------------
  //
  // The other direction, and the likelier one. Rule 10 catches a STATIC_ROUTES
  // entry left behind by a rename or a deletion; this catches a new page that
  // never got added to it. `sitemap.xml.ts` derives project routes from the
  // collections, so those cannot drift — but STATIC_ROUTES is hand-kept, and
  // it is the one list on this site that the content model's "never a second
  // place to update" rule does not reach. A page that ships unlisted is
  // invisible to Google and nothing says so; #48's build-in-public page is
  // exactly that shape.
  //
  // TWO exclusions, and only two. `/404` is not a page anyone submits. And a
  // `noindex` page is by definition not for the index — which covers draft
  // project pages on preview deploys, and makes the rule vacuous before the
  // cutover, when `live` is false and BaseLayout noindexes the whole site.
  // That is the same reasoning behind rule 10's `live` gate, reached from the
  // other side, so it needs no gate of its own.
  //
  // Measured before building, as #338 requires: the naive form — every built
  // page must appear — reports exactly one page against a production build,
  // `/404`, and that one is correct. One carve-out, not a list.
  for (const page of pages.values()) {
    if (page.isDraft || page.route === '/404') continue;
    if (!submitted.has(page.route)) {
      report('sitemap.xml', `${page.route} is built and indexable but not submitted (#345)`);
    }
  }
}

const pageWord = htmlFiles.length === 1 ? 'page' : 'pages';
if (problems.length === 0) {
  console.log(
    `✓ ${htmlFiles.length} ${pageWord} checked — links resolve, no http://, alt text present, apostrophes curly, spelling American, no welded words, headings title case, canonicals self-consistent.`,
  );
  process.exit(0);
}

console.error(`✗ ${problems.length} problem(s) across ${htmlFiles.length} ${pageWord}:\n`);
for (const { file, message } of problems) console.error(`  ${file}: ${message}`);
process.exit(1);
