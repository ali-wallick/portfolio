import { site } from '~/config/site';

/**
 * Spread onto an `<a>` to open it in a new tab when — and only when — it
 * leaves the site: a different origin. Internal links, `mailto:`, and links
 * back to the site's own origin (the resume's self-link) navigate normally,
 * so this is safe to apply unconditionally at every call site.
 *
 * Markdown body links get the same rule via the `rehypeExternalLinks` plugin
 * in astro.config.mjs — the two are kept in sync by sharing the same origin
 * check rather than duplicating the logic.
 */
export function externalLinkProps(
  url: string,
): { target: '_blank'; rel: string } | Record<string, never> {
  if (!/^https?:\/\//.test(url)) return {};
  if (new URL(url).host === new URL(site.url).host) return {};
  return { target: '_blank', rel: 'noopener noreferrer' };
}
