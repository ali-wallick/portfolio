/**
 * Global site configuration. Not a content collection — this is config, and it
 * changes on the order of once a year. Collections are for things that get
 * added repeatedly (projects, jobs), which is where the "one Markdown file, no
 * layout change" rule matters.
 */

/**
 * What Ali does, one entry per hat, most-primary first.
 *
 * "Game Developer" alone was confirmed at the Phase 3 gate. "Software
 * Engineer" added 2026-08-26, on Ali's call, to close the gap between this
 * line and the homepage lede's own "I'm a software engineer" opener.
 *
 * An array rather than the hand-joined string this used to be, for the same
 * reason a project's `role` became one in #152: it is the one multi-value
 * field about Ali, and #256 gave it a second consumer that wants a subset —
 * the homepage's tab title takes the primary hat only, where the eyebrow and
 * the résumé header take all of them. The join belongs at the point of
 * rendering rather than in the source, so there is still exactly one place a
 * hat is written down.
 */
const roles = ['Game Developer', 'Software Engineer'] as const;

export const site = {
  name: 'Ali Wallick',
  roles,
  /** Every hat, joined the way this site has always shown them. */
  role: roles.join(' · '),
  url: 'https://aliwallick.com',

  /**
   * Locked in during Phase 1. `ali@` also works and is on the same iCloud+ plan,
   * but `contact@` is the address that goes on the public site.
   */
  email: 'contact@aliwallick.com',

  /**
   * Cloudflare Web Analytics site token (issue #30). Not a secret — it's
   * designed to sit in public page markup, the same as the token in
   * Cloudflare's own snippet. What actually needs gating is *whether* the
   * beacon renders, not the token's visibility: `BaseLayout.astro` only emits
   * it when `!showDrafts`, so preview deploys and `astro dev` never report
   * pageviews and only `main` builds do.
   */
  analyticsToken: 'bd2daf82080746f2bc1529235444ac67',
} as const;

/**
 * Whether aliwallick.com is the live production domain yet.
 *
 * Flipped to `true` at the DNS cutover (#74, #34). `BaseLayout.astro`'s
 * sitewide `<meta name="robots" content="noindex">` and `robots.txt`'s
 * Allow/Disallow both derive from this one flag rather than each tracking it
 * separately, so they can't drift out of sync with each other. Flipping it
 * un-noindexes every page, opens the crawl directives, and adds `robots.txt`'s
 * `Sitemap:` line, all in one edit.
 *
 * One consequence, recorded rather than decided: this is a plain constant, not
 * derived from the branch, so flipping it makes BRANCH PREVIEWS indexable too.
 * `robots.txt.ts`'s comment still describes the pre-cutover world where every
 * preview said `Disallow`. Draft project pages are unaffected — they carry
 * their own `noindex` (`projects/[...slug].astro`) — and every preview page
 * canonicalises to aliwallick.com, so the exposure is duplicate hostnames
 * rather than leaked content. Whether previews should go back to `Disallow`
 * via `WORKERS_CI_BRANCH` is #212.
 */
export const live = true;

export type SocialLink = {
  label: string;
  url: string;
  /**
   * Phase 3 does an explicit pass on which accounts still represent Ali.
   * `pending` means "carried over from the old site, not yet re-confirmed" —
   * pending links are not rendered in production.
   */
  status: 'active' | 'pending' | 'retired';
};

/**
 * Phase 3 audit, settled at the gate: LinkedIn is the only account that still
 * represents Ali professionally. The X/Twitter account still exists but she no
 * longer posts there, Facebook was never a professional presence, and a Steam
 * profile isn't a professional credit — all three `retired` rather than shown.
 */
export const socials: SocialLink[] = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/aliwallick', status: 'active' },
  { label: 'GitHub', url: 'https://github.com/ali-wallick', status: 'active' },
  { label: 'Twitter', url: 'https://twitter.com/aliwallick', status: 'retired' },
  { label: 'Facebook', url: 'https://www.facebook.com/awallick', status: 'retired' },
  { label: 'Steam', url: 'https://steamcommunity.com/id/beantoes', status: 'retired' },
];

export const nav = [
  { label: 'Projects', href: '/projects' },
  { label: 'Resume', href: '/resume' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;
