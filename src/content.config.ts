import { defineCollection, reference, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
// Astro 7 ships Zod 4 and deprecates the `z` re-export from `astro:content`.
import { z } from 'astro/zod';

/**
 * CONTENT MODEL — the contract the whole site is built on.
 *
 * Two rules drive every decision in this file:
 *
 *  1. Adding a project or a job is *one Markdown file*. Never a layout change,
 *     never a hand-maintained index, never a second place to update.
 *  2. Facts live in exactly one place. The resume page (Phase 4), the site bio,
 *     and the project pages all read from these collections, so they cannot
 *     drift apart the way the old site did — where four separate pages each
 *     described the Marvel game as "upcoming" and all four went stale together.
 *
 * A third rule falls out of the first two: mistakes the old site made should be
 * *unrepresentable* here, not merely fixed. Hence YouTube-by-ID (no protocol to
 * get wrong), `image()`-validated media (no silently broken <img>), and the
 * draft/published completeness split below.
 */

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

/**
 * `YYYY` or `YYYY-MM`. Never days — nobody puts days on a resume.
 *
 * Mixed precision is deliberate: the 2019 resume records employment as bare
 * years ("2016 – 2019") and that is genuinely all we know for the older roles.
 * Forcing `YYYY-MM` here would mean inventing months, which is exactly the kind
 * of quiet fiction a single-source-of-truth model is supposed to prevent.
 * Upgrade an entry to month precision when a real source confirms the month.
 *
 * String ordering still works across precisions ("2015" < "2015-06" < "2016").
 */
const datePart = z
  .string()
  .regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, 'Expected YYYY or YYYY-MM (e.g. "2019" or "2019-07")');

/** Earliest plausible year for anything on this site. Catches typo'd years. */
const EARLIEST_YEAR = 2008;
const year = z
  .number()
  .int()
  .min(EARLIEST_YEAR)
  .max(new Date().getFullYear() + 1);

/**
 * An outbound link. `dead: true` records that we *know* the target is gone —
 * the old site linked firefall.com, kaneva.com and argamestudio.org for years
 * after they went dark. Components render dead links as plain text, so the
 * credit survives without the broken promise.
 *
 * Check the Wayback Machine before reaching for `dead: true` on a citation
 * worth keeping clickable — e.g. a press writeup that corroborates a credit,
 * as opposed to a store listing or a site's own homepage, where the fact of
 * its having existed isn't the point. If a snapshot renders the real page,
 * use it as `url` (append " (via Wayback Machine)" to `label`) instead of
 * marking the link dead. See secret-garden.md.
 */
const link = z.object({
  label: z.string().min(1),
  url: z.url(),
  kind: z.enum(['store', 'play', 'video', 'source', 'press', 'jam', 'site']),
  dead: z.boolean().default(false),
});

/**
 * Media. A discriminated union rather than a loose `{ src, type }` bag, so the
 * renderer always knows exactly which fields it has.
 *
 * YouTube is stored as a bare 11-character video ID, never a URL. The old site
 * had five `http://` YouTube iframes that every modern browser blocks as mixed
 * content; storing the ID means the embed URL is built by the component and the
 * whole class of bug cannot come back.
 *
 * Images go through Astro's `image()` helper: the path is resolved and
 * validated at build time, so a renamed or missing file fails CI instead of
 * shipping a broken <img>. `alt` is required — not optional-with-a-lint-rule.
 */
