/**
 * Serves a built `dist/` directory over HTTP for scripts that need Playwright
 * to navigate it (currently `build-pdf.mjs` and `check-resume-print.mjs`).
 *
 * Every internal href on this site is root-relative (`/about`, `/_astro/...`),
 * a rule `scripts/check-links.mjs` enforces — under `file://` those resolve
 * against the filesystem root and silently fetch nothing, so a page opened
 * from disk looks almost right and is missing its stylesheet. Serving over
 * `http://` is what makes it look like what a browser actually gets.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

/**
 * Resolve a request path the way Cloudflare serves the built site.
 * `astro.config.mjs` uses `trailingSlash: 'never'` + `build.format: 'file'`,
 * so `/resume` comes from `resume.html` — the same resolution
 * `scripts/check-links.mjs` models.
 */
function resolveFile(distDir, pathname) {
  const clean = decodeURIComponent(pathname.split('?')[0]).replace(/\/+$/, '') || '/';
  const candidates =
    clean === '/' ? ['/index.html'] : [clean, `${clean}.html`, `${clean}/index.html`];
  for (const candidate of candidates) {
    const full = path.join(distDir, candidate);
    // Refuse to serve outside dist/, however the path was spelled.
    if (!full.startsWith(distDir)) continue;
    // Must be a *file*. `/resume` matches both `dist/resume.html` and the
    // `dist/resume/` directory that `/resume/full` creates, and a bare
    // existsSync happily returns the directory — which then fails as EISDIR
    // halfway through a build.
    if (existsSync(full) && statSync(full).isFile()) return full;
  }
  return null;
}

/**
 * Starts a local server rooted at `distDir` and resolves once it's listening.
 * Returns `{ origin, close }` — call `close()` when done with it.
 */
export async function serveDist(distDir) {
  const server = createServer(async (req, res) => {
    const file = resolveFile(distDir, req.url ?? '/');
    if (!file) {
      res.writeHead(404).end('not found');
      return;
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, {
        'content-type': MIME[path.extname(file)] ?? 'application/octet-stream',
      });
      res.end(body);
    } catch (error) {
      res.writeHead(500).end(String(error));
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;

  return { origin, close: () => server.close() };
}
