import { getCollection, type CollectionEntry } from 'astro:content';
import {
  currentTitle as currentTitleRule,
  selectEducation,
  selectJobs,
  thumbSource,
} from '~/lib/content-rules';

export type Project = CollectionEntry<'projects'>;
export type Job = CollectionEntry<'jobs'>;
export type Education = CollectionEntry<'education'>;

/**
 * Drafts show in `astro dev` and on Cloudflare **preview** deploys, and are
 * hidden in production.
 *
 * This is the review loop the whole project is built around: push a branch,
 * Cloudflare posts a preview URL, open it on a phone, react — all before the
 * work is fit for aliwallick.com.
 *
 * Every branch runs the identical `astro build`, so something has to tell them
 * apart. `scripts/build-ci.mjs` sets `SHOW_DRAFTS=true` for any branch that
 * isn't the production one — in committed code rather than in dashboard state,
 * so the rule is readable from a checkout and behaves the same locally.
 * See docs/CLOUDFLARE.md.
 */
export const showDrafts = process.env.SHOW_DRAFTS === 'true' || import.meta.env.DEV;

function visible(project: Project): boolean {
  return showDrafts || !project.data.draft;
}

/** Featured projects in their hand-chosen order. */
export async function getFeaturedProjects(): Promise<Project[]> {
  const all = await getCollection('projects', visible);
  return all
    .filter((p) => p.data.tier === 'featured')
    .sort((a, b) => (a.data.featureOrder ?? Infinity) - (b.data.featureOrder ?? Infinity));
}

/** Archive projects, newest first, then alphabetical within a year. */
export async function getArchiveProjects(): Promise<Project[]> {
  const all = await getCollection('projects', visible);
  return all
    .filter((p) => p.data.tier === 'archive')
    .sort(
      (a, b) =>
        (b.data.endYear ?? b.data.startYear) - (a.data.endYear ?? a.data.startYear) ||
        a.data.title.localeCompare(b.data.title),
    );
}

export async function getAllProjects(): Promise<Project[]> {
  return [...(await getFeaturedProjects()), ...(await getArchiveProjects())];
}

/**
 * Every project that exists in production, regardless of `showDrafts`.
 *
 * Deliberately the one query in this file that does *not* honor `showDrafts`.
 * Cloudflare previews build with `SHOW_DRAFTS=true` so the review loop can see
 * draft pages, but `sitemap.xml` has to be the production route list on every
 * build — a sitemap that followed `showDrafts` would advertise draft project
 * URLs that 404 once the same commit deploys to production.
 */
export async function getIndexableProjects(): Promise<Project[]> {
  return getCollection('projects', (project) => !project.data.draft);
}

/** Jobs, most recent first. A missing `end` means "current", which sorts top. */
export async function getJobs(surface: 'site' | 'resume'): Promise<Job[]> {
  return selectJobs(await getCollection('jobs'), surface);
}

/** Education entries, most recent first, honouring `onResume`. */
export async function getEducation(): Promise<Education[]> {
  return selectEducation(await getCollection('education'));
}

// ---------------------------------------------------------------------------
// Display helpers — the only place year/date formatting is allowed to live
// ---------------------------------------------------------------------------

/** `2011` or `2011–2015`. En dash, not hyphen. */
export function formatYears(startYear: number, endYear?: number): string {
  return endYear && endYear !== startYear ? `${startYear}–${endYear}` : String(startYear);
}

/**
 * `2015 – 2016`, `2019 – Present`. Formats a job or education span as
 * year-only, dropping any stored month precision.
 *
 * The resume prints years only, settled with Ali 2026-08-26 (#32). Red 5's
 * start is sourced to the month (`2015-06`, from about.php) and Second Dinner's
 * promotion to `2021-12`, but with the "Previously ..." line gone from the
 * resume the only month left on the page was Red 5's, and one month among four
 * jobs reads as an inconsistency rather than as precision.
 *
 * **The stored precision is not dead data** — `docs/LINKEDIN.md` still prints
 * both, via its own mirrored formatter in scripts/build-linkedin.mjs, and
 * LinkedIn's position fields take a month natively. So the month has a reader;
 * it just isn't this document.
 */
export function formatSpanYears(start: string, end?: string): string {
  const year = (value: string) => value.split('-')[0]!;
  return `${year(start)} – ${end ? year(end) : 'Present'}`;
}