const mediaSchema = (image: SchemaContext['image']) =>
  z.discriminatedUnion('type', [
    z.object({
      type: z.literal('image'),
      src: image(),
      alt: z.string().min(1),
      caption: z.string().optional(),
    }),
    z.object({
      type: z.literal('youtube'),
      id: z.string().regex(/^[\w-]{11}$/, 'Expected a bare 11-char YouTube video ID, not a URL'),
      title: z.string().min(1),
      /** Start offset in seconds, for videos where the relevant bit is buried. */
      start: z.number().int().nonnegative().optional(),
    }),
  ]);

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        /** Used where the full title doesn't fit — cards, nav, breadcrumbs. */
        shortTitle: z.string().min(1).optional(),

        /**
         * Two tiers, decided up front (see CLAUDE.md):
         *  - `featured` — a real write-up. Problem, what was built, what was learned.
         *  - `archive`  — title, year, engine, one line, and at most a short
         *                 body. Framed as history, not as a portfolio pitch.
         *
         * The archive tier was summary-only through Phase 3, which made every
         * one of its detail pages a card with a bigger image on it. Settled
         * 2026-08-24 (#97): an archive entry may carry a short body and a
         * `gallery` where there is material worth having. This is a guideline
         * calibrated to what most archive entries are — early student and jam
         * work that doesn't need much — not a hard cap. See CLAUDE.md: a
         * richer entry demoted into this tier later (Kaneva, eventually)
         * isn't meant to be trimmed to fit it.
         */
        tier: z.enum(['featured', 'archive']),
        /** Manual ordering within the featured tier. Required for featured. */
        featureOrder: z.number().int().positive().optional(),

        startYear: year,
        /** Omit for single-year projects. */
        endYear: year.optional(),

        /**
         * Honest framing is a stated goal for the archive tier — a 48-hour jam
         * entry and a shipped commercial title should not look alike.
         */
        status: z.enum(['shipped', 'prototype', 'jam', 'coursework', 'unannounced']),

        /** One line, used verbatim on cards and in the archive list. */
        summary: z.string().min(1).max(220).optional(),

        /** Game engines. May be empty for bare-metal targets (GBA, Atari 2600). */
        engine: z.array(z.string()).default([]),
        /** Languages, libraries, notable tools. */
        tech: z.array(z.string()).default([]),
        platforms: z.array(z.string()).default([]),

        /** Ali's role, in her words. "Lead UI Programmer", not "Contributor". */
        role: z.string().min(1).optional(),
        teamSize: z.number().int().positive().optional(),
        collaborators: z
          .array(z.object({ name: z.string().min(1), url: z.url().optional() }))
          .default([]),

        /**
         * Professional work points at the job it was done under, rather than
         * repeating a company name that could drift. Jam and school work uses
         * `event` instead.
         *
         * It renders on the `/projects` grid cards, not just the detail page,
         * so format matters at a glance across a twelve-entry archive.
         * Standardized 2026-08-24: `Georgia Tech` always leads, followed by at
         * most one `, <short descriptor>` for the specific lab, studio, or
         * course — never "at Georgia Tech", never a chained multi-level org
         * name (`Synaesthetic Media Lab, GVU Center, Georgia Tech` measured out
         * 20px taller than its row-mates on the archive grid before this).
         * `Georgia Tech` bare is a correct, unforced answer when there's no
         * subsection worth naming.
         */
        job: reference('jobs').optional(),
        event: z.string().min(1).optional(),

        links: z.array(link).default([]),
        hero: mediaSchema(image).optional(),
        gallery: z.array(mediaSchema(image)).default([]),

        /**
         * An explicit override for the card/tile thumbnail. **Optional on
         * purpose, and usually absent** — `projectThumb()` in src/lib/content.ts
         * derives a thumbnail with no front matter at all: an image `hero` is
         * its own thumbnail, and a YouTube `hero` uses the poster frame
         * committed alongside it by scripts/fetch-posters.mjs.
         *
         * So this field exists for exactly one job: swapping in a better
         * picture later without touching the hero or the layout. A YouTube
         * poster frame is whatever the uploader chose; when a real capture
         * turns up, it lands here and nothing else changes.
         *
         * No `alt` beside it, which is deliberate rather than an oversight —
         * see the note on `projectThumb()`. A thumbnail inside a card whose
         * link text is already the project title is decorative, and giving it
         * alt text makes a screen reader announce the title twice.
         */
        thumb: image().optional(),

        /**
         * The same override as `thumb`, for a 16:9 context instead of a
         * square one (#64). Optional and usually absent for the same reason
         * `thumb` is: `projectThumb()` in src/lib/content.ts falls back to
         * the hero image or its poster frame when this isn't set, so most
         * projects need nothing here at all.
         */
        thumbWide: image().optional(),

        /**
         * Draft entries render in `astro dev` and on preview deploys, and are
         * excluded from the production build. Every project seeded in Phase 2
         * is a draft: the metadata is real, the prose is Phase 3's job.
         */
        draft: z.boolean().default(false),
      })
      .superRefine((data, ctx) => {
        if (data.endYear !== undefined && data.endYear < data.startYear) {
          ctx.addIssue({
            code: 'custom',
            path: ['endYear'],
            message: `endYear (${data.endYear}) is before startYear (${data.startYear})`,
          });
        }

        if (data.tier === 'featured' && data.featureOrder === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: ['featureOrder'],
            message: 'featured projects need a featureOrder to place them on the projects page',
          });
        }

        // Completeness is enforced at publish time, not at draft time. This is
        // what "done" means for a project page, expressed as a build error
        // rather than as a note in a doc that nobody reads.
        if (!data.draft) {
          for (const field of ['summary', 'role'] as const) {
            if (data[field] === undefined) {
              ctx.addIssue({
                code: 'custom',
                path: [field],
                message: `published projects require "${field}" (set draft: true while it is unfinished)`,
              });
            }
          }
          if (!data.hero) {
            ctx.addIssue({
              code: 'custom',
              path: ['hero'],
              message: 'published projects require a hero image or video',
            });
          }
        }
      }),
});

