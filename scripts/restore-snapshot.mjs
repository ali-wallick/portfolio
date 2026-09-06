#!/usr/bin/env node
/**
 * Rebuilds `snapshot/` into a self-contained, browsable copy at
 * `snapshot/rendered/`.
 *
 * ## The defect this repairs
 *
 * `snapshot/README.md` says the old site's images, CSS and JS "are already
 * committed under `resources/`". That was true when Phase 0 wrote it and
 * stopped being true at `ce4533e`, when Phase 3 deleted `resources/images/`
 * after migrating the keep-list into `src/assets/`. The snapshot has been
 * carrying **50 dead asset references out of 54** ever since — so it preserves
 * what the old site *said* but not what it *looked like*, which is the half a
 * before/after needs.
 *
 * Every one of those 54 files is still in git at `ce4533e~1`. This script pulls
 * them back out and rewires the markup around them.
 *
 * ## Why the output is committed rather than regenerated
 *
 * Same reasoning as the resume PDFs. A folder that only exists when a script
 * runs is exactly the "verify it resolves" trap Phase 0's own lesson warns
 * about — and this one has a sharper edge: the whole point of the archive is
 * that `snapshot/` can eventually be tagged and deleted (#45), at which moment
 * a regenerate-on-demand script has no inputs left. The script is committed too,
 * so the derivation stays auditable, but the artifact is the deliverable.
 *
 * ## What gets changed, and what deliberately does not
 *
 * The 26 original files under `snapshot/` are **never touched**. They stay
 * byte-faithful; this writes a clearly-derived copy beside them.
 *
 * In the copy, four classes of external reference are removed rather than
 * vendored, because none of them can do anything useful in a browser that
 * exists:
 *
 *   - **html5shiv** (28 files) — an IE8 shim served from Google Code, which
 *     shut down in 2015. It has 404'd for a decade.
 *   - **Unity Web Player** — the plugin was killed in 2017 and removed from
 *     every browser. The `<object>`/script pair can never render again.
 *   - **WordPress polyfills** (6 scripts) — loaded from
 *     `aliwallick.com/blog/wp-includes/`, i.e. the domain that is about to
 *     move. Nothing visual depends on them.
 *   - **`http://` subresources** — already blocked as mixed content on any
 *     https page, so they were contributing nothing even before this.
 *
 * YouTube iframes are the one case worth keeping something for, so their
 * poster frames are fetched once and committed, and the iframe becomes a
 * static poster that links out. That is a visible, honest "there was a video
 * here" rather than the blank box the live site already shows.
 *
 * **Outbound `<a href>` links to third parties are left exactly as they are.**
 * They are part of the record and nothing loads from them. Several point at
 * domains that have since expired (firefall.com, kaneva.com, argamestudio.org)
 * — that matters only if this archive is ever *published*, which is a separate
 * decision. See docs/PRESERVATION.md.
 *
 * Usage:
 *   node scripts/restore-snapshot.mjs                # rebuild snapshot/rendered/
 *   node scripts/restore-snapshot.mjs --serve        # rebuild, then serve it
 */

import { mkdir, writeFile, readFile, readdir, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'snapshot');
const OUT = path.join(SRC, 'rendered');
const ASSET_COMMIT = 'ce4533e~1';
const LIVE_ORIGIN = 'https://www.aliwallick.com';

const args = new Set(process.argv.slice(2));

/* ------------------------------------------------------------------ *
 * 1. Collect the source pages (everything but the derived output)
 * ------------------------------------------------------------------ */

async function htmlPages(dir, base = '') {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'rendered') continue;
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...(await htmlPages(path.join(dir, entry.name), rel)));
    else if (entry.name.endsWith('.html')) out.push(rel);
  }
  return out.sort();
}

/* ------------------------------------------------------------------ *
 * 2. Link rewriting
 *
 * The old site served extensionless URLs via mod_rewrite (see the repo-root
 * .htaccess), so its markup is full of `/about` and `href="firefall"`. On a
 * filesystem those resolve to nothing. Each is mapped to the snapshot file
 * that actually holds that page, then made relative to the page doing the
 * linking, so the archive works from `file://` as well as over http.
 * ------------------------------------------------------------------ */

const PAGE_MAP = {
  '/': 'index.html',
  '/about': 'about.html',
  '/resume': 'resume.html',
  '/contact': 'contact.html',
  '/blog': 'blog/index.html',
  '/blog/': 'blog/index.html',
  '/projects': 'projects/index.html',
  '/projects/': 'projects/index.html',
};

