/**
 * Global site configuration. Not a content collection — this is config, and it
 * changes on the order of once a year. Collections are for things that get
 * added repeatedly (projects, jobs), which is where the "one Markdown file, no
 * layout change" rule matters.
 */

export const site = {
  name: 'Ali Wallick',
  /**
   * "Game Developer" alone was confirmed at the Phase 3 gate. "Software
   * Engineer" added 2026-08-26, on Ali's call, to close the gap between this
   * line and the homepage lede's own "I'm a software engineer" opener.
   */
  role: 'Game Developer · Software Engineer',
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
 * `false` for every build until the DNS cutover — every branch preview,
 * including `main`'s and `release`'s, is pre-launch, because aliwallick.com
 * still serves the old PHP site. `BaseLayout.astro`'s sitewide
 * `<meta name="robots" content="noindex">` and `robots.txt`'s Allow/Disallow
 * both derive from this one flag rather than each tracking it separately, so
 * they can't drift out of sync with each other.
 *
 * TODO(launch): flip to `true` in the same PR as the DNS cutover (#74) — not
 * before, since the whole point is staying noindexed until that moment.
 */
export const live = false;

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
