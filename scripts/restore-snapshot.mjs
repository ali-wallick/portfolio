#!/usr/bin/env node
/**
 * Rebuilds `snapshot/` into a self-contained, browsable copy at
 * `snapshot/rendered/`.
 *
 * ## This script has no inputs in the tree any more (2026-09-21, #45)
 *
 * `snapshot/` was retired to the annotated tag `snapshot-pre-retirement`. The
 * section below called that moment in advance — "a regenerate-on-demand script
 * has no inputs left" — and it has arrived. The script is kept because the
 * derivation is the audit trail for a committed artifact, which is exactly the
 * reason that section gives for committing it in the first place.
 *
 * To run it again, restore its inputs first:
 *
 *   git restore --source=snapshot-pre-retirement -- snapshot/
 *
 * Everything below describes the tree as it stood while `snapshot/` was in it.
 *
 * ## The defect this repairs
 *
 * `snapshot/README.md` says the old site's images, CSS and JS "are already
 * committed under `resources/`". That was true when Phase 0 wrote it and
 * stopped being true when Phase 3 deleted `resources/images/`
 * after migrating the keep-list into `src/assets/`. The snapshot has been
 * carrying **50 dead asset references out of 54** ever since — so it preserves
 * what the old site *said* but not what it *looked like*, which is the half a
 * before/after needs.
 *
 * Every one of those 54 files is still in git at ASSET_COMMIT. This script pulls
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
 * ## The read-only modes really are read-only (#344)
 *
 * `--serve` and `--check-selfcontained` used to rebuild first. The build ran at
 * module top level and the flag check sat 245 lines below it, so a name that
 * reads as an assertion was a destructive rebuild that happened to end in one.
 * In a shallow clone — which is what a Claude Code web session gets — that
 * rebuild died partway through and left the archive at 27 of its 102 files.
 *
 * Only 28 of those 102 files are derived from `snapshot/`. The other 74 come
 * from somewhere this process may not be able to reach: 54 asset blobs at
 * ASSET_COMMIT, 14 blog images off the old host, 6 poster frames off
 * i.ytimg.com. So a rebuild proves it can reach all three *before* it deletes
 * anything — see `preflight()`.
 *
 * Every mode is named by a flag and there is no default one, so no invocation
 * of this script deletes anything by accident. See USAGE below.
 */

import { mkdir, writeFile, readFile, readdir, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'snapshot');
const OUT = path.join(SRC, 'rendered');
/**
 * The commit whose tree still holds the 54 old-site assets, named by tag.
 *
 * It used to be the literal `ce4533e~1`, which is a trap: #109 rewrites this
 * repo's history to purge the PO Box blobs, and a rewrite invalidates every
 * SHA in it. #109 asks for that to be fixed "in the same change", but the new
 * SHA does not exist until the rewrite has already run — so naming the commit
 * by SHA can only ever be fixed afterwards, which is exactly the follow-up
 * nobody remembers to do.
 *
 * A tag has no such problem: `git filter-repo` re-points tags automatically,
 * so the rewrite needed no code change here at all.
 *
 * **The rewrite ran on 2026-09-18, and the tag is now the only name.** Until
 * then the script also fell back to the literal SHA, for a shallow clone
 * fetched without tags. That SHA no longer exists anywhere, so the fallback
 * went with the rewrite. A shallow clone that lacks the tag is still a real
 * state, and the preflight below says what to fetch.
 */
const ASSET_COMMIT = 'assets-pre-cleanup';

