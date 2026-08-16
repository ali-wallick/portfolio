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
 * work is fit for aliwallick.com. Preview and production run the identical
 * `astro build`, so the only thing that can distinguish them is an environment
 * variable. `SHOW_DRAFTS=true` is set on the Cloudflare **Preview** environment
 * only (see docs/CLOUDFLARE-PAGES.md).
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

/** Human label for the honest-framing status field. */
export const STATUS_LABEL: Record<Project['data']['status'], string> = {
  shipped: 'Shipped',
  prototype: 'Prototype',
  jam: 'Game jam',
  coursework: 'Student project',
  unannounced: 'Unannounced',
};
