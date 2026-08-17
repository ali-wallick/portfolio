/**
 * Global site configuration. Not a content collection — this is config, and it
 * changes on the order of once a year. Collections are for things that get
 * added repeatedly (projects, jobs), which is where the "one Markdown file, no
 * layout change" rule matters.
 */

export const site = {
  name: 'Ali Wallick',
  /** Phase 3 owns the wording. This is the old site's, verbatim, as a placeholder. */
  role: 'Game Developer',
  url: 'https://aliwallick.com',

  /**
   * Locked in during Phase 1. `ali@` also works and is on the same iCloud+ plan,
   * but `contact@` is the address that goes on the public site.
   */
  email: 'contact@aliwallick.com',
} as const;

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
 * Carried over from the old site's footer and contact page. Every one is
 * `pending` until the Phase 3 audit: a 2016 Twitter link and a Steam profile
 * are not automatically still the right answer in 2026.
 */
export const socials: SocialLink[] = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/aliwallick', status: 'pending' },
  { label: 'Twitter', url: 'https://twitter.com/aliwallick', status: 'pending' },
  { label: 'Facebook', url: 'https://www.facebook.com/awallick', status: 'pending' },
  { label: 'Steam', url: 'https://steamcommunity.com/id/beantoes', status: 'pending' },
];

export const nav = [
  { label: 'Projects', href: '/projects' },
  { label: 'Resume', href: '/resume' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;
