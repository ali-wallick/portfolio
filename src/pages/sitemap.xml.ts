import type { APIRoute } from 'astro';
import { site } from '~/config/site';
import { getIndexableProjects } from '~/lib/content';

/**
 * Hand-rolled rather than `@astrojs/sitemap`: an eight-route site doesn't earn
 * a dependency, but the content model's rule still applies — generated from
 * the collections, never written out by hand (`src/content.config.ts`). The
 * static routes below are the whole non-collection surface of the site; every
 * project route comes from `getIndexableProjects()`, which is the one query
 * in `src/lib/content.ts` that always excludes drafts, build setting or not.
 */
const STATIC_ROUTES = ['/', '/about', '/contact', '/projects', '/resume', '/resume/full'];

export const GET: APIRoute = async () => {
  const projects = await getIndexableProjects();
  const routes = [...STATIC_ROUTES, ...projects.map((project) => `/projects/${project.id}`)];

  const urls = routes
    .map((route) => `  <url><loc>${new URL(route, site.url).href}</loc></url>`)
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