// ---------------------------------------------------------------------------
// Jobs — the single source for the site bio AND the Phase 4 resume
// ---------------------------------------------------------------------------

/**
 * One resume bullet: a short topic label and the clause it introduces.
 *
 * Settled 2026-08-26 (#32). Ali's own 2019 resume built every bullet this way
 * -- a short topic label, a colon, then a clipped formal clause ("Vegas Blvd
 * Slots:", "UI Programming:", "Client Engineering:"). The formality pass
 * restored it, so the format is recovered from
 * `resources/WallickAli-Resume.pdf` rather than invented. Same argument the
 * Phase 5 palette revival ran on: a format Ali chose herself cannot be
 * mistaken for a template.
 *
 * Structural rather than `**Markdown**` inside the string, for two reasons.
 * Bullets render as `{h}` in ResumeDocument.astro and never touch a Markdown
 * pipeline, so `**` would print literally on paper. And a *required* field
 * makes the format unrepresentable to get wrong -- a bullet cannot quietly
 * revert to unlabelled prose the way a convention in a style guide can. Same
 * reasoning as `resumeTools` being a `Record` keyed by category, where a tool
 * cannot be added without classifying it (src/config/resume.ts).
 *
 * `max(28)` on the label is the guard that does the real work. A label is a
 * topic, not a sentence. The moment it starts carrying a clause, the document
 * is drifting back toward the 20-words-per-sentence prose register that #32
 * measured and removed, and this fails the build instead.
 */
const resumeBullet = z.object({
  label: z
    .string()
    .min(1)
    .max(28, 'a bullet label is a topic, not a clause -- keep it under 28 characters'),
  text: z.string().min(1),
  /**
   * Continuation shown only on `/resume/full`, appended to `text`.
   *
   * Added 2026-08-26 (#32) for the case where one topic wants a short form on
   * the one-pager and a fuller one on the two-pager -- Kaneva's UI programming
   * bullet, and Firefall's, where the enumeration of specific screens is worth
   * having on the long version and costs a third line on the short one.
   *
   * **This is the one shape that gets that without breaking the superset
   * invariant**, which is why it is a continuation and not an override. The
   * tempting alternative is a `highlightsConcise` that *replaces* `highlights`
   * on the one-pager, and it is precisely the two-lists shape `highlightsExtended`
   * below exists to rule out: two copies of one claim, free to drift, which is
   * how the old site called the Marvel game "upcoming" on four pages at once.
   * Here the long version is still literally the short one plus more, and each
   * fact is still written exactly once.
   *
   * So: `extended` must *continue* `text`, never restate or contradict it. If
   * the short and long versions of a bullet would need to say different things
   * rather than one saying more, that is two bullets, not this field.
   */
  extended: z.string().min(1).optional(),
  /**
   * Key into the owning job's `bulletGroups`, which renders this bullet under a
   * bold sub-heading instead of directly under the job.
   *
   * Added 2026-08-26 (#32) for Second Dinner, which is two bodies of work under
   * one employer -- Marvel Snap and the Godot project -- and read as one
   * undifferentiated list of seven bullets without this.
   *
   * A key, not the display string. Repeating "Marvel Snap" on six bullets is
   * six chances to typo one into a group of its own; `superRefine` below
   * rejects a key that isn't declared, so the failure is a build error rather
   * than a stray heading nobody notices on page two.
   */
  group: z.string().min(1).optional(),
});

