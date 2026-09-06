/**
 * The content model's **rules** — ordering, grouping, and fallback — for the
 * `jobs`, `education` and `projects` collections.
 *
 * ## What this is, and why it is its own file
 *
 * `src/lib/content.ts` is the *query* layer: it calls `getCollection()` and
 * hands back typed entries. That import is `astro:content`, which resolves
 * only inside Astro's build graph — so three standalone Node scripts that need
 * the same answers each re-implemented the piece they wanted. Five copies,
 * each carrying a "keep in sync with …" comment: the content model's own
 * failure mode (two places a fact can drift) applied to code instead of data.
 * See #328, and #108 for the read that found them.
 *
 * This file is what both sides import. It holds the rules; `content.ts` holds
 * the fetching.
 *
 * ## The two import forms
 *
 * From Astro/TypeScript, by alias:
 *
 *     import { selectJobs } from '~/lib/content-rules';
 *
 * From a `.mjs` script under `scripts/`, relative and **with the extension** —
 * `~/*` is a TS/Vite alias plain `node` cannot resolve:
 *
 *     import { selectJobs } from '../src/lib/content-rules.ts';
 *
 * ## Two rules this file must keep, or every `.mjs` caller breaks
 *
 * **1. It imports nothing at runtime.** Not a package, not another module in
 * `src/`. Node strips the types out of this file and then executes what is
 * left; a runtime import of anything that reaches `astro:content` — directly
 * or three modules down — dies at `node scripts/…`. The structural interfaces
 * below are deliberately hand-written rather than `import type`-ed from
 * `astro:content`: a type-only import *does* work (Node erases it, `astro
 * check` resolves it through the generated `.astro/types.d.ts`), but the whole
 * guarantee would then rest on one keyword nothing in `npm run verify` fails
 * fast on. Twelve lines cost less than that risk, and they are not weaker —
 * `astro check` still type-checks the real `CollectionEntry` at each
 * `content.ts` call site, so a schema rename fails `npm run check`.
 *
 * **2. Erasable syntax only.** No `enum`, no `namespace`, no parameter
 * properties, no `import x = require()`. Node's type stripping replaces types
 * with whitespace; it does not *compile*, so anything that emits JavaScript of
 * its own throws. `erasableSyntaxOnly: true` in `tsconfig.json` turns that from
 * a comment into a compiler error on the `npm run check` every PR already runs.
 *
 * ## The Node floor
 *
 * Unflagged type stripping landed in **Node 22.18.0**, which is why
 * `package.json`'s `engines.node` says `>=22.18.0`. Below that, importing this
 * file from a `.mjs` throws `ERR_UNKNOWN_FILE_EXTENSION`.
 */

/**
 * The subset of a job's front matter these rules read.
 *
 * `onResume` and `onSite` are optional because `scripts/lib/frontmatter.mjs`
 * reads raw YAML and applies no Zod defaults, while Astro's copy always has
 * them — `!== false` is the predicate that reads both correctly. `end` absent
 * means "current", which sorts to the top via the `'9999'` sentinel.
 */
export interface JobFacts {
  onResume?: boolean;
  onSite?: boolean;
  end?: string;
}

/** The subset of an education entry these rules read. */
export interface EducationFacts {
  onResume?: boolean;
  end: string;
}

/** A `bulletGroups` value: the heading a block of bullets renders under. */
export interface BulletGroup {
  label: string;
  dates?: string;
  intro?: string;
}

/** One block of bullets, with the heading it renders under (if any). */
export interface BulletBlock<B> {
  key: string;
  heading: BulletGroup | undefined;
  items: B[];
}

/**
 * The subset of a project's front matter `thumbSource` reads. `T` is the image
 * type: `ImageMetadata` inside Astro, a `string` path off raw YAML.
 */
export interface ThumbFields<T> {
  thumb?: T;
  thumbWide?: T;
  hero?: { type: 'image'; src: T } | { type: 'youtube'; poster: { src: T } } | { type: 'art' };
}

/**
 * Jobs for one surface, most recent first. A missing `end` means "current",
 * which sorts top.
 */
export function selectJobs<J extends { data: JobFacts }>(
  jobs: J[],
  surface: 'site' | 'resume',
): J[] {
  const flag = surface === 'resume' ? 'onResume' : 'onSite';
  return jobs
    .filter((j) => j.data[flag] !== false)
    .sort((a, b) => (b.data.end ?? '9999').localeCompare(a.data.end ?? '9999'));
}