/** Make an archive-root-relative target relative to the page linking to it. */
function relativize(fromPage, target) {
  const rel = path.posix.relative(path.posix.dirname(fromPage), target);
  return rel === '' ? '.' : rel;
}

function rewritePage(pageRel, html, posterFor) {
  const depthDir = path.posix.dirname(pageRel);
  let out = html;
  const notes = [];

  // --- assets: /resources/... -> relative ---------------------------------
  out = out.replace(/(src|href)="\/(resources\/[^"]+)"/g, (_m, attr, res) => {
    return `${attr}="${relativize(pageRel, res)}"`;
  });

  // --- blog images: absolute wp-content URLs -> the local copies -----------
  // The blog's pagination pages reference their images by full URL against
  // aliwallick.com, so they were never covered by the /resources/ restore and
  // would break at the cutover along with everything else on that host.
  out = out.replace(
    /(src|href)="https?:\/\/(?:www\.)?aliwallick\.com\/blog\/wp-content\/uploads\/([^"]+)"/g,
    (_m, attr, rest) => `${attr}="${relativize(pageRel, `${BLOG_DIR}/${rest}`)}"`,
  );

  // --- internal pages: /about -> ../about.html ----------------------------
  out = out.replace(/(src|href)="(\/[^"#?]*)"/g, (m, attr, href) => {
    const mapped = PAGE_MAP[href];
    if (!mapped) return m;
    return `${attr}="${relativize(pageRel, mapped)}"`;
  });

  // --- blog pagination: index.php?offset=N -> offset-N.html ---------------
  out = out.replace(/href="index\.php\?offset=(\d+)"/g, (_m, n) =>
    n === '0' ? 'href="index.html"' : `href="offset-${n}.html"`,
  );

  // --- projects index: href="firefall" -> href="firefall.html" ------------
  // Only inside projects/, and only for bare slugs that match a real page.
  if (depthDir === 'projects') {
    out = out.replace(/href="([A-Za-z0-9][A-Za-z0-9_-]*)"/g, (m, slug) =>
      existsSync(path.join(SRC, 'projects', `${slug}.html`)) ? `href="${slug}.html"` : m,
    );
  }

  // --- strip dead external scripts ----------------------------------------
  const before = out;
  out = out.replace(/\s*<script[^>]*src="[^"]*html5shiv[^"]*"[^>]*>\s*<\/script>/gi, '');
  out = out.replace(
    /\s*<script[^>]*src="[^"]*webplayer\.unity3d\.com[^"]*"[^>]*>\s*<\/script>/gi,
    '',
  );
  // wp-login.html pulls stylesheets as well as scripts, and from wp-admin as
  // well as wp-includes. It also writes its attributes with **single** quotes,
  // being WordPress-generated rather than hand-written like the rest of the
  // site — which is why the quote class below is `['"]` everywhere. Matching
  // only double-quoted `wp-includes` scripts left 15 requests still going out
  // to the domain that is about to move. Caught by --check-selfcontained,
  // which is exactly what it is for.
  out = out.replace(
    /\s*<script[^>]*src=['"][^'"]*\/blog\/wp-(?:includes|admin|content)\/[^'"]*['"][^>]*>\s*<\/script>/gi,
    '',
  );
  out = out.replace(
    /\s*<link[^>]*href=['"][^'"]*\/blog\/wp-(?:includes|admin|content)\/[^'"]*['"][^>]*>/gi,
    '',
  );
  // The Unity Web Player "Install now!" badge, an <img> sitting in the player's
  // fallback div rather than inside the <object> below.
  out = out.replace(
    /<img[^>]*src=['"][^'"]*webplayer\.unity3d\.com[^'"]*['"][^>]*>/gi,
    '<span class="archived-video-missing">[Unity Web Player install badge — plugin discontinued 2017]</span>',
  );

  // Last sweep: any surviving URL pointing at the old host's blog assets,
  // including the escaped-slash form WordPress embeds in inline JSON
  // (`_zxcvbnSettings = {"src":"https:\/\/aliwallick.com\/blog\/..."}`), which
  // no tag-shaped pattern can reach. Emptying the string is safe in both a
  // JSON value and an attribute; removing it would break the surrounding JS.
  out = out.replace(
    /https?:(?:\\\/\\\/|\/\/)(?:www\.)?aliwallick\.com(?:\\\/|\/)blog(?:\\\/|\/)wp-[^'"\s)]*/gi,
    '',
  );
  if (out !== before) notes.push('stripped dead scripts');

  // --- YouTube iframes -> committed poster + link out ---------------------
  out = out.replace(
    /<iframe[^>]*src="(?:https?:)?\/\/(?:www\.)?youtube\.com\/(?:embed|v)\/([A-Za-z0-9_-]{11})[^"]*"[^>]*>\s*<\/iframe>/gi,
    (_m, id) => {
      const poster = posterFor(id, pageRel);
      notes.push(`youtube ${id}`);
      // No poster means YouTube no longer serves the video at all — deleted or
      // made private since 2016. Three of the nine embedded here are already in
      // that state. Linking out would send a reader to an error page, so say
      // what happened instead. This is the part of the old site that genuinely
      // cannot be preserved: the bytes were never Ali's to keep.
      if (!poster) {
        return (
          `<p class="archived-video-missing">[video no longer available on YouTube` +
          ` — id <code>${id}</code>]</p>`
        );
      }
      return (
        `<a class="archived-video" href="https://www.youtube.com/watch?v=${id}"` +
        ` title="Watch on YouTube (leaves the archive)">` +
        `<img src="${poster}" alt="Video thumbnail — opens on YouTube" loading="lazy">` +
        `</a>`
      );
    },
  );

  // Same for the one legacy <object>/<embed> Unity+Flash-era player pair.
  out = out.replace(/<object[^>]*>[\s\S]*?<\/object>/gi, (m) =>
    /youtube|unity/i.test(m)
      ? '<p class="archived-video-missing">[embedded player removed — plugin discontinued]</p>'
      : m,
  );

  return { html: out, notes };
}

/* ------------------------------------------------------------------ *
 * 3. Build
 * ------------------------------------------------------------------ */

console.log(`Rebuilding ${path.relative(ROOT, OUT)}/ ...\n`);
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

// --- 3a. assets out of git ------------------------------------------------
const pages = await htmlPages(SRC);
const refs = new Set();
for (const p of pages) {
  const html = await readFile(path.join(SRC, p), 'utf8');
  for (const m of html.matchAll(/(?:src|href)="\/(resources\/[^"]+)"/g)) refs.add(m[1]);
}

/**
 * Paths where the *current* working-tree file supersedes the historical blob.
 *
 * Only one entry, and it is not an aesthetic preference — it is a privacy one.
 * The old resume carries a PO Box. Restoring it from `ce4533e~1` is faithful
 * and also silently manufactures a second copy of an exposure the repo is
 * actively trying to reduce (#197, #200); the first run of this script did
 * exactly that, and it got committed before anyone noticed.
 *
 * The working-tree copy has that one line removed from its content stream —
 * see the redaction note in docs/PRESERVATION.md. Reading from disk here means
 * a rebuild can never reintroduce the address. The original is untouched in
 * history and in `v1-legacy` if it is ever genuinely needed.
 */
const PREFER_WORKTREE = new Set(['resources/WallickAli-Resume.pdf']);

let restored = 0;
let restoredBytes = 0;
let superseded = 0;
const missing = [];
for (const ref of [...refs].sort()) {
  let buf;
  if (PREFER_WORKTREE.has(ref) && existsSync(path.join(ROOT, ref))) {
    buf = await readFile(path.join(ROOT, ref));
    superseded++;
    const dest = path.join(OUT, ref);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    restored++;
    restoredBytes += buf.length;
    continue;
  }
  try {
    buf = execFileSync('git', ['cat-file', 'blob', `${ASSET_COMMIT}:${ref}`], {
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    missing.push(ref);
    continue;
  }
  const dest = path.join(OUT, ref);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  restored++;
  restoredBytes += buf.length;
}
console.log(
  `  assets   ${restored}/${refs.size} restored (${(restoredBytes / 1048576).toFixed(2)} MB) — ` +
    `${restored - superseded} from ${ASSET_COMMIT}, ${superseded} from the working tree`,
);
if (missing.length) {
  console.log(`  MISSING  ${missing.length}:`);
  for (const m of missing) console.log(`    ${m}`);
}

/* --- 3b0. blog images, straight off the live host -------------------------
 *
 * These are the one class of asset that is in neither `snapshot/` nor git:
 * the blog's pagination pages reference them by absolute URL against
 * aliwallick.com, so Phase 0's `/resources/` sweep never saw them.
 *
 * Phase 0 *did* download them for `content/archive/`, but under semantic names
 * (`Cards.jpg` became `2011-05-cards.jpg`), so they cannot be mapped back by
 * path. Rather than couple this archive to another directory's naming
 * convention — which would break the moment either is reorganised — they are
 * fetched once and stored under their original paths. The copies are then
 * hash-compared against `content/archive/images/` and the result reported,
 * which doubles as the spot-check #51 wants before retiring WordPress.
 *
 * This is the only step that *requires* the old host to still be up.
 */
const BLOG_DIR = 'resources/blog-uploads';
const POSTER_DIR = 'resources/video-posters';

const blogRefs = new Set();
for (const p of pages) {
  const html = await readFile(path.join(SRC, p), 'utf8');
  for (const m of html.matchAll(
    /(?:src|href)="https?:\/\/(?:www\.)?aliwallick\.com\/blog\/wp-content\/uploads\/([^"]+)"/g,
  )) {
    blogRefs.add(m[1]);
  }
}

const { createHash } = await import('node:crypto');
const archiveHashes = new Map();
const ARCHIVE_IMAGES = path.join(ROOT, 'content/archive/images');
if (existsSync(ARCHIVE_IMAGES)) {
  for (const f of await readdir(ARCHIVE_IMAGES)) {
    const buf = await readFile(path.join(ARCHIVE_IMAGES, f));
    archiveHashes.set(createHash('sha256').update(buf).digest('hex'), f);
  }
}

let blogOk = 0;
const blogFailed = [];
const blogMatched = [];
for (const rel of [...blogRefs].sort()) {
  const dest = path.join(OUT, BLOG_DIR, rel);
  try {
    const res = await fetch(`${LIVE_ORIGIN}/blog/wp-content/uploads/${rel}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    blogOk++;
    const hit = archiveHashes.get(createHash('sha256').update(buf).digest('hex'));
    if (hit) blogMatched.push(`${rel} == content/archive/images/${hit}`);
  } catch (error) {
    blogFailed.push(`${rel} (${String(error).split('\n')[0]})`);
  }
}
console.log(`  blog img ${blogOk}/${blogRefs.size} fetched into ${BLOG_DIR}/`);
console.log(`           ${blogMatched.length}/${blogOk} byte-identical to content/archive/images/`);
if (blogFailed.length) {
  console.log(`  FAILED   ${blogFailed.length} — is the old host still up?`);
  for (const f of blogFailed) console.log(`    ${f}`);
}

// --- 3b. YouTube poster frames -------------------------------------------
const ids = new Set();
for (const p of pages) {
  const html = await readFile(path.join(SRC, p), 'utf8');
  for (const m of html.matchAll(/youtube\.com\/(?:embed|v)\/([A-Za-z0-9_-]{11})/g)) ids.add(m[1]);
}

await mkdir(path.join(OUT, POSTER_DIR), { recursive: true });
let posters = 0;
const posterMissing = [];
for (const id of [...ids].sort()) {
  const dest = path.join(OUT, POSTER_DIR, `${id}.jpg`);
  if (existsSync(dest)) {
    posters++;
    continue;
  }
  let ok = false;
  // hqdefault always exists; maxresdefault often doesn't. Try the good one first.
  for (const name of ['maxresdefault', 'hqdefault']) {
    try {
      const res = await fetch(`https://i.ytimg.com/vi/${id}/${name}.jpg`);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      // YouTube serves a 120x90 grey placeholder for missing sizes.
      if (buf.length < 4000) continue;
      await writeFile(dest, buf);
      ok = true;
      break;
    } catch {
      /* try next */
    }
  }
  ok ? posters++ : posterMissing.push(id);
}
console.log(`  posters  ${posters}/${ids.size} fetched into ${POSTER_DIR}/`);
if (posterMissing.length) console.log(`  no poster for: ${posterMissing.join(', ')}`);

/** Relative path to a committed poster frame, or null if the video is gone. */
function posterFor(id, pageRel) {
  const target = `${POSTER_DIR}/${id}.jpg`;
  return existsSync(path.join(OUT, target)) ? relativize(pageRel, target) : null;
}

// --- 3c. pages ------------------------------------------------------------
for (const p of pages) {
  const html = await readFile(path.join(SRC, p), 'utf8');
  const { html: rewritten } = rewritePage(p, html, posterFor);
  const dest = path.join(OUT, p);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, rewritten);
}
console.log(`  pages    ${pages.length} rewritten`);

// --- 3d. a small stylesheet for the two elements this script introduces ---
await writeFile(
  path.join(OUT, 'resources/css/archive.css'),
  `/* Added by scripts/restore-snapshot.mjs — not part of the original site.
   Styles the poster frames that replaced dead YouTube iframes. */
.archived-video { display: inline-block; max-width: 100%; }
.archived-video img { max-width: 100%; height: auto; border: 2px solid #4aa17a; }
.archived-video-missing { color: #9f2b00; font-style: italic; }
`,
);
for (const p of pages) {
  const dest = path.join(OUT, p);
  let html = await readFile(dest, 'utf8');
  const href = relativize(p, 'resources/css/archive.css');
  html = html.replace(/<\/head>/i, `  <link rel="stylesheet" href="${href}">\n</head>`);
  await writeFile(dest, html);
}

// --- 3e. a README so the directory explains itself ------------------------
await writeFile(
  path.join(OUT, 'README.md'),
  `# snapshot/rendered — the old site, made browsable

**Derived, not captured.** Generated by \`scripts/restore-snapshot.mjs\` from the
byte-faithful pages in \`snapshot/\` plus the images recovered from git at
\`${ASSET_COMMIT}\`. If you want the untouched record, read \`snapshot/\` — not this.

Open \`index.html\` in a browser, or run:

    node scripts/restore-snapshot.mjs --serve

## What differs from the live 2026 site

- Root-absolute paths (\`/resources/...\`, \`/about\`) are relative, so this works
  offline and from \`file://\`.
- Four dead external dependencies are removed: html5shiv (Google Code, gone
  since 2015), the Unity Web Player (discontinued 2017), six WordPress
  polyfills, and the \`http://\` subresources browsers already block.
- YouTube iframes are static poster frames linking out to the video.

Everything else — markup, copy, CSS, \`nav.js\`, outbound links — is as captured.
This directory makes **zero external network requests**; that is asserted by
\`node scripts/restore-snapshot.mjs --check-selfcontained\`.
`,
);

console.log(`\n✓ ${path.relative(ROOT, OUT)}/ rebuilt.`);
const totalSize = execFileSync('du', ['-sh', OUT]).toString().split('\t')[0];
console.log(`  size: ${totalSize}`);

/* ------------------------------------------------------------------ *
 * 4. Verify — the archive must be self-contained and complete
 *
 * This is the check that actually answers "will this still look like this in
 * ten years". A page that loads anything from a host other than itself is a
 * page whose appearance depends on somebody else's uptime, which is precisely
 * how the original decayed: html5shiv went down with Google Code in 2015 and
 * nobody noticed for a decade.
 *
 * Same spirit as scripts/check-links.mjs, where every rule guards a real bug.
 * ------------------------------------------------------------------ */

if (args.has('--check-selfcontained') || args.has('--serve')) {
  const { serveDist } = await import('./lib/serve-dist.mjs');
  const { launchChromium } = await import('./lib/launch-chromium.mjs');
  const { origin, close } = await serveDist(OUT);

  if (args.has('--serve') && !args.has('--check-selfcontained')) {
    console.log(`\nServing ${path.relative(ROOT, OUT)}/ at ${origin}`);
    console.log('Ctrl-C to stop.');
  } else {
    const browser = await launchChromium();
    const external = new Map();
    const failed = [];

    for (const page of pages) {
      const tab = await browser.newPage();
      tab.on('request', (req) => {
        const url = req.url();
        if (!url.startsWith(origin) && !url.startsWith('data:')) {
          external.set(url, (external.get(url) ?? 0) + 1);
        }
      });
      tab.on('response', (res) => {
        if (res.status() >= 400 && res.url().startsWith(origin)) {
          failed.push(`${page} -> ${res.url().slice(origin.length)} (${res.status()})`);
        }
      });
      await tab.goto(`${origin}/${page}`, { waitUntil: 'load', timeout: 20_000 });
      await tab.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
      await tab.close();
    }

    await browser.close();
    close();

    console.log(`\nSelf-containment check across ${pages.length} pages:`);
    console.log(`  external requests: ${external.size}`);
    for (const [url, n] of external) console.log(`    ${n}x ${url}`);
    console.log(`  broken local refs: ${failed.length}`);
    for (const f of failed.slice(0, 20)) console.log(`    ${f}`);
    if (failed.length > 20) console.log(`    ... and ${failed.length - 20} more`);

    if (external.size || failed.length) {
      console.error('\n✗ archive is not self-contained.');
      process.exit(1);
    }
    console.log('\n✓ zero external requests, zero broken references.');
  }
}