/** True if that committish resolves to a commit in this clone. */
function resolvesToCommit(rev) {
  try {
    execFileSync('git', ['rev-parse', '--verify', '--quiet', `${rev}^{commit}`], {
      cwd: ROOT,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

const LIVE_ORIGIN = 'https://www.aliwallick.com';
const BLOG_DIR = 'resources/blog-uploads';
const POSTER_DIR = 'resources/video-posters';

/* ------------------------------------------------------------------ *
 * 0. Modes
 *
 * Which mode is running is decided here, before the first line of code that
 * writes anything, rather than at the bottom of the file. There is no default
 * mode and an unrecognised flag exits rather than being ignored: a bare
 * invocation used to delete the archive, and `--check-self-contained` is an
 * easy thing to type.
 * ------------------------------------------------------------------ */

const USAGE = `Usage:
  node scripts/restore-snapshot.mjs --check-selfcontained  verify; writes nothing
  node scripts/restore-snapshot.mjs --serve                browse; writes nothing
  node scripts/restore-snapshot.mjs --rebuild              regenerate; destructive
  node scripts/restore-snapshot.mjs --rebuild --check-selfcontained

  --allow-missing-remote  rebuild even though files fetched from a remote host
                          cannot be fetched back. They will be lost.`;

const KNOWN_FLAGS = ['--rebuild', '--serve', '--check-selfcontained', '--allow-missing-remote'];
const args = new Set(process.argv.slice(2));
const unknown = [...args].filter((a) => !KNOWN_FLAGS.includes(a));
if (unknown.length) {
  console.error(`Unknown flag: ${unknown.join(', ')}\n\n${USAGE}`);
  process.exit(2);
}

const CHECK = args.has('--check-selfcontained');
const SERVE = args.has('--serve');
const REBUILD = args.has('--rebuild');
if (!CHECK && !SERVE && !REBUILD) {
  console.error(`${USAGE}\n\nPick a mode. There is no default one.`);
  process.exit(2);
}

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
 * 2b. Preflight
 *
 * A rebuild opens by deleting `snapshot/rendered/`, and it can only put back
 * the 28 files it derives from `snapshot/`. The other 74 come from a commit and
 * two remote hosts, none of which are guaranteed to be here: a shallow clone
 * cannot resolve ASSET_COMMIT, and a session behind an egress proxy reaches
 * neither host. Both were true at once when this was found (#344), which is how
 * the archive ended up at 27 of 102 files.
 *
 * So every source is proved reachable here, while the archive is still whole.
 * A rebuild that cannot finish does not start.
 * ------------------------------------------------------------------ */

/** True if that exact URL can be fetched right now. A throw and a 403 are the same answer. */
async function fetchable(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10_000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function preflight(blogRefs) {
  const fatal = [];
  const remote = [];

  if (!resolvesToCommit(ASSET_COMMIT)) {
    fatal.push(
      `${ASSET_COMMIT} does not resolve, so the 54 assets under resources/ cannot be
    restored. Usually that is a shallow clone — run \`git fetch --unshallow\`, and
    \`git fetch origin tag ${ASSET_COMMIT}\` if the tag is the one missing. It is the
    only name that works: #109's history rewrite retired the SHA it used to fall back to.`,
    );
  }

  /*
   * The remote half asks one question per file: can this exact byte range be
   * fetched back? Not "is the host up" — a proxy that refuses every CONNECT
   * still answers 403, and three of the nine videos are genuinely gone and
   * answer 403 too, so a status cannot be read as a verdict about a host.
   *
   * Which is why this probes the *committed* files rather than the source
   * references. Those are the ones the `rm` would take, and the three dead
   * videos have no poster committed, so they are never asked about.
   *
   * A first build has nothing to lose and is therefore not blocked here.
   */
  if (existsSync(OUT)) {
    const atRisk = [];
    for (const rel of [...blogRefs].sort()) {
      if (existsSync(path.join(OUT, BLOG_DIR, rel))) {
        atRisk.push([`${BLOG_DIR}/${rel}`, `${LIVE_ORIGIN}/blog/wp-content/uploads/${rel}`]);
      }
    }
    const posterDir = path.join(OUT, POSTER_DIR);
    if (existsSync(posterDir)) {
      for (const file of (await readdir(posterDir)).sort()) {
        const id = path.basename(file, '.jpg');
        // hqdefault is the size the build falls back to and always exists
        // while the video does, so it is the one that decides.
        atRisk.push([`${POSTER_DIR}/${file}`, `https://i.ytimg.com/vi/${id}/hqdefault.jpg`]);
      }
    }

    const results = await Promise.all(atRisk.map(([, url]) => fetchable(url)));
    const lost = atRisk.filter((_, i) => !results[i]).map(([rel]) => rel);
    if (lost.length) {
      remote.push(
        `${lost.length} of the ${atRisk.length} committed files fetched from a remote cannot be
    fetched back, so a rebuild would delete them for good. They are in neither
    snapshot/ nor git:
      ${lost.slice(0, 5).join('\n      ')}${lost.length > 5 ? `\n      ... and ${lost.length - 5} more` : ''}`,
      );
    }
  }

  if (!fatal.length && !remote.length) return;

  console.error('\nPreflight found sources this rebuild cannot reach:\n');
  for (const problem of [...fatal, ...remote]) console.error(`  - ${problem}\n`);

  // --allow-missing-remote covers the case that is permanent: once the old blog
  // is gone it is gone, and no later rebuild can be complete either. It
  // deliberately does not cover ASSET_COMMIT, which is one fetch away.
  if (fatal.length || !args.has('--allow-missing-remote')) {
    if (!fatal.length) {
      console.error('  Rebuild anyway with --allow-missing-remote. Those files will be lost;');
      console.error('  `git checkout -- snapshot/rendered` is how you get them back.\n');
    }
    console.error('✗ nothing was deleted. The archive is intact.');
    process.exit(1);
  }

  console.error('  --allow-missing-remote given; rebuilding without them.\n');
}

/* ------------------------------------------------------------------ *
 * 2c. The two files this script authors rather than derives
 *
 * They live out here, at module scope, because everything under section 3 is
 * inside `if (REBUILD)` and a template literal's own indentation is its
 * content.
 * ------------------------------------------------------------------ */

const ARCHIVE_CSS = `/* Added by scripts/restore-snapshot.mjs — not part of the original site.
   Styles the poster frames that replaced dead YouTube iframes. */
.archived-video { display: inline-block; max-width: 100%; }
.archived-video img { max-width: 100%; height: auto; border: 2px solid #4aa17a; }
.archived-video-missing { color: #9f2b00; font-style: italic; }
`;

const RENDERED_README = `# snapshot/rendered — the old site, made browsable

**Derived, not captured.** Generated by \`scripts/restore-snapshot.mjs\` from the
byte-faithful pages in \`snapshot/\` plus the images recovered from git at the commit
tagged \`assets-pre-cleanup\`. If you want the untouched record, read \`snapshot/\` — not this.

Open \`index.html\` in a browser, or serve it. Both read this directory and
neither writes to it:

    node scripts/restore-snapshot.mjs --serve

## What differs from the live 2026 site

- Root-absolute paths (\`/resources/...\`, \`/about\`) are relative, so this works
  offline and from \`file://\`.
- Four dead external dependencies are removed: html5shiv (Google Code, gone
  since 2015), the Unity Web Player (discontinued 2017), six WordPress
  polyfills, and the \`http://\` subresources browsers already block.
- YouTube iframes are static poster frames linking out to the video.
- \`resources/images/resume.png\` is **redacted**, and is the one file here that is
  not what the old site served. The 2019 résumé it pictures carries a PO Box, so
  this is a fresh render of the redacted \`resources/WallickAli-Resume.pdf\`
  instead of the historical blob — same page, same geometry, no address. See
  \`docs/PRESERVATION.md\`.

Everything else — markup, copy, CSS, \`nav.js\`, outbound links — is as captured.
This directory makes **zero external network requests**; that is asserted by
\`node scripts/restore-snapshot.mjs --check-selfcontained\`, which reads these
files and never writes them.

Regenerating is a separate, destructive command: \`--rebuild\`. Only 28 of these
102 files come from \`snapshot/\`; the rest come from a commit and two remote
hosts, so a rebuild refuses to start unless it can reach all three.
`;

/* ------------------------------------------------------------------ *
 * 3. Build — destructive, and skipped entirely by the read-only modes
 * ------------------------------------------------------------------ */

/**
 * The archive's 26 pages. Assigned from `snapshot/` when rebuilding and from
 * the rendered copy otherwise; the two sets are identical, because the rebuild
 * writes exactly one output page per source page.
 */
let pages;

if (REBUILD) {
  // --- 3a. everything the rebuild needs, read before anything is deleted ---
  pages = await htmlPages(SRC);
  const refs = new Set();
  const blogRefs = new Set();
  const videoIds = new Set();
  for (const p of pages) {
    const html = await readFile(path.join(SRC, p), 'utf8');
    for (const m of html.matchAll(/(?:src|href)="\/(resources\/[^"]+)"/g)) refs.add(m[1]);
    for (const m of html.matchAll(
      /(?:src|href)="https?:\/\/(?:www\.)?aliwallick\.com\/blog\/wp-content\/uploads\/([^"]+)"/g,
    )) {
      blogRefs.add(m[1]);
    }
    for (const m of html.matchAll(/youtube\.com\/(?:embed|v)\/([A-Za-z0-9_-]{11})/g)) {
      videoIds.add(m[1]);
    }
  }

  await preflight(blogRefs);

  console.log(`Rebuilding ${path.relative(ROOT, OUT)}/ ...\n`);
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  /**
   * Paths where a redacted working-tree file supersedes the historical blob.
   *
   * Not an aesthetic preference — a privacy one, and it is a **class** rather
   * than a list of paths. The 2019 résumé carries a PO Box, and the old site
   * shipped it twice: as the PDF, and as a full-page PNG render of the same
   * document embedded on `resume.html`. Restoring either from ASSET_COMMIT is
   * faithful and also silently manufactures a fresh copy of an exposure the
   * repo is actively trying to reduce (#197, #200).
   *
   * That has now happened twice, and the first fix is why. The script's first
   * run restored the unredacted *PDF* and it was committed before anyone
   * noticed; the fix was a one-entry `PREFER_WORKTREE` set naming that path.
   * The very next rebuild did the identical thing one file over, because the
   * risk was never "this path" — it was "any historical asset that pictures
   * the résumé". Hence a map, and hence the guard: naming paths here is
   * necessary but cannot be sufficient, so `scripts/check-preserved-blobs.mjs`
   * fails the build on the *content* of the known-bad blobs, wherever in the
   * tree they land. That check is what actually closes the class; this map
   * just keeps a rebuild from reopening it.
   *
   * The PDF's address line was deleted from its content stream and the PNG is
   * a fresh 200-DPI render of that redacted PDF — see docs/PRESERVATION.md.
   * The originals are untouched in history and in `v1-legacy`.
   */
  const SUPERSEDE = new Map([
    ['resources/WallickAli-Resume.pdf', 'resources/WallickAli-Resume.pdf'],
    ['resources/images/resume.png', 'resources/resume-redacted.png'],
  ]);

  let restored = 0;
  let restoredBytes = 0;
  let superseded = 0;
  const missing = [];
  for (const ref of [...refs].sort()) {
    let buf;
    if (SUPERSEDE.has(ref) && existsSync(path.join(ROOT, SUPERSEDE.get(ref)))) {
      buf = await readFile(path.join(ROOT, SUPERSEDE.get(ref)));
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
  console.log(
    `           ${blogMatched.length}/${blogOk} byte-identical to content/archive/images/`,
  );
  if (blogFailed.length) {
    console.log(`  FAILED   ${blogFailed.length} — is the old host still up?`);
    for (const f of blogFailed) console.log(`    ${f}`);
  }

  // --- 3b. YouTube poster frames -------------------------------------------
  await mkdir(path.join(OUT, POSTER_DIR), { recursive: true });
  let posters = 0;
  const posterMissing = [];
  for (const id of [...videoIds].sort()) {
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
  console.log(`  posters  ${posters}/${videoIds.size} fetched into ${POSTER_DIR}/`);
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
  await writeFile(path.join(OUT, 'resources/css/archive.css'), ARCHIVE_CSS);
  for (const p of pages) {
    const dest = path.join(OUT, p);
    let html = await readFile(dest, 'utf8');
    const href = relativize(p, 'resources/css/archive.css');
    html = html.replace(/<\/head>/i, `  <link rel="stylesheet" href="${href}">\n</head>`);
    await writeFile(dest, html);
  }

  // --- 3e. a README so the directory explains itself ------------------------
  await writeFile(path.join(OUT, 'README.md'), RENDERED_README);

  console.log(`\n✓ ${path.relative(ROOT, OUT)}/ rebuilt.`);
  const totalSize = execFileSync('du', ['-sh', OUT]).toString().split('\t')[0];
  console.log(`  size: ${totalSize}`);
}

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
 *
 * This asserts against `snapshot/rendered/` as it stands on disk, which is the
 * whole contract `--check-selfcontained` implies and did not honour until #344.
 * Reading the page list from the archive rather than from `snapshot/` is what
 * makes it a check on the artifact instead of on the artifact's inputs.
 * ------------------------------------------------------------------ */

if (CHECK || SERVE) {
  if (!existsSync(OUT)) {
    console.error(`✗ ${path.relative(ROOT, OUT)}/ does not exist — rebuild it first:`);
    console.error('    node scripts/restore-snapshot.mjs --rebuild');
    process.exit(1);
  }
  pages ??= await htmlPages(OUT);

  const { serveDist } = await import('./lib/serve-dist.mjs');
  const { launchChromium } = await import('./lib/launch-chromium.mjs');
  const { origin, close } = await serveDist(OUT);

  if (SERVE && !CHECK) {
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
