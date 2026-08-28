import { getEntry } from 'astro:content';
import { site, socials } from '~/config/site';
import { getJobs } from '~/lib/content';

/**
 * schema.org `Person` for the homepage (#106).
 *
 * **Derived, never hand-written.** A literal JSON-LD block would be a second
 * place every fact on it could go stale — which is the failure the content
 * model exists to rule out, and exactly how the old site ended up calling the
 * Marvel game "upcoming" on four pages at once. Everything here reads the same
 * sources /resume and the About timeline already read, so a promotion or a new
 * social link reaches search engines by the same edit that reaches the page.
 *
 * ## What it deliberately does not say
 *
 * `worksFor` names Second Dinner and stops there. The 2024–present project is
 * fenced off (CLAUDE.md, Phase 3 gate): no title, no genre, no features. A
 * machine-readable claim is not a lesser one, so the ceiling applies here
 * exactly as it does to prose.
 */
export async function personJsonLd() {
  const [current] = await getJobs('site');
  const role = current.data.roles.at(-1)!;

  /* Read off the project rather than retyped, the same way
     scripts/build-linkedin.mjs reads it: the credit is a fact about Marvel
     Snap, and it lives in that project's `links`. */
  const snap = await getEntry('projects', 'marvel-snap');
  const credit = snap?.data.links.find((l) => l.kind === 'press');

  const sameAs = [
    ...socials.filter((s) => s.status === 'active').map((s) => s.url),
    ...(credit ? [credit.url] : []),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: site.url,
    email: `mailto:${site.email}`,
    jobTitle: role.title,
    worksFor: { '@type': 'Organization', name: current.data.company },
    sameAs,
  };
}