/** The title to show for a job: the most recent entry in its role progression. */
export function currentTitle(job: Job): string {
  return currentTitleRule(job);
}

/**
 * The current work, for the homepage "Currently" box and the About career
 * paragraph: the facts (`since`, `doing`, and the employer) from the current
 * job — the one with no `end`. Each page composes its own sentence from these;
 * see `current` in `content.config.ts` for why this is not a shared string.
 */
export async function getCurrentWork(): Promise<{ since: string; doing: string; company: string }> {
  const jobs = await getJobs('site');
  const current = jobs.find((j) => j.data.end === undefined)!;
  return { ...current.data.current!, company: current.data.company };
}

// ---------------------------------------------------------------------------
// Thumbnails
// ---------------------------------------------------------------------------

/**
 * The image to show for a project on a card or tile, or `undefined` when there
 * isn't one.
 *
 * The resolution order — which override `aspect` picks, and what it falls
 * through to — is `thumbSource()` in `~/lib/content-rules`, shared with
 * `scripts/generate-og-images.mjs` so the share cards and the site's own tiles
 * can never disagree about which picture represents a project (#328).
 *
 * ## Why there is no `alt` here
 *
 * Every caller renders this inside a card or tile whose link text is already
 * the project title. An image there is **decorative by construction**: it adds
 * nothing a screen reader user isn't already told, and `alt="Marvel Snap key
 * art"` inside a link named "Marvel Snap" makes the name announce twice.
 *
 * That is a real exception to the model's `alt`-is-required guard, so it is
 * worth being precise about what the guard is for. The guard exists because the
 * old site had **no alt text anywhere**, including on images that carried
 * meaning — heroes and gallery shots, which still require it via `mediaSchema`.
 * It does not exist to force alt text onto an image that duplicates its own
 * link.
 *
 * `ProjectThumb.astro` sets `alt=""`. That needed a matching change in
 * scripts/check-links.mjs, which rejected it: the rule tested for `alt="..."`
 * and the build minifier collapses an empty alt to a valueless `alt`, so every
 * decorative image failed the check for being correct. It now accepts an
 * explicitly empty alt and still rejects a missing one, which is the
 * distinction the guard was always meant to draw.
 */
export function projectThumb(
  project: Project,
  aspect: 'square' | 'wide' = 'square',
): ImageMetadata | undefined {
  // An `art` hero resolves to `undefined`; the card and tile fall back to the
  // same generated art the hero itself renders (#49).
  return thumbSource<ImageMetadata>(project.data, aspect);
}

/**
 * What a project was built in: `engine`, falling back to `tech`, falling back
 * to `platforms`, so a project with an empty earlier field doesn't render as
 * blank. This is the metadata strip's own fallback chain — `ProjectMeta.astro`
 * and `ProjectCardArt.astro` both call it, so they can never disagree about
 * what a project was built in.
 */
export function projectBuilt(project: Project): string[] {
  const { engine, tech, platforms } = project.data;
  return engine.length ? engine : tech.length ? tech : platforms;
}

/** Human label for the honest-framing status field. */
export const STATUS_LABEL: Record<NonNullable<Project['data']['status']>, string> = {
  shipped: 'Shipped',
  prototype: 'Prototype',
  jam: 'Game jam',
  coursework: 'Student project',
  unannounced: 'Unannounced',
};

/**
 * Human label for `kind`, shown as a chip on every entry that is not a game
 * (#49). `game` has a label so the record is total and the build fails if the
 * enum grows without one, but `ProjectMeta.astro` never renders it: games are
 * the default, and a chip saying "Game" on sixteen of eighteen tiles would say
 * nothing.
 */
export const KIND_LABEL: Record<Project['data']['kind'], string> = {
  game: 'Game',
  site: 'Website',
  talk: 'Talk',
  tool: 'Tool',
};

/**
 * Human label for a link's `kind` (#290), shown in the "See Also" list's
 * leading gutter. Typed against the schema's own enum rather than
 * `Record<string, string>`, so adding a `kind` fails the build here instead
 * of rendering the raw value.
 */
export const LINK_KIND_LABEL: Record<Project['data']['links'][number]['kind'], string> = {
  store: 'Store',
  play: 'Play',
  video: 'Video',
  source: 'Source',
  press: 'Press',
  jam: 'Jam',
  site: 'Site',
  slides: 'Slides',
};