const jobs = defineCollection({
  loader: glob({ base: './src/content/jobs', pattern: '**/*.md' }),
  schema: z
    .object({
      company: z.string().min(1),
      /**
       * No `companyUrl`. It was removed 2026-08-27 (#128, item 11) having
       * never been rendered by anything -- the same call as dropping `tech`
       * for #39 and `summary` for #141, and for the same reason: a field with
       * no reader is the dead data this model's guard table exists to rule
       * out, and it rots silently because nothing fails when it goes wrong.
       *
       * The two URLs it held were not lost with it -- both companies are
       * reachable from the project pages' own `links[]`, which is where an
       * outbound link belongs, next to the credit it supports.
       *
       * **Don't reinstate it speculatively.** If #106 (JSON-LD, schema.org
       * `Person.worksFor`) eventually wants an organization URL, add it back
       * then, with the consumer in the same commit.
       */
      location: z.string().min(1),

      start: datePart,
      /** Omit for the current job. Exactly one job may omit it. */
      end: datePart.optional(),

      /**
       * Title progression, oldest first. Kaneva went Technical Support Engineer
       * → Lead UI Programmer over four years; a single `title` field would
       * throw that away, and it is exactly the kind of thing a resume wants.
       * The last entry is the title displayed by default.
       */
      roles: z
        .array(z.object({ title: z.string().min(1), start: datePart }))
        .nonempty('at least one role'),

      /**
       * The "currently" line — required when `end` is omitted (the current
       * job). Read by the homepage lede and the About intro via
       * `getCurrentNote()`, so there is exactly one place to edit this fact.
       * Self-dating by construction ("Since 2024, ...") rather than a
       * separate "as of" field.
       */
      currentNote: z.string().min(1).max(280).optional(),
      /**
       * A company-level paragraph, rendered under the job head and above every
       * bullet, with no bullet marker of its own.
       *
       * For the fact that belongs to the employer rather than to any one thing
       * built there -- Second Dinner's "joined as the eleventh employee". That
       * sentence spent Phase 4 riding on the front of a Marvel Snap bullet,
       * where it was true and misfiled: it is not a Marvel Snap fact.
       *
       * One short paragraph. If it needs a second one it is probably a bullet.
       */
      intro: z.string().min(1).max(280).optional(),

      /**
       * Bold sub-headings that bullets group under, keyed by the string a
       * bullet's `group` names. Declaration order is not display order --
       * `ResumeDocument` orders groups by where each first appears in the
       * bullet list, so reordering the resume is a matter of moving bullets.
       *
       * `dates` and `intro` are optional and are the reason this is an object
       * rather than a bare `Record<string, string>`: under one employer for seven years,
       * "which years was that" is the question a reader actually has, and the
       * job's own span cannot answer it for either half.
       *
       * **`dates` renders on `/resume/full` only** (Ali's call, #32) -- the one-pager
       * has the job's own span directly overhead, and a second date column
       * under it reads as clutter at that density. Recorded here regardless,
       * the same shape as `honors` on education: it also feeds
       * `docs/LINKEDIN.md`, which prints it in the group heading. `intro`
       * renders on both densities.
       */
      bulletGroups: z
        .record(
          z.string().min(1),
          z.object({
            label: z
              .string()
              .min(1)
              .max(40, 'a group heading names a body of work -- keep it under 40 characters'),
            dates: z.string().min(1).optional(),
            /**
             * One clipped line under the heading, before the group's bullets.
             * Same role at the group level that `intro` plays at the job level:
             * what belongs to the whole body of work rather than to any one
             * bullet of it.
             *
             * Added 2026-08-26 (#32) for Marvel Snap, where five years of
             * bullets each described a system and none of them said she was on
             * the title for its whole arc. That is a fact about the span, not
             * about a system, so it had nowhere to live.
             *
             * Capped shorter than the job-level `intro` on purpose: this sits
             * between a heading and a bullet list, and a second paragraph there
             * stops reading as a subtitle.
             */
            intro: z
              .string()
              .min(1)
              .max(
                180,
                'a group intro is a subtitle, not a paragraph -- keep it under 180 characters',
              )
              .optional(),
          }),
        )
        .default({}),

      /** Resume bullets for the one-page resume, strongest first. */
      highlights: z.array(resumeBullet).default([]),
      /**
       * Extra bullets that only the two-page resume shows, appended after
       * `highlights` rather than replacing them.
       *
       * Phase 4 wanted both a one-page and a two-page resume, and the obvious
       * way to get that — two lists, or two documents — is the same shape that
       * let the old site call the Marvel game "upcoming" on four pages at once.
       * A superset cannot disagree with itself: the long version is *literally*
       * the short one plus these, so trimming for space can never silently
       * change what a bullet claims. Put a fact in exactly one array.
       */
      highlightsExtended: z.array(resumeBullet).default([]),

      /** Some roles earn a line on the resume but not a paragraph on the site. */
      onResume: z.boolean().default(true),
      onSite: z.boolean().default(true),
    })
    .superRefine((data, ctx) => {
      if (data.end !== undefined && data.end < data.start) {
        ctx.addIssue({
          code: 'custom',
          path: ['end'],
          message: `end (${data.end}) is before start (${data.start})`,
        });
      }
      for (const [i, role] of data.roles.entries()) {
        if (role.start < data.start) {
          ctx.addIssue({
            code: 'custom',
            path: ['roles', i, 'start'],
            message: `role start (${role.start}) is before the job start (${data.start})`,
          });
        }
      }
      if (data.end === undefined && data.currentNote === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['currentNote'],
          message:
            'the current job (no `end`) requires `currentNote` for the homepage/About "currently" line',
        });
      }

      // Bullet groups: three guards, each closing a way this could go quietly
      // wrong rather than loudly. A resume is printed to PDF by a build step
      // nobody watches, so "renders oddly on page two" is not a failure mode
      // that reaches anyone in time.
      const groupKeys = new Set(Object.keys(data.bulletGroups));
      const usedKeys = new Set<string>();
      let grouped = 0;
      let ungrouped = 0;

      for (const list of ['highlights', 'highlightsExtended'] as const) {
        for (const [i, bullet] of data[list].entries()) {
          if (bullet.group === undefined) {
            ungrouped++;
            continue;
          }
          grouped++;
          usedKeys.add(bullet.group);
          if (!groupKeys.has(bullet.group)) {
            ctx.addIssue({
              code: 'custom',
              path: [list, i, 'group'],
              message: `unknown bullet group "${bullet.group}" -- declare it in \`bulletGroups\` (have: ${[...groupKeys].join(', ') || 'none'})`,
            });
          }
        }
      }

      // All or nothing within a job. A single ungrouped bullet among grouped
      // ones renders above the first heading, where it reads as belonging to
      // whichever heading follows it — the one arrangement that states
      // something false. `intro` is the supported way to say something at the
      // job level.
      if (grouped > 0 && ungrouped > 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['highlights'],
          message: `${ungrouped} bullet(s) have no \`group\` while ${grouped} do -- group every bullet on a job or none of them, and put job-level prose in \`intro\``,
        });
      }

      for (const key of groupKeys) {
        if (!usedKeys.has(key)) {
          ctx.addIssue({
            code: 'custom',
            path: ['bulletGroups', key],
            message: `bullet group "${key}" is declared and never used -- delete it or point a bullet at it`,
          });
        }
      }
    }),
});

// ---------------------------------------------------------------------------
// Education — small, but the resume needs it from the same place
// ---------------------------------------------------------------------------

const education = defineCollection({
  loader: glob({ base: './src/content/education', pattern: '**/*.md' }),
  schema: z.object({
    school: z.string().min(1),
    degree: z.string().min(1),
    field: z.string().min(1),
    location: z.string().min(1),
    /** Often unknown and rarely printed — a degree line is usually just its year. */
    start: datePart.optional(),
    end: datePart,
    /** Phase 4 decides what stays. Recording them is not the same as showing them. */
    honors: z.array(z.string()).default([]),
    onResume: z.boolean().default(true),
  }),
});

export const collections = { projects, jobs, education };