/**
 * Education entries, most recent first.
 *
 * The `onResume` filter used to be `docs/LINKEDIN.md`'s alone — `getEducation()`
 * applied none, so `/resume` was quietly ignoring a field the schema declares
 * (`content.config.ts`). That is the dead-data shape the guard table exists to
 * rule out, so the filter is shared and both surfaces honour it now.
 * `georgia-tech.md` is the only entry and doesn't set it, so nothing on the
 * site moved (#328).
 */
export function selectEducation<E extends { data: EducationFacts }>(entries: E[]): E[] {
  return entries
    .filter((e) => e.data.onResume !== false)
    .sort((a, b) => b.data.end.localeCompare(a.data.end));
}

/** The title to show for a job: the most recent entry in its role progression. */
export function currentTitle(job: { data: { roles: { title: string }[] } }): string {
  return job.data.roles[job.data.roles.length - 1]!.title;
}

/**
 * Split a job's bullets into the blocks that render under it.
 *
 * Order comes from the bullets, not from `bulletGroups`' declaration order, so
 * resequencing the resume means moving bullets and nothing else. A job whose
 * bullets carry no `group` yields exactly one headingless block, which is every
 * job but Second Dinner and is byte-identical to what rendered before groups
 * existed.
 *
 * This is also what keeps a `highlightsExtended` bullet inside its own group
 * rather than stranded after every group -- the superset invariant is about
 * content, and appending the long-version bullets to the end of a grouped job
 * would have printed "Marvel Snap" as a heading twice.
 *
 * `groups` is optional because the raw-YAML caller has no Zod default to lean
 * on. An ungrouped bullet takes key `''` and no heading, whatever `groups`
 * happens to contain.
 *
 * **Print density is not this function's business.** Whether a block is
 * full-only is a fact about the résumé's two densities and means nothing on
 * LinkedIn, so `ResumeDocument.astro` derives it per block at the call site.
 */
export function bulletBlocks<B extends { group?: string }>(
  bullets: B[],
  groups: Record<string, BulletGroup> | undefined,
): BulletBlock<B>[] {
  const order: string[] = [];
  const byKey = new Map<string, B[]>();
  for (const bullet of bullets) {
    const key = bullet.group ?? '';
    if (!byKey.has(key)) {
      byKey.set(key, []);
      order.push(key);
    }
    byKey.get(key)!.push(bullet);
  }
  return order.map((key) => ({
    key,
    heading: key ? groups?.[key] : undefined,
    items: byKey.get(key)!,
  }));
}

/**
 * The image that represents a project, or `undefined` when there isn't one.
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
 *   3. A video `hero`'s `poster` — the still it shows when YouTube is slow or
 *      gone, which is the same picture a card wants.
 *
 * Note the fall-through: `'wide'` with no `thumbWide` goes to the **hero**, not
 * to `thumb`. That is why I Fits I Sits and Kaneva need no `thumbWide` at all —
 * their `hero` is already an image suited to either shape.
 *
 * An `art` hero has no picture by design (#49) and returns `undefined`; each
 * caller has its own stand-in.
 *
 * Step 3 used to glob `poster.jpg` off disk by slug, which was the right answer
 * while nothing named the poster in front matter — *"adding a project is one
 * Markdown file"*. `poster` is a required field on a video hero now (#273), so
 * the glob became a SECOND source for one picture: set a hero poster and the
 * tile would still have shown whatever `poster.jpg` happened to be sitting
 * beside it. That is the drift this model exists to rule out, so the glob is
 * gone and both read the same field.
 *
 * **No `aspect` default, deliberately.** `projectThumb()` keeps `'square'` for
 * its Astro callers; a script asking for a share card states its shape out loud.
 */
export function thumbSource<T>(data: ThumbFields<T>, aspect: 'square' | 'wide'): T | undefined {
  const { thumb, thumbWide, hero } = data;
  const override = aspect === 'wide' ? thumbWide : thumb;
  if (override) return override;
  if (hero?.type === 'image') return hero.src;
  if (hero?.type === 'youtube') return hero.poster.src;
  return undefined;
}
