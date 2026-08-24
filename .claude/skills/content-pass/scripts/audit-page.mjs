#!/usr/bin/env node
/**
 * Mechanical half of a per-page content pass (#31 and its sub-issues).
 *
 * The judgment stays in SKILL.md. This script only does the four checks that
 * are easy to skip, and each of which was missed by hand at least once:
 *
 *  1. Em dashes in RENDERED copy, attributed back to their source line.
 *     Grepping the Markdown body misses them, because `role`, `summary`,
 *     `caption`, and link labels are front matter that renders as visible copy.
 *     That is exactly how CLAUDE.md came to claim "the last em dash in visible
 *     copy" while four more were live on /projects.
 *  2. Sentence stats on rendered copy rather than source, for the same reason.
 *     `copy-stats.mjs` measures the file; this measures the page.
 *  3. The old page's prose, so what a Phase 3 summary DROPPED is visible.
 *     A tone pass is not a re-reporting pass, but the compression it inherits
 *     may already have changed a fact.
 *  4. Unused media already sitting in src/assets/ for this project. The Phase 3
 *     migration moved the whole keep-list; only heroes ever got wired up.
 *
 * Reads dist/, so run `SHOW_DRAFTS=true npm run build` first.
 *
 * Usage:
 *   node .claude/skills/content-pass/scripts/audit-page.mjs /projects/prodigal
 *   node .claude/skills/content-pass/scripts/audit-page.mjs prodigal
 *   node .claude/skills/content-pass/scripts/audit-page.mjs --all
 */

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SNAPSHOT = path.join(ROOT, 'snapshot');
const CONTENT = path.join(ROOT, 'src/content/projects');
const ASSETS = path.join(ROOT, 'src/assets/images/projects');

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  '#39': "'",
  mdash: '—',
  ndash: '–',
  rsquo: '’',
  lsquo: '‘',
  ldquo: '“',
  rdquo: '”',
  hellip: '…',
};

const EM_DASH = '—';

