import { getCollection, type CollectionEntry } from 'astro:content';

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
  const all = await getCollection('jobs');
  return all
    .filter((j) => (surface === 'resume' ? j.data.onResume : j.data.onSite))
    .sort((a, b) => (b.data.end ?? '9999').localeCompare(a.data.end ?? '9999'));
}

export async function getEducation(): Promise<Education[]> {
  const all = await getCollection('education');
  return all.sort((a, b) => b.data.end.localeCompare(a.data.end));
}

// ---------------------------------------------------------------------------
// Display helpers — the only place year/date formatting is allowed to live
// ---------------------------------------------------------------------------

/** `2011` or `2011–2015`. En dash, not hyphen. */
export function formatYears(startYear: number, endYear?: number): string {
  return endYear && endYear !== startYear ? `${startYear}–${endYear}` : String(startYear);
}

/** `2016 – 2019`, `2019 – Present`. Accepts mixed `YYYY` / `YYYY-MM` precision. */
export function formatSpan(start: string, end?: string): string {
  return `${formatDatePart(start)} – ${end ? formatDatePart(end) : 'Present'}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDatePart(value: string): string {
  const [year, month] = value.split('-');
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : year!;
}

/** The title to show for a job: the most recent entry in its role progression. */
export function currentTitle(job: Job): string {
  return job.data.roles[job.data.roles.length - 1]!.title;
}

/**
 * The "currently" line for the current job (the one with no `end`) — the
 * single source for the homepage lede and the About intro paragraph.
 */
export async function getCurrentNote(): Promise<string> {
  const jobs = await getJobs('site');
  const current = jobs.find((j) => j.data.end === undefined)!;
  return current.data.currentNote!;
}

// ---------------------------------------------------------------------------
// Thumbnails
// ---------------------------------------------------------------------------

/**
 * Poster frames pulled from YouTube heroes by scripts/fetch-posters.mjs, keyed
 * by project slug.
 *
 * Globbed rather than declared in front matter, and that is the content model's
 * own rule being kept rather than bent: *"adding a project is one Markdown
 * file."* If a poster had to be named in front matter, every future project
 * with a video hero would need a second edit in a second place to get a
 * thumbnail — which is the shape this model exists to rule out. Drop a
 * `poster.jpg` next to the project's other assets and it is picked up.
 *
 * `eager` because these are used during render, and Vite hands back real
 * `ImageMetadata` — width and height included, which is what keeps `<Image>`
 * emitting intrinsic dimensions and the layout from shifting.
 */
const POSTERS = Object.fromEntries(
  Object.entries(
    import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/projects/*/poster.jpg', {
      eager: true,
    }),
  ).map(([path, module]) => [path.split('/').at(-2)!, module.default]),
);

/**
 * The image to show for a project on a card or tile, or `undefined` when there
 * isn't one.
 *
 * `aspect` picks which override wins — `thumb` for a square context, `thumbWide`
 * for a 16:9 one (#64: the featured cards read better wide on the homepage,
 * where there's no summary paragraph beside them, and square on /projects and
 * the archive tiles). Whichever one is unset falls through to the same shared
 * source, so a project with no `thumbWide` isn't missing an image — it gets
 * the general-purpose one instead:
 *
 *   1. `thumb` / `thumbWide` in front matter — an explicit override, normally
 *      absent, and the only step that differs by `aspect`.
 *   2. An image `hero` — already a still of the work, so it is its own thumbnail.
 *   3. A poster frame — for the nine projects whose hero is a video.
 *
 * That fallback is why I Fits I Sits and Kaneva need no `thumbWide` at all —
 * their `hero` is already an image suited to either shape. It's also why the
 * three projects with a video `hero` (Marvel Snap, Vegas Blvd Slots, Firefall)
 * still show a YouTube poster frame in the wide slot until a real wide capture
 * lands in `thumbWide`: the fallback has nothing better to reach for.
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
  const { thumb, thumbWide, hero } = project.data;
  const override = aspect === 'wide' ? thumbWide : thumb;
  if (override) return override;
  if (hero?.type === 'image') return hero.src;
  return POSTERS[project.id];
}

/** Human label for the honest-framing status field. */
export const STATUS_LABEL: Record<Project['data']['status'], string> = {
  shipped: 'Shipped',
  prototype: 'Prototype',
  jam: 'Game jam',
  coursework: 'Student project',
  unannounced: 'Unannounced',
};
