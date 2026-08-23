import type { APIRoute } from 'astro';
import { site, live } from '~/config/site';

/**
 * Every build — every branch preview, plus `main`/`release` before the DNS
 * cutover — must tell crawlers to stay out entirely, not just the individual
 * draft pages `noindex` already covers. `live` is the same flag
 * `BaseLayout.astro` uses for its sitewide `<meta name="robots">`, so this
 * can't end up disagreeing with it: both flip together at the cutover (#74).
 *
 * Once live, this points crawlers at the sitemap instead of blocking them —
 * the two states this file can be in map exactly to the two `live` can be in.
 */
export const GET: APIRoute = () => {
  const body = live
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site.url).href}\n`
    : `User-agent: *\nDisallow: /\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