function decode(s) {
  return s.replace(/&(#?\w+);/g, (m, e) => ENTITIES[e] ?? m);
}

/** Text content of an HTML fragment, with block boundaries preserved as newlines. */
function stripTags(html) {
  return decode(
    html
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<\/(p|div|h[1-6]|li|figcaption|section|header|footer)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      // Inline elements need a separator too, or the metadata strip's spans
      // run together into "Game jam2011UnityGlobal Game Jam 2011Programmer".
      .replace(/<\/(span|a|strong|em|code|dt|dd)>/gi, ' ')
      .replace(/<[^>]+>/g, ''),
  )
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * Prose only, for sentence stats. The metadata strip and the backlink are
 * visible copy (an em dash there is a real finding) but they are not
 * sentences, and leaving them in inflates the mean badly on a short archive
 * page. So the two checks read different slices on purpose:
 *   em dashes  -> all of <main>
 *   sentences  -> prose blocks only
 */
function proseOnly(mainHtml) {
  return mainHtml
    .replace(/<p class="meta-strip"[\s\S]*?<\/p>/gi, '')
    .replace(/<a class="backlink"[\s\S]*?<\/a>/gi, '')
    .replace(/<span class="chip"[\s\S]*?<\/span>/gi, '');
}

function extract(html, re) {
  const m = html.match(re);
  return m ? m[1] : null;
}

function sentenceStats(text) {
  const prose = text.replace(/\n/g, ' ');
  const sentences = prose
    .split(/(?<=[.!?])\s+(?=[A-Z"'“(])/)
    .map((s) => s.trim())
    .filter((s) => /\w/.test(s));
  const counts = sentences.map((s) => (s.match(/\b[\w'’-]+\b/g) || []).length).filter(Boolean);
  const words = counts.reduce((a, b) => a + b, 0);
  return {
    words,
    sentences: counts.length,
    mean: counts.length ? words / counts.length : 0,
    longest: counts.length ? Math.max(...counts) : 0,
  };
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Snapshot filenames are the old site's camelCase and do not match the new
 * slugs: critter-3 -> critter.html, vegas-blvd-slots -> vegasBlvd.html.
 * Match on a normalised prefix either way, and print what matched so a human
 * can sanity-check it.
 */
async function findSnapshot(slug) {
  const dir = path.join(SNAPSHOT, 'projects');
  if (!existsSync(dir)) return null;
  const files = (await readdir(dir)).filter((f) => f.endsWith('.html') && f !== 'index.html');
  const want = norm(slug);
  const exact = files.find((f) => norm(f.replace(/\.html$/, '')) === want);
  if (exact) return path.join(dir, exact);
  const prefix = files.find((f) => {
    const n = norm(f.replace(/\.html$/, ''));
    return n.startsWith(want) || want.startsWith(n);
  });
  return prefix ? path.join(dir, prefix) : null;
}

/**
 * Which front-matter key or body line does this em dash come from?
 *
 * Probes on the text AFTER the dash, not from the start of the line. The line
 * is often the whole metadata strip, whose leading words ("Game jam 2011 Unity
 * ...") appear nowhere in the content file, so a leading-run probe never hits.
 * The text after the dash is the distinctive part and is what sits in the YAML.
 */
async function attribute(slug, line) {
  const file = path.join(CONTENT, `${slug}.md`);
  if (!existsSync(file)) return null;
  const lines = (await readFile(file, 'utf8')).split('\n');

  // YAML comments never render, and this file is full of them explaining
  // decisions in the same words the copy uses. Without this, a probe happily
  // matches a comment: "Welcome Ali!" — Second Dinner attributed to a note
  // about Second Dinner's Godot project 28 lines earlier.
  const fmEnd = lines.indexOf('---', 1);
  const skip = (i) => fmEnd > 0 && i <= fmEnd && lines[i].trim().startsWith('#');

  const probes = [];
  for (const half of line.split(EM_DASH).slice(1)) {
    const words = half.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
    for (let take = Math.min(words.length, 10); take >= 2; take--) {
      probes.push(words.slice(0, take).join(' '));
    }
  }
  for (const probe of probes) {
    const i = lines.findIndex((l, idx) => !skip(idx) && l.includes(probe));
    if (i !== -1) {
      const key = lines[i].match(/^\s*-?\s*([\w-]+):/);
      return { line: i + 1, key: key ? key[1] : '(body prose)' };
    }
  }
  return null;
}

async function readTree(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await readTree(p)));
    else if (/\.(md|mdx|astro|ts|js|mjs)$/.test(e.name)) out.push(await readFile(p, 'utf8'));
  }
  return out;
}

async function unusedAssets(slug) {
  const dir = path.join(ASSETS, slug);
  if (!existsSync(dir)) return [];
  const files = await readdir(dir);
  const sources = [];
  for (const d of ['src/content', 'src/pages', 'src/components', 'src/layouts']) {
    const abs = path.join(ROOT, d);
    if (existsSync(abs)) sources.push(...(await readTree(abs)));
  }
  const haystack = sources.join('\n');
  return files.filter((f) => !haystack.includes(f));
}

function heading(s) {
  console.log(`\n-- ${s} ${'-'.repeat(Math.max(0, 66 - s.length))}`);
}

async function auditRoute(route) {
  const clean = route.replace(/^\/+|\/+$/g, '');
  const slug = clean.startsWith('projects/') ? clean.slice('projects/'.length) : null;
  const distFile = clean === '' ? path.join(DIST, 'index.html') : path.join(DIST, `${clean}.html`);

  console.log(`\n${'='.repeat(70)}\n  /${clean}\n${'='.repeat(70)}`);

  if (!existsSync(distFile)) {
    console.log(`  ! no built page at ${path.relative(ROOT, distFile)}`);
    console.log('    run: SHOW_DRAFTS=true npm run build');
    return;
  }

  const html = await readFile(distFile, 'utf8');
  const main = extract(html, /<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!main) {
    console.log('  ! no <main> found');
    return;
  }
  const text = stripTags(main);

  // 1. Em dashes in rendered copy, attributed to source.
  heading('Em dashes in rendered <main>');
  const dashLines = text.split('\n').filter((l) => l.includes(EM_DASH));
  if (dashLines.length === 0) {
    console.log('  none');
  } else {
    for (const line of dashLines) {
      console.log(`  * ${line}`);
      if (slug) {
        const src = await attribute(slug, line);
        console.log(
          src
            ? `      -> ${slug}.md:${src.line}   key: ${src.key}`
            : '      -> not in the content file; check components/ or config/',
        );
      }
    }
    console.log('');
    console.log('  The <title>/og:title template is "{title} - Ali Wallick" on all 23 routes.');
    console.log('  That one is a structural separator, not prose. It stays, and it is');
    console.log('  outside <main>, so it never shows up here.');
  }

  // 2. Sentence stats on rendered PROSE (see proseOnly for why not all of it).
  const s = sentenceStats(stripTags(proseOnly(main)));
  heading('Rendered prose');
  console.log(`  ${s.words} words, ${s.sentences} sentences`);
  console.log(`  mean ${s.mean.toFixed(1)}w   (Ali: 17w)      longest ${s.longest}w`);
  console.log('  (metadata strip and backlink excluded. Summary and captions included,');
  console.log('   because a reader reads those as prose even though they are front matter.)');

  if (!slug) return;

  // 3. The old page, for what the Phase 3 summary dropped.
  heading('Old page (snapshot/)');
  const snapFile = await findSnapshot(slug);
  if (!snapFile) {
    console.log('  none. No old page for this project, so nothing was dropped.');
  } else {
    const snapHtml = await readFile(snapFile, 'utf8');
    const body =
      extract(snapHtml, /<div class="content">([\s\S]*?)<h3 class="back">/i) ??
      extract(snapHtml, /<div class="content">([\s\S]*?)<\/div>/i);
    const snapText = body ? stripTags(body) : '';
    const ss = sentenceStats(snapText);
    console.log(`  ${path.relative(ROOT, snapFile)}`);
    console.log(`  ${ss.words} words then, ${s.words} now`);
    const imgs = [...snapHtml.matchAll(/<img[^>]+src="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((u) => u.includes('/projects/'));
    if (imgs.length) {
      console.log(`  ${imgs.length} image(s) on the old page:`);
      for (const u of imgs) console.log(`    ${u}`);
    }
    console.log('');
    console.log('  --- old prose. Read it for what the summary dropped, not for wording ---');
    for (const line of snapText.split('\n')) console.log(`  | ${line}`);
  }

  // 4. Unused media already in the repo.
  heading('Unused media in src/assets/');
  const unused = await unusedAssets(slug);
  if (unused.length === 0) {
    console.log('  none');
  } else {
    for (const f of unused) {
      const hint = /^banner\./.test(f)
        ? '   (600x150 logo strip. CLAUDE.md: do not reach for these)'
        : /^poster\./.test(f)
          ? '   (video poster frame)'
          : '';
      console.log(`  * ${f}${hint}`);
    }
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('usage: audit-page.mjs <route|slug> [...]    |    --all');
  process.exit(2);
}

let routes;
if (args[0] === '--all') {
  const files = (await readdir(CONTENT)).filter((f) => f.endsWith('.md'));
  routes = files.sort().map((f) => `/projects/${f.replace(/\.md$/, '')}`);
} else {
  routes = args.map((a) =>
    a.startsWith('/') ? a : existsSync(path.join(CONTENT, `${a}.md`)) ? `/projects/${a}` : `/${a}`,
  );
}

for (const r of routes) await auditRoute(r);
console.log('');
